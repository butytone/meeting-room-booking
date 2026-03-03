"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = { id: string; workId: string; name: string };

export default function AdminUsersClient({
  users,
  currentUserId,
}: {
  users: User[];
  currentUserId: string;
}) {
  const router = useRouter();
  const [showAdd, setShowAdd] = useState(false);
  const [workId, setWorkId] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          workId: workId.trim(),
          name: name.trim(),
          password,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "添加失败");
        return;
      }
      setWorkId("");
      setName("");
      setPassword("");
      setShowAdd(false);
      router.refresh();
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirmId !== id) {
      setConfirmId(id);
      return;
    }
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error ?? "删除失败");
        setConfirmId(null);
        return;
      }
      setConfirmId(null);
      setError("");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowAdd((v) => !v)}
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          {showAdd ? "取消" : "添加用户"}
        </button>
      </div>
      {showAdd && (
        <form
          onSubmit={handleAdd}
          className="rounded-lg border bg-white p-4 shadow-sm"
          autoComplete="off"
        >
          <h3 className="mb-3 font-medium">新增用户</h3>
          <div className="grid gap-3 sm:grid-cols-3">
            <div>
              <label className="block text-sm text-gray-600">工号</label>
              <input
                type="text"
                required
                value={workId}
                onChange={(e) => setWorkId(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                autoComplete="off"
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
                autoComplete="off"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600">初始密码</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
                autoComplete="off"
              />
            </div>
          </div>
          <div className="mt-3">
            <button
              type="submit"
              disabled={loading}
              className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "提交中…" : "添加"}
            </button>
          </div>
        </form>
      )}
      <div className="space-y-2 rounded-lg border bg-white shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">工号</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600">姓名</th>
              <th className="px-4 py-2 text-sm font-medium text-gray-600 w-32">操作</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-gray-100">
                <td className="px-4 py-2">{u.workId}</td>
                <td className="px-4 py-2">{u.name}</td>
                <td className="px-4 py-2">
                  {u.id === currentUserId ? (
                    <span className="text-sm text-gray-400">当前账号</span>
                  ) : confirmId === u.id ? (
                    <>
                      <span className="mr-2 text-sm text-amber-600">确定删除？</span>
                      <button
                        type="button"
                        onClick={() => handleDelete(u.id)}
                        disabled={deletingId === u.id}
                        className="rounded bg-red-600 px-2 py-1 text-sm text-white hover:bg-red-700 disabled:opacity-50"
                      >
                        {deletingId === u.id ? "删除中…" : "确认"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(null)}
                        className="ml-1 rounded bg-gray-200 px-2 py-1 text-sm hover:bg-gray-300"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmId(u.id)}
                      className="rounded bg-red-100 px-2 py-1 text-sm text-red-700 hover:bg-red-200"
                    >
                      删除
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {users.length === 0 && !showAdd && (
        <p className="rounded-lg border bg-gray-50 p-6 text-center text-gray-500">
          暂无用户，请点击「添加用户」。
        </p>
      )}
    </div>
  );
}
