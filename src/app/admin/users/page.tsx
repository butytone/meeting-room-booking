import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import AdminUsersClient from "./AdminUsersClient";

export default async function AdminUsersPage() {
  const user = await getSession();
  if (!user) redirect("/login");
  if (user.role !== "admin") redirect("/dashboard");

  const users = await prisma.user.findMany({
    where: { namespaceId: user.namespaceId },
    orderBy: { workId: "asc" },
    select: { id: true, workId: true, name: true },
  });

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-xl font-semibold">管理用户</h1>
      </div>
      <AdminUsersClient users={users} currentUserId={user.id} />
    </div>
  );
}
