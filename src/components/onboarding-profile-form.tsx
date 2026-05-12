"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { completeProfile } from "@/app/actions/profile";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { PersonalityPromptSlots } from "@/components/personality-prompt-slots";
import { PhotoUpload } from "@/components/photo-upload";
import {
  ProfileField,
  ProfileFieldGroup,
  profileInputCls,
} from "@/components/profile-form-fields";

export function OnboardingProfileForm({
  usedNeighborhoods,
}: {
  usedNeighborhoods: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8 pb-16"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            await completeProfile(fd);
          } catch (err) {
            if (isRedirectError(err)) throw err;
            setError(
              err instanceof Error ? err.message : "Something went wrong.",
            );
          }
        });
      }}
    >
      {error ? (
        <p
          className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-800 ring-1 ring-red-200"
          role="alert"
        >
          {error}
        </p>
      ) : null}

      <ProfileFieldGroup title="Basics">
        <ProfileField label="First name" required>
          <input name="firstName" required className={profileInputCls} />
        </ProfileField>
        <ProfileField label="Date of birth" hint="Must be 21 or older." required>
          <input
            name="dateOfBirth"
            type="date"
            required
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Photos (optional)"
        hint="Add a face—or skip for now and upload later from your profile. First photo becomes primary."
      >
        <PhotoUpload />
      </ProfileFieldGroup>

      <ProfileFieldGroup title="Optional">
        <ProfileField label="Neighborhood">
          <NeighborhoodInput
            name="neighborhood"
            extras={usedNeighborhoods}
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="College">
          <input
            name="college"
            placeholder="Where'd you go?"
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="Job">
          <input
            name="job"
            placeholder="What do you do?"
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Bio"
        hint="Introduce yourself. What should people know?"
      >
        <textarea name="bio" required rows={4} className={profileInputCls} />
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Personality prompts"
        hint="Three lines: pick a different question in each dropdown, then write answers for at least two."
      >
        <PersonalityPromptSlots inputClassName={profileInputCls} />
      </ProfileFieldGroup>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Complete profile"}
      </button>
    </form>
  );
}
