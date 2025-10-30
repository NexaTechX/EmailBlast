import { z } from "zod";

// Campaign validation schema
export const campaignSchema = z.object({
  title: z.string().min(1, "Campaign title is required").max(100, "Title must be less than 100 characters"),
  subject: z.string().min(1, "Email subject is required").max(200, "Subject must be less than 200 characters"),
  sender_name: z.string().min(1, "Sender name is required").max(100, "Sender name must be less than 100 characters"),
  sender_email: z.string().email("Please enter a valid email address"),
  content: z.string().min(1, "Email content is required"),
  list_id: z.string().min(1, "Please select a subscriber list"),
});

export type CampaignFormData = z.infer<typeof campaignSchema>;

// Subscriber validation schema
export const subscriberSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  first_name: z.string().optional(),
  last_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export type SubscriberFormData = z.infer<typeof subscriberSchema>;

// Subscriber list validation schema
export const subscriberListSchema = z.object({
  name: z.string().min(1, "List name is required").max(100, "Name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
});

export type SubscriberListFormData = z.infer<typeof subscriberListSchema>;

// Auth validation schemas
export const signUpSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters").max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type SignUpFormData = z.infer<typeof signUpSchema>;

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

export type SignInFormData = z.infer<typeof signInSchema>;

// Profile settings validation
export const profileSettingsSchema = z.object({
  full_name: z.string().max(100, "Name must be less than 100 characters").optional(),
  company_name: z.string().max(100, "Company name must be less than 100 characters").optional(),
  website: z.string().url("Please enter a valid URL").optional().or(z.literal("")),
});

export type ProfileSettingsFormData = z.infer<typeof profileSettingsSchema>;

// Email validation helper
export function isValidEmail(email: string): boolean {
  return z.string().email().safeParse(email).success;
}

// Bulk email validation for CSV imports
export function validateEmailList(emails: string[]): { valid: string[], invalid: string[] } {
  const valid: string[] = [];
  const invalid: string[] = [];

  emails.forEach(email => {
    if (isValidEmail(email.trim())) {
      valid.push(email.trim());
    } else {
      invalid.push(email);
    }
  });

  return { valid, invalid };
}

