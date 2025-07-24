import { z } from "zod";

export const OnboardingProfileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  email: z.string().email(),
  phone: z.string().optional(),
  imageUrl: z.string().optional()
});
