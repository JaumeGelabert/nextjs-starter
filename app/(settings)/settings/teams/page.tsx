"use client";

import { columns } from "@/components/settings/teams/columns";
import { DataTable } from "@/components/settings/teams/DataTable";
import { authClient } from "@/lib/auth-client";
import { useCallback, useEffect, useState, useTransition } from "react";

export default function TeamsPage() {
  const [, startTransition] = useTransition();
  const [orgTeams, setOrgTeams] = useState([]);
  const { data: activeOrganization } = authClient.useActiveOrganization();

  const getTeams = useCallback(() => {
    startTransition(async () => {
      await authClient.organization.listTeams(
        {},
        {
          onSuccess: ({ data }) => {
            console.log("data", data);
            // Filter out teams that have the same name as the organization (default teams)
            const filteredTeams = data.filter(
              (team: { id: string; name: string }) =>
                team.name !== activeOrganization?.name
            );
            setOrgTeams(filteredTeams);
          }
        }
      );
    });
  }, [startTransition, activeOrganization?.name]);

  useEffect(() => {
    getTeams();
  }, [getTeams]);

  return (
    <div className="flex flex-col justify-start items-start gap-8">
      <p className="font-semibold text-xl">Teams</p>
      <div className="flex flex-col justify-start items-start gap-2 w-full">
        <DataTable columns={columns} data={orgTeams} />
        {/* {orgTeams.map((team: { id: string; name: string }) => (
          <div key={team.id}>{team.name}</div>
        ))} */}
      </div>
    </div>
  );
}
