import { createFileRoute, Link } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { ProtectedLayout } from "@/components/ProtectedLayout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import {
  ArrowLeft,
  Plus,
  Upload,
  FileCheck2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export const Route = createFileRoute("/manifest/$groupId")({
  component: GroupDetailPage,
  head: () => ({ meta: [{ title: "Group Manifest — IGH Tour" }] }),
});

const STATUS_LABELS: Record<string, { label: string; color: string; step: number }> = {
  registered: { label: "Registered", color: "bg-muted-foreground", step: 1 },
  document_uploaded: { label: "Documents", color: "bg-brass", step: 2 },
  visa_processing: { label: "Visa Process", color: "bg-warning", step: 3 },
  visa_approved: { label: "Visa Approved", color: "bg-primary", step: 4 },
  ready_for_departure: { label: "Ready", color: "bg-gold", step: 5 },
  departed: { label: "Departed", color: "bg-success", step: 6 },
};

interface Jamaah {
  id: string;
  full_name: string;
  passport_number: string | null;
  room_type: string;
  status: string;
  jamaah_documents?: { id: string; document_type: string; file_path: string; file_name: string }[];
}

interface Group {
  id: string;
  name: string;
  departure_month: string;
  pax_target: number;
  hotel_makkah: string | null;
  hotel_madinah: string | null;
}

