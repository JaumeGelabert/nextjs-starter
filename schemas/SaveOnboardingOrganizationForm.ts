import z from "zod";

export const SaveOnboardingOrganizationForm = z.object({
  imageUrl: z.string().optional(),
  name: z.string().min(1, { message: "Add a name for your organization" }),
  exampleData: z.boolean().optional()
});
