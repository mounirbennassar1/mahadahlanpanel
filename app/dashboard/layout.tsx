import { auth, signOut } from "@/auth";
import { redirect } from "next/navigation";
import { Sidebar } from "./_components/sidebar";
import { Topbar } from "./_components/topbar";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  async function handleSignOut() {
    "use server";
    await signOut({ redirectTo: "/login" });
  }

  return (
    <div
      className="app"
      style={{
        display: "grid",
        gridTemplateColumns: "var(--sidebar-w) 1fr",
        minHeight: "100vh",
        background: "var(--bg)",
      }}
    >
      <Sidebar user={session.user} signOutAction={handleSignOut} />
      <main style={{ minWidth: 0 }}>
        <Topbar user={session.user} />
        <div style={{ padding: "8px 32px 48px" }}>{children}</div>
      </main>
    </div>
  );
}
