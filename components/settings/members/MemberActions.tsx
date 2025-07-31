"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu";
import { EllipsisVerticalIcon, UsersIcon } from "lucide-react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

import { toast } from "sonner";
import { useMutation } from "convex/react";

interface MemberActionsProps {
  memberId: string;
  memberName: string;
}

export default function MemberActions({
  memberId,
  memberName
}: MemberActionsProps) {
  const teams = useQuery(api.auth.getTeamsWithMembers, {});
  const addMemberToTeam = useMutation(api.auth.addMemberToTeam);

  const handleTeamSelect = async (teamId: string, teamName: string) => {
    if (!memberId) {
      toast.error("No member selected");
      return;
    }

    try {
      console.log("Adding member to team", memberId, teamId);
      await addMemberToTeam({
        memberId: memberId,
        teamId: teamId
      });

      toast.success(
        `Successfully added ${memberName || "member"} to ${teamName}`
      );
    } catch (error) {
      toast.error(`Failed to add ${memberName || "member"} to ${teamName}`);
      console.error("Error adding team member:", error);
    }
  };

  console.log("TEAMS", teams);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="p-0 w-fit">
        <EllipsisVerticalIcon className="w-4 h-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem>
          <p>Invite</p>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuSub>
          <DropdownMenuSubTrigger>
            <UsersIcon className="w-4 h-4 mr-2" />
            Add to Team
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            {teams && teams.length > 0 ? (
              teams.map((team) => (
                <DropdownMenuItem
                  key={team.id}
                  onClick={() => handleTeamSelect(team.id, team.name)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{team.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">
                      {team.members} members
                    </span>
                  </div>
                </DropdownMenuItem>
              ))
            ) : (
              <DropdownMenuItem disabled>
                <span className="text-muted-foreground">
                  No teams available
                </span>
              </DropdownMenuItem>
            )}
          </DropdownMenuSubContent>
        </DropdownMenuSub>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
