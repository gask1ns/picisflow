"use client";

import { useState } from "react";
import { updateProfile, deleteAccount } from "@/lib/supabase/actions";

type Profile = { id: string; display_name: string | null; currency: string } | null;

export function SettingsClient({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile?.display_name ?? "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMsg("");
    const r = await updateProfile(name);
    if (r?.error) setMsg(r.error);
    else setMsg("✅ Tersimpan");
    setSaving(false);
  }

  return (
    <div className="border-2 border-black bg-card p-6 shadow-lg">
      <h3 className="font-bold uppercase mb-4">Profil</h3>
      <form onSubmit={handleSave} className="flex flex-col gap-3">
        <div>
          <label htmlFor="display_name" className="text-xs font-bold uppercase mb-1 block">Nama</label>
          <input
            id="display_name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nama kamu"
            className="border-2 border-black px-4 py-3 w-full text-sm"
          />
        </div>
        {msg && <p className="text-sm">{msg}</p>}
        <button
          type="submit"
          disabled={saving}
          className="border-2 border-black bg-primary px-4 py-2 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm disabled:opacity-50 w-fit"
        >
          {saving ? "..." : "Simpan"}
        </button>
      </form>

      <hr className="my-6 border-black" />

      <button
        onClick={async () => {
          if (!confirm("Yakin hapus akun? Semua data hilang permanen!")) return;
          setDeleting(true);
          await deleteAccount();
        }}
        disabled={deleting}
        className="border-2 border-black bg-danger px-4 py-2 font-bold text-white uppercase shadow-sm hover:translate-x-[1px] hover:translate-y-[1px] transition-all text-sm"
      >
        {deleting ? "..." : "Hapus Akun"}
      </button>
    </div>
  );
}
