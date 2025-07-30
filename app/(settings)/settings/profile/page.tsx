"use client";

import LeaveWorkspaceModal from "@/components/settings/LeaveWorkspaceModal";
import PersonalDetailsForm from "@/components/settings/PersonalDetailsForm";
import { Separator } from "@/components/ui/separator";
import { authClient } from "@/lib/auth-client";

export default function ProfilePage() {
  const { data: session, isPending } = authClient.useSession();
  const { data: member } = authClient.useActiveMember();

  return (
    <div className="flex flex-col justify-start items-start gap-8">
      <p className="font-semibold text-xl">Profile</p>
      <div className="flex flex-col justify-start items-start gap-2 w-full">
        <p className="font-medium">Personal details</p>
        <PersonalDetailsForm
          isPending={isPending}
          name={session?.user?.name ?? ""}
          email={session?.user?.email ?? ""}
          imageUrl={session?.user?.image ?? ""}
        />
      </div>
      <Separator />
      <div className="w-full">
        <p className="font-medium">Workspace access</p>
        <div className="w-full flex flex-row justify-between items-center">
          <p className="text-sm text-muted-foreground">
            Remove yourself from the workspace
          </p>
          <LeaveWorkspaceModal orgId={member?.organizationId} />
        </div>
      </div>
    </div>
  );
}
