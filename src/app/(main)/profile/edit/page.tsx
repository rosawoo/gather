import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getUsedNeighborhoods } from "@/lib/neighborhoods";
import { redirect } from "next/navigation";
import { PageHeader } from "@/components/ui/page-header";
import { EditProfileForm } from "@/components/edit-profile-form";

export default async function EditProfilePage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      profile: true,
      photos: { orderBy: { sortOrder: "asc" } },
      promptAnswers: true,
    },
  });
  if (!user?.profile) redirect("/onboarding/profile");

  const p = user.profile;
  const dob = p.dateOfBirth.toISOString().slice(0, 10);
  const usedNeighborhoods = await getUsedNeighborhoods();
  const initialPhotoUrls = user.photos.map((ph) => ph.url);

  return (
    <div className="pb-10">
      <PageHeader
        title="Edit profile"
        subtitle="Update how you show up to hosts and guests."
      />

      <EditProfileForm
        usedNeighborhoods={usedNeighborhoods}
        photoUrls={initialPhotoUrls}
        promptAnswers={user.promptAnswers}
        defaults={{
          firstName: p.firstName,
          dateOfBirth: dob,
          neighborhood: p.neighborhood ?? "",
          college: p.college ?? "",
          job: p.job ?? "",
          bio: p.bio ?? "",
        }}
      />
    </div>
  );
}