function GroupDetailPage() {
  const { groupId } = Route.useParams();
  const [group, setGroup] = useState<Group | null>(null);
  const [jamaah, setJamaah] = useState<Jamaah[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);

  const [jName, setJName] = useState("");
  const [jPassport, setJPassport] = useState("");
  const [jRoom, setJRoom] = useState<"quad" | "triple" | "double">("quad");

  const load = useCallback(async () => {
    setLoading(true);
    const [gRes, jRes] = await Promise.all([
      supabase.from("groups").select("*").eq("id", groupId).single(),
      supabase
        .from("jamaah")
        .select("*, jamaah_documents(id, document_type, file_path, file_name)")
        .eq("group_id", groupId)
        .order("created_at"),
    ]);
    if (gRes.error) toast.error(gRes.error.message);
    if (jRes.error) toast.error(jRes.error.message);
    setGroup(gRes.data);
    setJamaah((jRes.data as Jamaah[]) ?? []);
    setLoading(false);
  }, [groupId]);

  useEffect(() => {
    load();
  }, [load]);

  const handleAddJamaah = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.from("jamaah").insert({
      group_id: groupId,
      full_name: jName,
      passport_number: jPassport || null,
      room_type: jRoom,
    });
    if (error) return toast.error(error.message);
    toast.success("Jamaah ditambahkan!");
    setOpenAdd(false);
    setJName("");
    setJPassport("");
    load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus jamaah ini? Dokumen terkait juga akan terhapus.")) return;
    const { error } = await supabase.from("jamaah").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Jamaah dihapus");
    load();
  };

  const handleStatusChange = async (id: string, status: string) => {
    const { error } = await supabase.from("jamaah").update({ status }).eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const handleUpload = async (
    jamaahId: string,
    file: File,
    docType: "passport" | "photo",
  ) => {
    const ext = file.name.split(".").pop();
    const path = `${jamaahId}/${docType}-${Date.now()}.${ext}`;
    const { error: upErr } = await supabase.storage
      .from("jamaah-docs")
      .upload(path, file);
    if (upErr) return toast.error(upErr.message);

    const { error: dbErr } = await supabase.from("jamaah_documents").insert({
      jamaah_id: jamaahId,
      document_type: docType,
      file_path: path,
      file_name: file.name,
      mime_type: file.type,
    });
    if (dbErr) return toast.error(dbErr.message);

    // Auto-update status if first document
    const j = jamaah.find((x) => x.id === jamaahId);
    if (j && j.status === "registered") {
      await supabase
        .from("jamaah")
        .update({ status: "document_uploaded" })
        .eq("id", jamaahId);
    }

    toast.success(`${docType === "passport" ? "Passport" : "Foto"} berhasil di-upload!`);
    load();
  };

  if (loading) {
    return (
      <ProtectedLayout>
        <p className="text-muted-foreground">Loading…</p>
      </ProtectedLayout>
    );
  }

  if (!group) {
    return (
      <ProtectedLayout>
        <Card className="p-8 text-center">
          <p>Grup tidak ditemukan.</p>
          <Link to="/manifest" className="mt-2 inline-block text-primary">
            ← Kembali
          </Link>
        </Card>
      </ProtectedLayout>
    );
  }

  return (
    <ProtectedLayout>
      <div className="space-y-6">
        <Link
          to="/manifest"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" /> Semua Grup
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-primary">
              {format(new Date(group.departure_month), "MMMM yyyy", {
                locale: idLocale,
              })}
            </p>
            <h1 className="mt-1 text-3xl font-extrabold md:text-4xl">
              <span className="text-gradient-gold">{group.name}</span>
            </h1>
            <p className="mt-2 text-sm text-muted-foreground">
              {jamaah.length} / {group.pax_target} PAX terdaftar
            </p>
          </div>

          <Dialog open={openAdd} onOpenChange={setOpenAdd}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-gold font-bold text-gold-foreground shadow-gold hover:opacity-90">
                <Plus className="mr-2 h-4 w-4" /> Tambah Jamaah
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gradient-card">
              <DialogHeader>
                <DialogTitle>Tambah Jamaah Baru</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddJamaah} className="space-y-4">
                <div>
                  <Label>Nama Lengkap (sesuai passport)</Label>
                  <Input
                    value={jName}
                    onChange={(e) => setJName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <Label>Nomor Passport (opsional)</Label>
                  <Input
                    value={jPassport}
                    onChange={(e) => setJPassport(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tipe Kamar</Label>
                  <Select
                    value={jRoom}
                    onValueChange={(v) => setJRoom(v as "quad" | "triple" | "double")}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="quad">Quad Sharing</SelectItem>
                      <SelectItem value="triple">Triple Sharing</SelectItem>
                      <SelectItem value="double">Double Sharing</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <DialogFooter>
                  <Button
                    type="submit"
                    className="bg-gradient-gold font-bold text-gold-foreground"
                  >
                    Tambah Jamaah
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {jamaah.length === 0 ? (
          <Card className="border-dashed border-border bg-gradient-card p-12 text-center">
            <p className="font-semibold">Belum ada jamaah di grup ini</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Klik "Tambah Jamaah" untuk mulai isi manifest.
            </p>
          </Card>
        ) : (
          <div className="space-y-3">
            {jamaah.map((j, idx) => {
              const status = STATUS_LABELS[j.status] ?? STATUS_LABELS.registered;
              const docs = j.jamaah_documents ?? [];
              const hasPassport = docs.some((d) => d.document_type === "passport");
              const hasPhoto = docs.some((d) => d.document_type === "photo");
              return (
                <Card
                  key={j.id}
                  className="border-border bg-gradient-card p-5 shadow-soft"
                >
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-gold text-sm font-extrabold text-gold-foreground shadow-gold">
                        {idx + 1}
                      </div>
                      <div>
                        <p className="font-bold">{j.full_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {j.passport_number || "Passport: —"} · Room: {j.room_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Select
                        value={j.status}
                        onValueChange={(v) => handleStatusChange(j.id, v)}
                      >
                        <SelectTrigger className="h-8 w-[170px] text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(STATUS_LABELS).map(([k, v]) => (
                            <SelectItem key={k} value={k}>
                              {v.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(j.id)}
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Progress tracker */}
                  <div className="mt-4">
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-primary">{status.label}</span>
                      <span className="text-muted-foreground">
                        Step {status.step} / 6
                      </span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: 6 }).map((_, i) => (
                        <div
                          key={i}
                          className={`h-1.5 flex-1 rounded-full ${
                            i < status.step ? "bg-gradient-gold" : "bg-muted"
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Document vault */}
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <DocSlot
                      label="Passport"
                      icon={FileCheck2}
                      uploaded={hasPassport}
                      onUpload={(f) => handleUpload(j.id, f, "passport")}
                      accept="application/pdf,image/png,image/jpeg"
                    />
                    <DocSlot
                      label="Pas Foto"
                      icon={ImageIcon}
                      uploaded={hasPhoto}
                      onUpload={(f) => handleUpload(j.id, f, "photo")}
                      accept="image/png,image/jpeg"
                    />
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </ProtectedLayout>
  );
}

function DocSlot({
  label,
  icon: Icon,
  uploaded,
  onUpload,
  accept,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  uploaded: boolean;
  onUpload: (file: File) => void;
  accept: string;
}) {
  const id = `upload-${label}-${Math.random()}`;
  return (
    <label
      htmlFor={id}
      className={`flex cursor-pointer items-center gap-2 rounded-lg border p-3 text-xs transition-all ${
        uploaded
          ? "border-success/40 bg-success/10 text-success"
          : "border-dashed border-border bg-background/30 text-muted-foreground hover:border-primary/40 hover:text-primary"
      }`}
    >
      {uploaded ? <Icon className="h-4 w-4" /> : <Upload className="h-4 w-4" />}
      <span className="font-semibold">
        {uploaded ? `${label} ✓` : `Upload ${label}`}
      </span>
      <input
        id={id}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onUpload(f);
          e.target.value = "";
        }}
      />
    </label>
  );
}
