import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { getSession } from "@/lib/auth";

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
      <body className="app-shell">
        <Navbar user={navbarUser} />
        <main className="app-main animate-fade-in">
          {children}
        </main>
      </body>
    </html>
  );
}
