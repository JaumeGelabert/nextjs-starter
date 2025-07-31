"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
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
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { authClient } from "@/lib/auth-client";
import CreateTeamModal from "../team/CreateTeamModal";
import { useEffect, useState, useTransition } from "react";
import { useActiveTeam } from "@/hooks/use-active-team";
import { toast } from "sonner";
import CreateOrgModal from "../organization/CreateOrgModal";

export function TeamSwitcher({
  orgName,
  isPending,
  email
}: {
  orgName: string;
  isPending: boolean;
  email: string;
}) {
  const [, startTransition] = useTransition();
  const [orgTeams, setOrgTeams] = useState([]);
  const router = useRouter();
  const { data: activeOrganization } = authClient.useActiveOrganization();
  const { data: organizations } = authClient.useListOrganizations();
  const { activeTeamId, activeTeam } = useActiveTeam();
  const updateActiveTeam = useMutation(api.auth.updateActiveTeam);

  const getOrganizationLogoQuery = useQuery(
    api.files.image.getOrganizationLogo,
    activeOrganization?.name ? {} : "skip"
  );

  const getTeams = () => {
    startTransition(async () => {
      await authClient.organization.listTeams(
        {},
        {
          onSuccess: ({ data }) => {
            console.log("data", data);
            setOrgTeams(data);
          }
        }
      );
    });
  };

  const handleTeamClick = async (teamId: string) => {
    try {
      await updateActiveTeam({ teamId });
      toast.success("Team switched successfully");
    } catch (error) {
      console.error("Error switching team:", error);
      toast.error("Failed to switch team");
    }
  };

  useEffect(() => {
    getTeams();
  }, []);

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
                        alt="Organization logo"
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
                        {activeTeam ? activeTeam.name : email}
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
            <DropdownMenuLabel>Organizations</DropdownMenuLabel>
            {organizations?.map((organization) => (
              <DropdownMenuItem key={organization.id}>
                {organization.name}
              </DropdownMenuItem>
            ))}
            <CreateOrgModal>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add new organization
              </DropdownMenuItem>
            </CreateOrgModal>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/settings/members")}>
              Manage members
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            <DropdownMenuSeparator />
            {orgTeams.length ? (
              orgTeams.map((team: { id: string; name: string }) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => handleTeamClick(team.id)}
                  className={activeTeamId === team.id ? "bg-accent" : ""}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{team.name}</span>
                    {activeTeamId === team.id && (
                      <span className="text-xs text-muted-foreground">
                        Active
                      </span>
                    )}
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <div className="p-2 bg-zinc-50 rounded text-xs text-pretty text-muted-foreground">
                {orgName} has no teams yet.
              </div>
            )}
            <CreateTeamModal>
              <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                Add team
              </DropdownMenuItem>
            </CreateTeamModal>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
