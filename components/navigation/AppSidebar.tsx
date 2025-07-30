"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./TeamSwitcher";
import { authClient } from "@/lib/auth-client";

export function AppSidebar() {
  const activeOrg = authClient.useActiveOrganization();
  const { data: user } = authClient.useSession();

  return (
    <Sidebar>
      <SidebarContent className="p-2">
        <TeamSwitcher
          orgName={activeOrg.data?.name ?? ""}
          isPending={activeOrg.isPending}
          email={user?.user.email ?? ""}
        />
        <SidebarGroup />
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
