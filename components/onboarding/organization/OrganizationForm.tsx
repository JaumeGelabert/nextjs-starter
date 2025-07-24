"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import { SaveOnboardingOrganizationForm } from "@/schemas/SaveOnboardingOrganizationForm";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import LogoSelector from "./LogoSelector";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export default function OrganizationForm({
  step,
  setStep
}: {
  step: number;
  setStep: (step: number) => void;
}) {
  const form = useForm<z.infer<typeof SaveOnboardingOrganizationForm>>({
    resolver: zodResolver(SaveOnboardingOrganizationForm),
    defaultValues: {
      name: "",
      imageUrl: "",
      exampleData: false
    }
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof SaveOnboardingOrganizationForm>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    setStep(step + 1);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <LogoSelector />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Organization name</FormLabel>
              <FormControl>
                <Input placeholder="Acme Inc." className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="exampleData"
          render={({ field }) => (
            <FormItem className="flex flex-row items-center justify-between">
              <div className="space-y-0.5 mt-4">
                <FormLabel>Example data</FormLabel>
                <FormDescription>
                  Recommended to test the platform.
                </FormDescription>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <Button type="submit" className="w-24 mt-4">
          Continue
        </Button>
      </form>
    </Form>
  );
}
