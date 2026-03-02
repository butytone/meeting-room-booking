import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import RegisterForm from "./RegisterForm";

export default async function RegisterPage() {
  const user = await getSession();
  if (user) redirect("/dashboard");
  return <RegisterForm />;
}
