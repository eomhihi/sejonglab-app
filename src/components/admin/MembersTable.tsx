"use client";

import { useMemo, useState } from "react";

type Member = {
  id: string;
  name: string | null;
  email: string | null;
  phone: string | null;
  gender: string | null;
  ageGroup: string | null;
  region: string | null;
  occupation: string | null;
  interestTopics: string[];
  interests: string[];
  participationActivities: string[];
  createdAt: string; // serialized
};

function formatGender(g: string | null): string {
  if (!g) return "-";
  if (g === "male") return "남성";
  if (g === "female") return "여성";
  return g;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

type Props = {
  initialMembers: Member[];
};

export function MembersTable({ initialMembers }: Props) {
  const [members, setMembers] = useState<Member[]>(initialMembers);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<Record<string, string>>({});

  const editingMember = useMemo(
    () => members.find((m) => m.id === editingId) ?? null,
    [members, editingId]
  );

  const startEdit = (m: Member) => {
    setEditingId(m.id);
    setDraft({
      name: m.name ?? "",
      email: m.email ?? "",
      phone: m.phone ?? "",
      gender: m.gender ?? "",
      ageGroup: m.ageGroup ?? "",
      region: m.region ?? "",
      occupation: m.occupation ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setDraft({});
  };

  const saveEdit = async () => {
    if (!editingId) return;
    setPendingId(editingId);
    try {
      const res = await fetch(`/api/admin/users/${editingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: draft.name,
          email: draft.email,
          phone: draft.phone,
          gender: draft.gender || null,
          ageGroup: draft.ageGroup,
          region: draft.region,
          occupation: draft.occupation,
        }),
      });
      const json = (await res.json()) as { ok?: boolean; user?: any; error?: string };
      if (!res.ok || !json.ok || !json.user) {
        alert(json.error || "수정에 실패했습니다.");
        return;
      }
      setMembers((prev) =>
        prev.map((m) =>
          m.id === editingId
            ? {
                ...m,
                name: json.user.name ?? null,
                email: json.user.email ?? null,
                phone: json.user.phone ?? null,
                gender: json.user.gender ?? null,
                ageGroup: json.user.ageGroup ?? null,
                region: json.user.region ?? null,
                occupation: json.user.occupation ?? null,
              }
            : m
        )
      );
      cancelEdit();
    } finally {
      setPendingId(null);
    }
  };

  const deleteMember = async (id: string) => {
    const ok = confirm("이 회원을 삭제할까요? 계정/세션 등도 함께 삭제됩니다.");
    if (!ok) return;
    setPendingId(id);
    try {
      const res = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
      const json = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !json.ok) {
        alert(json.error || "삭제에 실패했습니다.");
        return;
      }
      setMembers((prev) => prev.filter((m) => m.id !== id));
      if (editingId === id) cancelEdit();
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[1100px]">
        <thead>
          <tr className="bg-slate-700/50 border-b border-slate-600">
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              이름
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              이메일
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              전화번호
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              성별
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              연령대
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              가입일
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              관심·참여
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              거주지
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              직업
            </th>
            <th className="px-4 py-3 text-left text-xs font-semibold text-sky-200 uppercase tracking-wider">
              관리
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-700">
          {members.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-4 py-12 text-center text-slate-500 text-sm">
                DB가 연결되지 않았거나 등록된 회원이 없습니다.
              </td>
            </tr>
          ) : (
            members.map((user) => {
              const tags = user.interests?.length > 0 ? user.interests : user.interestTopics ?? [];
              const isEditing = editingId === user.id;
              const disabled = pendingId === user.id;
              return (
                <tr key={user.id} className="hover:bg-slate-700/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-white">
                    {isEditing ? (
                      <input
                        value={draft.name ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-white"
                      />
                    ) : (
                      user.name ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {isEditing ? (
                      <input
                        value={draft.email ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      />
                    ) : (
                      user.email ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {isEditing ? (
                      <input
                        value={draft.phone ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, phone: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      />
                    ) : (
                      user.phone ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {isEditing ? (
                      <select
                        value={draft.gender ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, gender: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      >
                        <option value="">-</option>
                        <option value="male">남성</option>
                        <option value="female">여성</option>
                      </select>
                    ) : (
                      formatGender(user.gender)
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {isEditing ? (
                      <input
                        value={draft.ageGroup ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, ageGroup: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      />
                    ) : (
                      user.ageGroup ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-4 py-3 max-w-[280px]">
                    {tags.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mb-1">
                        {tags.map((topic) => (
                          <span
                            key={topic}
                            className="px-2 py-0.5 text-xs bg-sky-500/20 text-sky-200 rounded"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {user.participationActivities && user.participationActivities.length > 0 ? (
                      <div className="flex flex-wrap gap-1 mt-1">
                        {user.participationActivities.map((a) => (
                          <span
                            key={a}
                            className="px-2 py-0.5 text-[10px] bg-emerald-500/15 text-emerald-200 rounded"
                          >
                            {a}
                          </span>
                        ))}
                      </div>
                    ) : null}
                    {tags.length === 0 && !user.participationActivities?.length ? (
                      <span className="text-slate-500">-</span>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300">
                    {isEditing ? (
                      <input
                        value={draft.region ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      />
                    ) : (
                      user.region ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 max-w-[260px]">
                    {isEditing ? (
                      <input
                        value={draft.occupation ?? ""}
                        onChange={(e) => setDraft((d) => ({ ...d, occupation: e.target.value }))}
                        className="w-full rounded-md bg-slate-900/40 border border-slate-700 px-2 py-1 text-slate-200"
                      />
                    ) : (
                      user.occupation ?? "-"
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-300 whitespace-nowrap">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={saveEdit}
                          className="px-3 py-1.5 rounded-md bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 disabled:opacity-50"
                        >
                          저장
                        </button>
                        <button
                          type="button"
                          disabled={disabled}
                          onClick={cancelEdit}
                          className="px-3 py-1.5 rounded-md bg-slate-700 text-slate-100 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50"
                        >
                          취소
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          disabled={pendingId !== null}
                          onClick={() => startEdit(user)}
                          className="px-3 py-1.5 rounded-md bg-slate-700 text-slate-100 text-xs font-semibold hover:bg-slate-600 disabled:opacity-50"
                        >
                          수정
                        </button>
                        <button
                          type="button"
                          disabled={pendingId !== null}
                          onClick={() => deleteMember(user.id)}
                          className="px-3 py-1.5 rounded-md bg-red-600/90 text-white text-xs font-semibold hover:bg-red-600 disabled:opacity-50"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
      {editingMember ? (
        <p className="px-6 py-3 text-xs text-slate-400 border-t border-slate-700">
          편집 중: {editingMember.email ?? editingMember.name ?? editingMember.id}
        </p>
      ) : null}
    </div>
  );
}

