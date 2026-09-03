import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: {
    strategy: "jwt",
  },

  pages: {
    signIn: "/login",
  },

  providers: [
    Credentials({
      name: "Credentials",

      credentials: {
        email: {
          label: "Email",
          type: "email",
        },

        password: {
          label: "Password",
          type: "password",
        },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = String(credentials.email)
          .trim()
          .toLowerCase();

        const password = String(credentials.password);

        try {
          const response = await fetch(
            `${process.env.LARAVEL_API_URL}/api/login`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
              },
              body: JSON.stringify({
                email,
                password,
              }),
            }
          );

          console.log(
            "Laravel login status:",
            response.status
          );

          const data = await response.json();

          console.log(
            "Laravel login response:",
            data
          );

          if (!response.ok) {
            console.error(
              "Laravel login failed:",
              data
            );

            return null;
          }

          if (!data.user || !data.token) {
            console.error(
              "Laravel response is missing user or token:",
              data
            );

            return null;
          }

          return {
            id: String(data.user.id),
            email: data.user.email,
            name: `${data.user.first_name} ${data.user.last_name}`,
            firstName: data.user.first_name,
            lastName: data.user.last_name,
            role: data.user.role,
            phone: data.user.phone,
            image: data.user.image,
            accessToken: data.token,
          };
        } catch (error) {
          console.error(
            "Laravel authentication error:",
            error
          );

          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.image = user.image;
        token.accessToken = user.accessToken;
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.firstName = token.firstName as string;
        session.user.lastName = token.lastName as string;
        session.user.phone = token.phone as string;
        session.user.image = token.image as string | null;
        session.user.accessToken =
          token.accessToken as string;
      }

      return session;
    },
  },
});