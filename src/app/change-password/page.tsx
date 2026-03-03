import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import ChangePasswordForm from "./ChangePasswordForm";

export default async function ChangePasswordPage() {
  const user = await getSession();
  if (!user) redirect("/login");

  return (
    <div>
      <h1 className="mb-6 text-xl font-semibold">修改密码</h1>
      <ChangePasswordForm />
    </div>
  );
}
