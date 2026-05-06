import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";
import { Manrope, Space_Grotesk } from "next/font/google";

const bodyFont = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

const displayFont = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-display",
});

export const metadata: Metadata = {
  title: "TaskFlow | Team Task Manager",
  description: "Manage projects, assign tasks, and track progress with ease.",
};

type NavbarUser = {
  name?: string | null;
  role?: string | null;
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  const navbarUser = session && typeof session !== "string" ? (session as NavbarUser) : null;

  return (
    <html lang="en">
      <body className={`${bodyFont.variable} ${displayFont.variable} app-shell`}>
        <Navbar user={navbarUser} />
        <main className="app-main animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
