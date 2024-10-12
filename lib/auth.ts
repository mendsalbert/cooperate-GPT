import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import axios from "axios";

interface User {
  id: string;
  email: string;
  name: string;
  accessToken: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: {
          label: "Email",
          type: "text",
          placeholder: "jsmith@example.com",
        },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log("Missing email or password");
          return null;
        }

        try {
          console.log("Attempting to login with:", credentials.email);
          console.log("Backend URL:", process.env.BACKEND_URL);
          const response = await axios.post(
            `${process.env.BACKEND_URL}/api/auth/login`,
            {
              email: credentials.email,
              password: credentials.password,
            }
          );

          console.log("Backend login response:", response.data);

          if (response.data.success && response.data.token) {
            return {
              id: response.data.user.id,
              email: response.data.user.email,
              name: response.data.user.name,
              accessToken: response.data.token,
            };
          } else {
            console.log("Login failed:", response.data);
            return null;
          }
        } catch (error) {
          if (axios.isAxiosError(error)) {
            console.error(
              "Authentication error:",
              error.response?.data || error.message
            );
          } else {
            console.error("Authentication error:", error);
          }
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.accessToken = user.accessToken;
      }
      console.log("JWT callback token:", token);
      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken;
      console.log("Session callback session:", session);
      return session;
    },
  },
  pages: {
    signIn: "/signin",
  },
  debug: true, // Enable debug mode
};
