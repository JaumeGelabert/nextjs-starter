"use client";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { OnboardingProfileFormSchema } from "@/schemas/SaveOnboardingProfileForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import z from "zod";
import ImageSelector from "./ImageSelector";
import { Button } from "@/components/ui/button";

export default function ProfileForm({
  step,
  setStep
}: {
  step: number;
  setStep: (step: number) => void;
}) {
  const form = useForm<z.infer<typeof OnboardingProfileFormSchema>>({
    resolver: zodResolver(OnboardingProfileFormSchema),
    defaultValues: {
      name: "",
      email: "gelabertgalmes98@gmail.com",
      phone: "",
      imageUrl: ""
    }
  });

  // 2. Define a submit handler.
  function onSubmit(values: z.infer<typeof OnboardingProfileFormSchema>) {
    // Do something with the form values.
    // ✅ This will be type-safe and validated.
    console.log(values);
    setStep(step + 1);
  }
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 w-full">
        <ImageSelector />
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="phone"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone</FormLabel>
              <FormControl>
                <Input placeholder="" className="w-full" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel isRequired>Email</FormLabel>
              <FormControl>
                {/* TODO: This email cant be modified since is the one that the user logged in with */}
                <Input placeholder="" disabled className="w-full" {...field} />
              </FormControl>
              <FormMessage />
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
