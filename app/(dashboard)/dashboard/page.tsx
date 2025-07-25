"use client";

import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();
  const handleLogout = async () => {
    await authClient.signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login"); // redirect to login page
        }
      }
    });
  };
  const { data: organizations } = authClient.useListOrganizations();
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const handleSetActiveOrganization = async (organizationId: string) => {
    await authClient.organization.setActive({
      organizationId: organizationId
    });
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <div className="flex flex-col gap-4">
        {organizations?.map((organization) => (
          <div
            key={organization.id}
            onClick={() => handleSetActiveOrganization(organization.id)}
          >
            {organization.name}
          </div>
        ))}
      </div>

      <p>ACTIVE ORGANIZATION: {activeOrganization?.name}</p>
      <Button onClick={handleLogout}>Log out</Button>
    </div>
  );
}
