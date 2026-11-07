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

        const email = String(credentials.email).trim().toLowerCase();
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

          console.log("Laravel login status:", response.status);

          const data = await response.json();

          if (!response.ok) {
            console.error(
              "Laravel login failed with status:",
              response.status
            );
            return null;
          }

          if (!data.user || !data.token) {
            console.error("Laravel response is missing user or token.");
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
          console.error("Laravel authentication error:", error);
          return null;
        }
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user, trigger }) {
      // Initial login
      if (user) {
        token.id = user.id;
        token.name = user.name;
        token.email = user.email;
        token.role = user.role;
        token.firstName = user.firstName;
        token.lastName = user.lastName;
        token.phone = user.phone;
        token.image = user.image;
        token.accessToken = user.accessToken;
      }

      // Refresh profile data after calling useSession().update()
      if (trigger === "update" && token.accessToken) {
        try {
          const response = await fetch(
            `${process.env.LARAVEL_API_URL}/api/profile`,
            {
              method: "GET",
              headers: {
                Accept: "application/json",
                Authorization: `Bearer ${token.accessToken}`,
              },
              cache: "no-store",
            }
          );

          if (!response.ok) {
            console.error(
              "Laravel profile refresh failed with status:",
              response.status
            );
            return token;
          }

          const data = await response.json();
          const profile = data.user;

          if (profile) {
            token.id = String(profile.id);
            token.firstName = profile.first_name;
            token.lastName = profile.last_name;
            token.email = profile.email;
            token.name = `${profile.first_name} ${profile.last_name}`;
            token.role = profile.role;
            token.phone = profile.phone;
            token.image = profile.image ?? null;
          }
        } catch (error) {
          console.error("Laravel profile refresh error:", error);
        }
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
        session.user.accessToken = token.accessToken as string;
      }

      return session;
    },
  },
});
