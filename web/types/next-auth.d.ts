import {
  DefaultSession,
  DefaultUser,
} from "next-auth";

import {
  JWT,
} from "next-auth/jwt";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;

    firstName: string;

    lastName: string;

    role: string;

    phone: string;

    image?: string | null;

    accessToken: string;
  }

  interface Session {
    user: {
      id: string;

      firstName: string;

      lastName: string;

      role: string;

      phone: string;

      image?: string | null;

      accessToken: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;

    firstName: string;

    lastName: string;

    role: string;

    phone: string;

    image?: string | null;

    accessToken: string;
  }
}