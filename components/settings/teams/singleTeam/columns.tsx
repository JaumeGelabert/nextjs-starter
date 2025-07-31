"use client";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { ColumnDef } from "@tanstack/react-table";
import { EllipsisIcon, UserMinusIcon } from "lucide-react";

interface Member {
  id: string;
  userId: string;
  email: string;
  name: string;
  image: string;
  role: string;
  organizationId: string;
}

export const columns: ColumnDef<Member>[] = [
  {
    id: "member",
    header: () => <div className="text-left">Name</div>,
    cell: ({ row }) => {
      const member = row.original;
      return (
        <div className="flex flex-row justify-start items-center gap-2">
          {/* TODO: Add image */}
          <span className="w-8 h-8 rounded-full bg-muted" />
          <div className="flex flex-col justify-start items-start">
            <div className="text-left font-medium text-sm">{member.name}</div>
            <div className="text-left font-medium text-xs text-muted-foreground">
              {member.email}
            </div>
          </div>
        </div>
      );
    }
  },
  {
    accessorKey: "role",
    header: () => <div className="text-left">Role</div>,
    cell: ({ row }) => {
      const member = row.original;

      return (
        <div className="text-left text-sm">
          {member.role.slice(0, 1).toUpperCase() +
            member.role.slice(1).toLowerCase()}
        </div>
      );
    }
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <EllipsisIcon className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start">
            <DropdownMenuItem>
              <UserMinusIcon />
              Remove from team
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
  }
];
