"use client";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton
} from "@/components/ui/sidebar";
import {
  ArrowLeftIcon,
  BuildingIcon,
  CreditCardIcon,
  Settings2Icon,
  UserIcon,
  UsersIcon
} from "lucide-react";
import Link from "next/link";

export function SettingsSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="p-2">
        <SidebarHeader className="w-fit">
          <Link
            href="/dashboard"
            className="flex items-center justify-start flex-row gap-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeftIcon className="size-3" />
            <span className="text-xs font-medium">Back to app</span>
          </Link>
        </SidebarHeader>
        <SidebarGroup>
          <SidebarGroupLabel>Settings</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton className="group/profile" asChild>
              <Link href="/settings/profile">
                <UserIcon className="text-muted-foreground group-hover/profile:text-foreground transition-colors" />
                Profile
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton className="group/settings" asChild>
              <Link href="/settings/preferences">
                <Settings2Icon className="text-muted-foreground group-hover/settings:text-foreground transition-colors" />
                Preferences
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Administration</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuButton className="group/organization" asChild>
              <Link href="/settings/organization">
                <BuildingIcon className="text-muted-foreground group-hover/organization:text-foreground transition-colors" />
                Organization
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton className="group/members" asChild>
              <Link href="/settings/members">
                <UsersIcon className="text-muted-foreground group-hover/members:text-foreground transition-colors" />
                Members
              </Link>
            </SidebarMenuButton>
            <SidebarMenuButton className="group/billing" asChild>
              <Link href="/settings/billing">
                <CreditCardIcon className="text-muted-foreground group-hover/billing:text-foreground transition-colors" />
                Billing
              </Link>
            </SidebarMenuButton>
          </SidebarMenu>
        </SidebarGroup>
        <SidebarGroup />
      </SidebarContent>
      <SidebarFooter />
    </Sidebar>
  );
}
