"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import CreateTeamForm from "./CreateTeamForm";
import { useState } from "react";

export default function CreateTeamModal({
  children
}: {
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create a new team</DialogTitle>
          <DialogDescription>
            A new team will be added to your current organization.
          </DialogDescription>
        </DialogHeader>
        <CreateTeamForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
}
