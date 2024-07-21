import { z } from "zod";

const RequiredString = z.string().trim().min(1, "Required");

export const registerSchema = z.object({
  email: RequiredString.email("Invalid Email Address"),
  name: RequiredString.regex(
    /^[a-zA-Z0-9_-]+$/,
    "Only Letters, Numbers, - and _ Allowed"
  ),
  password: RequiredString.min(8, "Minimum 8 Characters"),
});

export type RegisterValues = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: RequiredString,
  password: RequiredString,
});

export type LoginValues = z.infer<typeof loginSchema>;
