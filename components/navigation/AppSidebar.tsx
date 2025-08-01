"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupAction,
  SidebarGroupContent,
  SidebarGroupLabel
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./TeamSwitcher";
import { authClient } from "@/lib/auth-client";
import { PlusIcon } from "lucide-react";

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
        {/* Team Section */}
        <SidebarGroup>
          <SidebarGroupLabel>Management</SidebarGroupLabel>
          <SidebarGroupContent />
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
