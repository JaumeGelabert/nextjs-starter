"use client";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { InviteUsersOnboardingForm } from "@/schemas/InviteUsersOnboardingForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import z from "zod";

export default function InviteForm() {
  const form = useForm<z.infer<typeof InviteUsersOnboardingForm>>({
    resolver: zodResolver(InviteUsersOnboardingForm),
    defaultValues: {
      users: [
        {
          email: "",
          role: "member"
        },
        {
          email: "",
          role: "member"
        }
      ]
    }
  });

  function onSubmit(values: z.infer<typeof InviteUsersOnboardingForm>) {
    // Filter out users with empty emails
    const usersWithEmails = values.users.filter(
      (user) => user.email && user.email.trim() !== ""
    );

    const finalData = {
      ...values,
      users: usersWithEmails
    };

    console.log("Users to invite:", finalData);
  }

  const MAX_INVITATIONS = 5;

  const addInvitation = () => {
    const currentUsers = form.getValues("users");
    if (currentUsers.length < MAX_INVITATIONS) {
      form.setValue("users", [
        ...currentUsers,
        { email: "", role: "member" as const }
      ]);
    }
  };

  const users = form.watch("users");

  return (
    <div className="w-full">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-2 w-full"
        >
          <FormField
            control={form.control}
            name="users"
            render={() => (
              <FormItem>
                <div className="flex flex-row justify-between items-center">
                  <h3 className="font-medium">Email addresses</h3>
                  {users.length < MAX_INVITATIONS && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={addInvitation}
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add invitation
                    </Button>
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            {users.map((_, index) => (
              <div key={index} className="flex gap-2 items-start">
                <div className="flex-1 space-y-2">
                  <FormField
                    control={form.control}
                    name={`users.${index}.email`}
                    render={({ field }) => (
                      <FormItem>
                        <FormControl>
                          <Input
                            placeholder="user@email.com"
                            type="email"
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        {field.value && field.value.trim() !== "" && (
                          <FormMessage />
                        )}
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name={`users.${index}.role`}
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Member" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            ))}
          </div>

          <div className="flex justify-start pt-4">
            <Button type="submit" className="px-8">
              Finish
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
