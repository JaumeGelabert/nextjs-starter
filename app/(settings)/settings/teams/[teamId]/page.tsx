"use client";

import { useParams } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import UpdateTeamForm from "@/components/settings/teams/UpdateTeamForm";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/DataTable";
import { columns } from "@/components/settings/teams/singleTeam/columns";

export default function TeamPage() {
  const { teamId } = useParams();
  const team = useQuery(api.teams.getTeam, { teamId: teamId as string });

  return (
    <div className="flex flex-col justify-start items-start gap-8">
      <p className="font-semibold text-xl">{team?.name}</p>
      <div className="flex flex-col justify-start items-start gap-2 w-full">
        <UpdateTeamForm teamId={teamId as string} teamName={team?.name ?? ""} />
      </div>
      <Separator />
      <div className="flex flex-col justify-start items-start gap-2 w-full">
        <p className="font-medium">Members</p>
        <div className="flex flex-col justify-start items-start gap-2 w-full">
          <DataTable columns={columns} data={team?.members ?? []} />
        </div>
      </div>
    </div>
  );
}
