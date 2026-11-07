"use server";

import { z } from "zod";

export type RegisterState = {
  success: boolean;
  message: string;
  errors?: {
    firstName?: string[];
    lastName?: string[];
    email?: string[];
    phone?: string[];
    password?: string[];
    confirmPassword?: string[];
    termsAccepted?: string[];
  };
};

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name must be at least 2 characters.")
      .regex(/^[^\p{N}]+$/u, "First name must not contain numbers."),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name must be at least 2 characters.")
      .regex(/^[^\p{N}]+$/u, "Last name must not contain numbers."),

    email: z.string().trim().email("Please enter a valid email address."),

    phone: z
      .string()
      .regex(/^[0-9]{11}$/, "Phone number must contain exactly 11 digits."),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters.")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
      .regex(/[0-9]/, "Password must contain at least one number.")
      .regex(/[^A-Za-z0-9\s]/, "Password must contain at least one special symbol."),

    confirmPassword: z.string().min(1, "Please confirm your password."),

    termsAccepted: z.boolean().refine(
      (accepted) => accepted,
      "You must accept the Terms and Conditions to register.",
    ),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

interface LaravelErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

function mapLaravelErrors(
  errors: Record<string, string[]>,
): NonNullable<RegisterState["errors"]> {
  const mapped: NonNullable<RegisterState["errors"]> = {};

  const fieldMap: Record<
    string,
    keyof NonNullable<RegisterState["errors"]>
  > = {
    first_name: "firstName",
    last_name: "lastName",
    email: "email",
    phone: "phone",
    password: "password",
    password_confirmation: "confirmPassword",
    terms_accepted: "termsAccepted",
    terms_version: "termsAccepted",
  };

  for (const [apiField, messages] of Object.entries(errors)) {
    const formField = fieldMap[apiField];

    if (formField && Array.isArray(messages)) {
      mapped[formField] = messages;
    }
  }

  return mapped;
}

export async function registerUser(
  prevState: RegisterState,
  formData: FormData,
): Promise<RegisterState> {
  void prevState;

  const validated = registerSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    termsAccepted: formData.get("termsAccepted") === "on",
  });

  if (!validated.success) {
    return {
      success: false,
      message: "Please correct the highlighted fields.",
      errors: validated.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    confirmPassword,
    termsAccepted,
  } = validated.data;

  const apiBaseUrl =
    process.env.LARAVEL_API_URL ||
    process.env.NEXT_PUBLIC_LARAVEL_API_URL;

  if (!apiBaseUrl) {
    return {
      success: false,
      message: "The registration server is not configured.",
    };
  }

  try {
    const response = await fetch(
      `${apiBaseUrl.replace(/\/$/, "")}/api/register`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email: email.toLowerCase(),
          phone,
          password,
          password_confirmation: confirmPassword,
          terms_accepted: termsAccepted,
          terms_version: "2026-11-07",
        }),
        cache: "no-store",
      },
    );

    const data = (await response.json().catch(() => ({}))) as LaravelErrorResponse;

    if (!response.ok) {
      return {
        success: false,
        message:
          data.message ||
          "Registration failed. Please check your information.",
        errors: data.errors
          ? mapLaravelErrors(data.errors)
          : undefined,
      };
    }

    return {
      success: true,
      message: "Account created successfully.",
    };
  } catch (error) {
    console.error("Registration request failed:", error);

    return {
      success: false,
      message: "Unable to connect to the server. Please try again.",
    };
  }
}