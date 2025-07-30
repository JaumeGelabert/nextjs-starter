"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";

export function TeamSwitcher({
  orgName,
  isPending,
  email
}: {
  orgName: string;
  isPending: boolean;
  email: string;
}) {
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const getOrganizationLogoQuery = useQuery(
    api.files.image.getOrganizationLogo,
    activeOrganization?.name ? {} : "skip"
  );
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton className="w-full px-1.5 py-0.5 h-fit">
              <div className="flex flex-row justify-between items-center w-full">
                <div className="flex flex-row items-center gap-2">
                  <div className="bg-primary text-primary-foreground flex aspect-square size-8 items-center justify-center rounded-md">
                    {getOrganizationLogoQuery?.url && (
                      <img
                        src={getOrganizationLogoQuery.url}
                        className="size-8"
                      />
                    )}
                  </div>
                  <div>
                    {isPending ? (
                      <Skeleton className="w-10 h-[17px] bg-muted-foreground/10 mb-[1px]" />
                    ) : (
                      <span className="truncate font-medium">{orgName}</span>
                    )}
                    {isPending ? (
                      <Skeleton className="w-20 h-4 bg-muted-foreground/10" />
                    ) : (
                      <p className="text-xs text-muted-foreground truncate">
                        {email}
                      </p>
                    )}
                  </div>
                </div>
              </div>
              <ChevronDown className="opacity-50" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-64 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/settings/members")}>
              Manage members
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
