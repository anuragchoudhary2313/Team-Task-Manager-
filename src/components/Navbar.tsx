"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

type NavbarUser = {
  name?: string | null;
  role?: string | null;
};

export default function Navbar({ user }: { user: NavbarUser | null }) {
  const router = useRouter();

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const initials = user?.name
    ? user.name
        .split(" ")
        .filter(Boolean)
        .map((part: string) => part[0])
        .slice(0, 2)
        .join("")
        .toUpperCase()
    : "TF";

  return (
    <nav className="topbar">
      <div className="topbar__inner">
        <Link href="/" className="brand">
          <span className="brand-mark" aria-hidden="true" />
          TaskFlow
        </Link>

        <div className="nav-links">
          {user ? (
            <>
              <Link href="/" className="nav-link">
                Dashboard
              </Link>
              <Link href="/projects" className="nav-link">
                Projects
              </Link>
              <Link href="/projects/join" className="nav-link" style={{ color: "var(--color-accent)" }}>
                + Join project
              </Link>
              <span className="user-chip">
                <span className="user-chip__avatar" aria-hidden="true">
                  {initials}
                </span>
                <span>
                  <strong style={{ display: "block", color: "var(--text)" }}>{user.name}</strong>
                  <span style={{ fontSize: "0.78rem" }}>{user.role}</span>
                </span>
              </span>
              <button onClick={handleLogout} className="button button-danger">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-link">
                Login
              </Link>
              <Link href="/signup" className="button button-primary">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
