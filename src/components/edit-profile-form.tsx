"use client";

import { useState, useTransition } from "react";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { updateProfile } from "@/app/actions/profile";
import { NeighborhoodInput } from "@/components/neighborhood-input";
import { PersonalityPromptSlots } from "@/components/personality-prompt-slots";
import { PhotoUpload } from "@/components/photo-upload";
import { MoodBoardEditor } from "@/components/mood-board-editor";
import {
  ProfileField,
  ProfileFieldGroup,
  profileInputCls,
} from "@/components/profile-form-fields";

type PromptAnswer = { promptKey: string; body: string };

export function EditProfileForm({
  defaults,
  usedNeighborhoods,
  photoUrls,
  promptAnswers,
}: {
  defaults: {
    firstName: string;
    dateOfBirth: string;
    neighborhood: string;
    college: string;
    job: string;
    bio: string;
    moodBoardEnabled: boolean;
    moodBoardDecor: string | null;
  };
  usedNeighborhoods: string[];
  photoUrls: string[];
  promptAnswers: PromptAnswer[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <form
      className="space-y-8"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        startTransition(async () => {
          try {
            await updateProfile(fd);
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
          <input
            name="firstName"
            required
            defaultValue={defaults.firstName}
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="Date of birth" hint="Must be 21 or older." required>
          <input
            name="dateOfBirth"
            type="date"
            required
            defaultValue={defaults.dateOfBirth}
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Photos"
        hint="Drop images here or pick from your device. First photo is your primary."
      >
        <PhotoUpload initialUrls={photoUrls} />
      </ProfileFieldGroup>

      <ProfileFieldGroup title="Optional">
        <ProfileField label="Neighborhood">
          <NeighborhoodInput
            name="neighborhood"
            defaultValue={defaults.neighborhood}
            extras={usedNeighborhoods}
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="College">
          <input
            name="college"
            placeholder="Where'd you go?"
            defaultValue={defaults.college}
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="Job">
          <input
            name="job"
            placeholder="What do you do?"
            defaultValue={defaults.job}
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Bio"
        hint="A sentence or two. What are you like around a table?"
      >
        <textarea
          name="bio"
          required
          rows={4}
          defaultValue={defaults.bio}
          className={profileInputCls}
        />
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Mood board (optional)"
        hint="Scatter stickers around your name on your public profile, or keep the classic layout off."
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-gather-teal/25 bg-gather-paper/40 px-3 py-3">
          <input
            type="checkbox"
            name="moodBoardEnabled"
            value="on"
            defaultChecked={defaults.moodBoardEnabled}
            className="mt-0.5 accent-gather-brown"
          />
          <span className="text-sm text-gather-ink">
            <span className="font-semibold">Enable mood board look</span>
            <span className="mt-0.5 block text-xs text-gather-charcoal">
              Name and age stay centered; you add playful emoji orbiters below.
            </span>
          </span>
        </label>
        <MoodBoardEditor initialDecorJson={defaults.moodBoardDecor} />
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Personality prompts"
        hint="Pick a question for each line, then answer at least two."
      >
        <PersonalityPromptSlots
          inputClassName={profileInputCls}
          initialAnswers={promptAnswers.map((a) => ({
            key: a.promptKey,
            body: a.body,
          }))}
        />
      </ProfileFieldGroup>

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-full bg-gather-brown py-3.5 text-sm font-semibold text-gather-cream shadow-sm transition hover:bg-gather-brown-mid active:scale-[0.99] disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
