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
  };
};

const registerSchema = z
  .object({
    firstName: z
      .string()
      .trim()
      .min(2, "First name is required"),

    lastName: z
      .string()
      .trim()
      .min(2, "Last name is required"),

    email: z
      .string()
      .trim()
      .email("Invalid email address"),

    phone: z
      .string()
      .trim()
      .min(
        11,
        "Phone number must be at least 11 digits"
      ),

    password: z
      .string()
      .min(
        8,
        "Password must be at least 8 characters"
      ),

    confirmPassword: z.string(),
  })
  .refine(
    (data) =>
      data.password === data.confirmPassword,
    {
      message: "Passwords do not match",
      path: ["confirmPassword"],
    }
  );

export async function registerUser(
  prevState: RegisterState,
  formData: FormData
): Promise<RegisterState> {
  const validated =
    registerSchema.safeParse({
      firstName: formData.get("firstName"),
      lastName: formData.get("lastName"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      password: formData.get("password"),
      confirmPassword:
        formData.get("confirmPassword"),
    });

  if (!validated.success) {
    return {
      success: false,
      message: "Validation failed.",
      errors:
        validated.error.flatten().fieldErrors,
    };
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    password,
  } = validated.data;

  console.log(
    "Next.js Laravel API URL:",
    process.env.LARAVEL_API_URL
  );

  try {
    const response = await fetch(
      `${process.env.LARAVEL_API_URL}/api/register`,
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
          password_confirmation:
            password,
        },
        ),
      }
    );

    console.log(
      "Laravel registration status:",
      response.status
    );

    const data = await response.json();

    console.log(
      "Laravel registration response:",
      data
    );

    if (!response.ok) {
      console.error(
        "Laravel registration failed:",
        response.status,
        data
      );

      return {
        success: false,
        message:
          data.message ||
          "Registration failed. Please try again.",
      };
    }

    return {
      success: true,
      message:
        "Account created successfully.",
    };
  } catch (error) {
    console.error(
      "Laravel registration connection error:",
      error
    );

    return {
      success: false,
      message:
        "Unable to connect to the server. Please try again.",
    };
  }
}