"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Namespace = { id: string; name: string; slug: string };

export default function RegisterForm() {
  const [namespaces, setNamespaces] = useState<Namespace[]>([]);
  const [namespaceId, setNamespaceId] = useState("");
  const [workId, setWorkId] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch("/api/namespaces")
      .then((res) => res.json())
      .then((data: Namespace[]) => setNamespaces(data))
      .catch(() => setNamespaces([]));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          namespaceId: namespaceId.trim() || undefined,
          workId: workId.trim(),
          name: name.trim(),
          phone: phone.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "注册失败");
        return;
      }
      router.push("/login");
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-sm">
      <h1 className="mb-6 text-xl font-semibold">用户注册</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border bg-white p-6 shadow-sm">
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div>
          <label className="block text-sm text-gray-600">所属学院 <span className="text-red-500">*</span></label>
          <select
            required
            value={namespaceId}
            onChange={(e) => setNamespaceId(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
          >
            <option value="">请选择学院</option>
            {namespaces.map((ns) => (
              <option key={ns.id} value={ns.id}>{ns.name}</option>
            ))}
          </select>
          {namespaces.length === 0 && (
            <p className="mt-1 text-xs text-gray-500">暂无学院数据，请联系管理员添加学院后再注册。</p>
          )}
        </div>
        <div>
          <label className="block text-sm text-gray-600">工号</label>
          <input
            type="text"
            required
            value={workId}
            onChange={(e) => setWorkId(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="用于登录"
            autoComplete="username"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">姓名</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            autoComplete="name"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">手机号</label>
          <input
            type="tel"
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="11 位手机号"
            autoComplete="tel"
          />
        </div>
        <div>
          <label className="block text-sm text-gray-600">密码</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            placeholder="至少 6 位"
            autoComplete="new-password"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-blue-600 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "注册中…" : "注册"}
        </button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-600">
        已有账号？<Link href="/login" className="text-blue-600 hover:underline">去登录</Link>
      </p>
    </div>
  );
}
