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

type Fields = {
  firstName: string;
  dateOfBirth: string;
  neighborhood: string;
  college: string;
  job: string;
  bio: string;
};

const emptyFields: Fields = {
  firstName: "",
  dateOfBirth: "",
  neighborhood: "",
  college: "",
  job: "",
  bio: "",
};

export function OnboardingProfileForm({
  usedNeighborhoods,
}: {
  usedNeighborhoods: string[];
}) {
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [fields, setFields] = useState<Fields>(emptyFields);
  const [locationKey, setLocationKey] = useState(0);
  const [photoBlockKey, setPhotoBlockKey] = useState(0);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

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
            const rawPhotos = String(fd.get("photoUrls") ?? "").trim();
            const restoredPhotos = rawPhotos
              .split(/[\n,]/)
              .map((s) => s.trim())
              .filter(Boolean);
            setFields({
              firstName: String(fd.get("firstName") ?? "").trim(),
              dateOfBirth: String(fd.get("dateOfBirth") ?? "").trim(),
              neighborhood: String(fd.get("neighborhood") ?? "").trim(),
              college: String(fd.get("college") ?? "").trim(),
              job: String(fd.get("job") ?? "").trim(),
              bio: String(fd.get("bio") ?? "").trim(),
            });
            setPhotoUrls(restoredPhotos);
            setPhotoBlockKey((k) => k + 1);
            setLocationKey((k) => k + 1);
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
            value={fields.firstName}
            onChange={(e) =>
              setFields((f) => ({ ...f, firstName: e.target.value }))
            }
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="Date of birth" hint="Must be 21 or older." required>
          <input
            name="dateOfBirth"
            type="date"
            required
            value={fields.dateOfBirth}
            onChange={(e) =>
              setFields((f) => ({ ...f, dateOfBirth: e.target.value }))
            }
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Profile photo (optional)"
        hint="Add a face—or skip for now and upload later from your profile. First photo becomes your portrait."
      >
        <PhotoUpload key={photoBlockKey} initialUrls={photoUrls} />
      </ProfileFieldGroup>

      <ProfileFieldGroup title="Optional">
        <ProfileField label="Neighborhood">
          <NeighborhoodInput
            key={`hood-${locationKey}`}
            name="neighborhood"
            defaultValue={fields.neighborhood}
            extras={usedNeighborhoods}
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="College">
          <input
            name="college"
            placeholder="Where'd you go?"
            value={fields.college}
            onChange={(e) =>
              setFields((f) => ({ ...f, college: e.target.value }))
            }
            className={profileInputCls}
          />
        </ProfileField>
        <ProfileField label="Job">
          <input
            name="job"
            placeholder="What do you do?"
            value={fields.job}
            onChange={(e) => setFields((f) => ({ ...f, job: e.target.value }))}
            className={profileInputCls}
          />
        </ProfileField>
      </ProfileFieldGroup>

      <ProfileFieldGroup
        title="Bio"
        hint="Introduce yourself. What should people know?"
      >
        <textarea
          name="bio"
          required
          rows={4}
          value={fields.bio}
          onChange={(e) => setFields((f) => ({ ...f, bio: e.target.value }))}
          className={profileInputCls}
        />
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
