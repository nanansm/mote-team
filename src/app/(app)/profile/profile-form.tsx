"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserAvatar } from "@/components/user-avatar";
import { changePassword, updateUser } from "@/lib/auth-client";

type ProfileUser = { name: string; email: string; image: string | null };

export function ProfileForm({ user }: { user: ProfileUser }) {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [name, setName] = useState(user.name);
  const [image, setImage] = useState<string | null>(user.image);
  const [uploading, setUploading] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [savingPw, setSavingPw] = useState(false);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("kind", "avatar");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json();
      if (res.ok && data.url) setImage(data.url);
      else toast.error(data.error ?? "Upload gagal");
    } catch {
      toast.error("Upload gagal");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Nama tidak boleh kosong");
      return;
    }
    setSavingProfile(true);
    const { error } = await updateUser({ name: name.trim(), image });
    setSavingProfile(false);
    if (error) {
      toast.error(error.message ?? "Gagal menyimpan profil");
      return;
    }
    toast.success("Profil diperbarui");
    router.refresh();
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault();
    if (newPassword.length < 8) {
      toast.error("Password baru minimal 8 karakter");
      return;
    }
    if (newPassword !== confirm) {
      toast.error("Konfirmasi password tidak cocok");
      return;
    }
    setSavingPw(true);
    const { error } = await changePassword({
      currentPassword,
      newPassword,
      revokeOtherSessions: true,
    });
    setSavingPw(false);
    if (error) {
      toast.error(error.message ?? "Gagal ganti password (cek password saat ini)");
      return;
    }
    toast.success("Password diganti");
    setCurrentPassword("");
    setNewPassword("");
    setConfirm("");
  }

  return (
    <div className="mx-auto grid max-w-xl gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Profil saya</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={saveProfile} className="space-y-5">
            <div className="flex items-center gap-4">
              <UserAvatar name={name} src={image} className="size-16 text-lg" />
              <div>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={uploading}
                  onClick={() => fileRef.current?.click()}
                >
                  <Upload className="size-4" />
                  {uploading ? "Mengunggah…" : "Ganti foto"}
                </Button>
                <p className="mt-1.5 text-xs text-muted-foreground">
                  JPG/PNG, maks 10MB.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Nama</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={user.email} readOnly disabled />
              <p className="text-xs text-muted-foreground">
                Hubungi admin untuk mengubah email login.
              </p>
            </div>

            <Button type="submit" disabled={savingProfile || uploading}>
              {savingProfile ? "Menyimpan…" : "Simpan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Ganti password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={savePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="current">Password saat ini</Label>
              <Input
                id="current"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new">Password baru</Label>
              <Input
                id="new"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Ulangi password baru</Label>
              <Input
                id="confirm"
                type="password"
                autoComplete="new-password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={savingPw}>
              {savingPw ? "Menyimpan…" : "Ganti password"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
