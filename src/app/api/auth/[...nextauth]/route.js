import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { connectMongoDB } from "../../../../../lib/mongodb";
import User from "../../../../../Models/user";
import bcrypt from "bcryptjs";
export const dynamic = "force-dynamic";

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {},
      async authorize(credentials) {
        const { email, password } = credentials;

        try {
          await connectMongoDB();
          const user = await User.findOne({ email });

          if (!user) return null;

          const isPasswordCorrect = await bcrypt.compare(password, user.password);
          if (!isPasswordCorrect) return null;

          // คืนค่า user object พร้อม isVerified
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            role: user.role,
            isVerified: user.isVerified, 
          };
        } catch (error) {
          console.error("Login error:", error);
          return null;
        }
      }
    })
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    // ตรวจสอบการ signIn
    async signIn({ user }) {
      console.log("SignIn callback user:", user);
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role;
        token.id = user.id;
        token.isVerified = user.isVerified; // เก็บสถานะไว้ใน token
      }
      return token;
    },
    async session({ session, token }) {
      if (token?.role) session.user.role = token.role;
      if (token?.isVerified !== undefined) session.user.isVerified = token.isVerified;
      if (token?.id) session.user.id = token.id;
      return session;
    }
  },
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/',
  }
};
const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };