import { AdminNavbar } from "@/components/layout/AdminNav";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <AdminNavbar />
      {children}
    </>
  );
}
