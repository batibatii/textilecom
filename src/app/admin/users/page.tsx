import { getAllUsersWithOrderCounts } from "@/app/actions/admin/users/listUsers";
import { UsersTable } from "@/components/admin/UsersTable";
import { H1 } from "@/components/ui/headings";

export default async function UsersPage() {
  const result = await getAllUsersWithOrderCounts();

  if (!result.success) {
    return (
      <main className="container mx-auto px-4 py-8">
        <H1 className="text-center mt-8 mb-10">User Management</H1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-destructive font-semibold text-sm">
              Error loading users
            </p>
            <p className="text-muted-foreground text-sm max-w-md">
              {result.error}
            </p>
          </div>
        </div>
      </main>
    );
  }

  if (!result.users || result.users.length === 0) {
    return (
      <main className="container mx-auto px-4 py-8">
        <H1 className="text-center mt-8 mb-10">User Management</H1>
        <div className="flex items-center justify-center h-64">
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="text-muted-foreground font-semibold text-sm">
              No users found
            </p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <H1 className="text-center mt-8 mb-20">User Management</H1>
      <UsersTable users={result.users} />
    </main>
  );
}
