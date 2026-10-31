"use client";

// Halaman dashboard gelap: sidebar, kartu statistik, grafik pendapatan, tabel pelanggan.
// Satu file, tanpa library grafik. Butuh: Next.js (App Router), Tailwind CSS, lucide-react.
// Simpan sebagai app/dashboard/page.tsx. Semua data di bawah adalah DATA CONTOH.

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  ChevronDown,
  ChevronsUpDown,
  CircleDollarSign,
  Copy,
  ExternalLink,
  Eye,
  FolderKanban,
  House,
  LayoutDashboard,
  LifeBuoy,
  Menu,
  Pencil,
  Search,
  Settings,
  SlidersHorizontal,
  Sparkles,
  SquareCheckBig,
  Trash2,
  Users,
  X,
  ChartColumn,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/* Data contoh                                                         */
/* ------------------------------------------------------------------ */

const NAMA_APP = "Studio";
const PENGGUNA = { nama: "Rina Pratama", email: "rina@contoh.com" };

const menu = [
  { nama: "Beranda", ikon: House },
  { nama: "Dashboard", ikon: LayoutDashboard, aktif: true },
  { nama: "Proyek", ikon: FolderKanban },
  { nama: "Tugas", ikon: SquareCheckBig },
  { nama: "Laporan", ikon: ChartColumn },
  { nama: "Pengguna", ikon: Users },
];

const statistik = [
  {
    label: "Total pendapatan",
    nilai: "Rp 87.467.000",
    delta: 2.4,
    ikon: CircleDollarSign,
  },
  { label: "Tampilan halaman", nilai: "12.440", delta: 6.2, ikon: Eye },
  { label: "Aktif sekarang", nilai: "96", delta: -0.8, ikon: Activity },
];

type Status = "Lunas" | "Menunggu" | "Batal";
type Pelanggan = {
  id: number;
  nama: string;
  akun: string;
  email: string;
  tanggal: string; // YYYY-MM-DD
  status: Status;
  jumlah: number;
};

const pelangganAwal: Pelanggan[] = [
  {
    id: 1,
    nama: "Lestari Wulandari",
    akun: "@lestariw",
    email: "lestari@contoh.com",
    tanggal: "2026-10-29",
    status: "Lunas",
    jumlah: 1_250_000,
  },
  {
    id: 2,
    nama: "Budi Santoso",
    akun: "@budis",
    email: "budi@contoh.com",
    tanggal: "2026-10-29",
    status: "Lunas",
    jumlah: 960_000,
  },
  {
    id: 3,
    nama: "Citra Anggraini",
    akun: "@citra.a",
    email: "citra@contoh.com",
    tanggal: "2026-10-28",
    status: "Menunggu",
    jumlah: 1_045_000,
  },
  {
    id: 4,
    nama: "Dimas Prakoso",
    akun: "@dimasp",
    email: "dimas@contoh.com",
    tanggal: "2026-10-27",
    status: "Lunas",
    jumlah: 688_000,
  },
  {
    id: 5,
    nama: "Eka Nurhaliza",
    akun: "@ekanur",
    email: "eka@contoh.com",
    tanggal: "2026-10-26",
    status: "Batal",
    jumlah: 420_000,
  },
  {
    id: 6,
    nama: "Fajar Ramadhan",
    akun: "@fajarr",
    email: "fajar@contoh.com",
    tanggal: "2026-10-25",
    status: "Lunas",
    jumlah: 2_310_000,
  },
  {
    id: 7,
    nama: "Gita Maharani",
    akun: "@gitam",
    email: "gita@contoh.com",
    tanggal: "2026-10-24",
    status: "Menunggu",
    jumlah: 775_000,
  },
];

/* ------------------------------------------------------------------ */
/* Pembantu                                                            */
/* ------------------------------------------------------------------ */

const rupiah = (n: number) =>
  "Rp " +
  Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const BULAN = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];
const HARI = ["Min", "Sen", "Sel", "Rab", "Kam", "Jum", "Sab"];

const tglPendek = (iso: string) => {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${BULAN[m - 1]} ${y}`;
};

// Pembangkit angka acak yang selalu sama (supaya grafik tidak berubah tiap render)
const acak = (seed: number) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

type Rentang = "12b" | "30h" | "7h" | "24j";
const rentangList: { id: Rentang; label: string }[] = [
  { id: "12b", label: "12 bulan" },
  { id: "30h", label: "30 hari" },
  { id: "7h", label: "7 hari" },
  { id: "24j", label: "24 jam" },
];

// Deret pendapatan periode ini dan periode sebelumnya
function buatData(r: Rentang) {
  const n = { "12b": 12, "30h": 30, "7h": 7, "24j": 24 }[r];
  const skala = {
    "12b": 9_000_000,
    "30h": 300_000,
    "7h": 420_000,
    "24j": 130_000,
  }[r];
  const rnd = acak(r.length * 97 + n);
  const bentuk = (i: number) => {
    if (r === "24j") return 0.2 + 0.8 * Math.exp(-(((i - 14) / 5) ** 2)); // puncak sore hari
    if (r === "7h") return 0.7 + 0.3 * Math.sin(i / 1.4);
    return 0.5 + 0.5 * (i / (n - 1)); // naik pelan-pelan
  };
  const deret = (pengali: number) =>
    Array.from(
      { length: n },
      (_, i) =>
        Math.round(
          (skala * bentuk(i) * pengali * (0.85 + rnd() * 0.3)) / 1000,
        ) * 1000,
    );
  return { sekarang: deret(1), sebelumnya: deret(0.82) };
}

// Jalur melengkung yang melewati semua titik
function jalur(p: [number, number][]) {
  if (p.length < 2) return "";
  const t = 0.16;
  let d = `M${p[0][0]},${p[0][1]}`;
  for (let i = 0; i < p.length - 1; i++) {
    const a = p[i - 1] ?? p[i];
    const b = p[i];
    const c = p[i + 1];
    const e = p[i + 2] ?? c;
    d += ` C${b[0] + (c[0] - a[0]) * t},${b[1] + (c[1] - a[1]) * t} ${c[0] - (e[0] - b[0]) * t},${c[1] - (e[1] - b[1]) * t} ${c[0]},${c[1]}`;
  }
  return d;
}

const kartu = "rounded-xl border border-white/[0.08] bg-[#151516]";
const tombolKecil =
  "inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2 text-sm font-medium text-neutral-200 transition-colors hover:bg-white/[0.08]";

function Delta({ nilai }: { nilai: number }) {
  const naik = nilai >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-xs font-medium ${naik ? "text-emerald-400" : "text-rose-400"}`}
    >
      {naik ? (
        <ArrowUpRight className="size-3.5" />
      ) : (
        <ArrowDownRight className="size-3.5" />
      )}
      {Math.abs(nilai).toFixed(1).replace(".", ",")}%
    </span>
  );
}

const warnaAvatar = [
  "bg-orange-500/25 text-orange-200",
  "bg-sky-500/25 text-sky-200",
  "bg-emerald-500/25 text-emerald-200",
  "bg-fuchsia-500/25 text-fuchsia-200",
  "bg-amber-500/25 text-amber-200",
];
const Avatar = ({
  nama,
  id,
  kecil,
}: {
  nama: string;
  id: number;
  kecil?: boolean;
}) => (
  <span
    className={`grid shrink-0 place-items-center rounded-full font-medium ${kecil ? "size-8 text-xs" : "size-9 text-xs"} ${warnaAvatar[id % warnaAvatar.length]}`}
    aria-hidden
  >
    {nama
      .split(" ")
      .slice(0, 2)
      .map((k) => k[0])
      .join("")}
  </span>
);

const statusGaya: Record<Status, string> = {
  Lunas: "bg-emerald-500",
  Menunggu: "bg-amber-500",
  Batal: "bg-rose-500",
};

/* ------------------------------------------------------------------ */
/* Sidebar                                                             */
/* ------------------------------------------------------------------ */

function Sidebar({ tutup }: { tutup?: () => void }) {
  const item = (nama: string, Ikon: typeof House, aktif?: boolean) => (
    <a
      key={nama}
      href="#"
      onClick={(e) => e.preventDefault()}
      aria-current={aktif ? "page" : undefined}
      className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
        aktif
          ? "bg-white/[0.08] text-white"
          : "text-neutral-400 hover:bg-white/5 hover:text-neutral-200"
      }`}
    >
      <Ikon className="size-4" />
      {nama}
    </a>
  );

  return (
    <div className="flex h-full w-60 flex-col bg-[#111112] px-3 py-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2.5">
          <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 text-sm font-bold text-black">
            {NAMA_APP[0]}
          </span>
          <span className="font-semibold">{NAMA_APP}</span>
        </div>
        {tutup && (
          <button
            onClick={tutup}
            aria-label="Tutup menu"
            className="rounded-md p-1 text-neutral-400 hover:text-white"
          >
            <X className="size-4" />
          </button>
        )}
      </div>

      <nav className="mt-6 space-y-0.5">
        {menu.map((m) => item(m.nama, m.ikon, m.aktif))}
      </nav>

      <div className="mt-auto space-y-0.5">
        {item("Pengaturan", Settings)}
        {item("Bantuan", LifeBuoy)}
        {item("Buka di browser", ExternalLink)}

        <div className={`${kartu} mt-4 p-3`}>
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-neutral-200">
              Uji coba gratis
            </span>
            <span className="text-neutral-500">sisa 24 hari</span>
          </div>
          <div className="mt-2.5 h-1.5 overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-[20%] rounded-full bg-orange-500" />
          </div>
          <button className="mt-3 w-full rounded-lg border border-white/10 bg-white/[0.04] py-2 text-sm font-medium hover:bg-white/10">
            Upgrade sekarang
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2.5 border-t border-white/[0.08] px-1 pt-4">
          <Avatar nama={PENGGUNA.nama} id={0} />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{PENGGUNA.nama}</p>
            <p className="truncate text-xs text-neutral-500">
              {PENGGUNA.email}
            </p>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-neutral-500" />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Grafik pendapatan                                                   */
/* ------------------------------------------------------------------ */

const LEBAR = 1000;
const TINGGI = 260;

function Grafik({
  rentang,
  hariIni,
}: {
  rentang: Rentang;
  hariIni: Date | null;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const { sekarang, sebelumnya } = useMemo(() => buatData(rentang), [rentang]);
  const n = sekarang.length;

  const label = (i: number) => {
    if (rentang === "12b") return BULAN[i];
    if (rentang === "24j") return `${String(i).padStart(2, "0")}.00`;
    if (!hariIni) return "";
    const d = new Date(hariIni);
    d.setDate(d.getDate() - (n - 1 - i));
    return rentang === "7h"
      ? HARI[d.getDay()]
      : `${d.getDate()} ${BULAN[d.getMonth()]}`;
  };
  const langkah = rentang === "30h" ? 5 : rentang === "24j" ? 3 : 1;

  const maks = Math.max(...sekarang, ...sebelumnya) * 1.1;
  const titik = (deret: number[]): [number, number][] =>
    deret.map((v, i) => [(i / (n - 1)) * LEBAR, TINGGI - (v / maks) * TINGGI]);
  const ps = titik(sekarang);
  const pb = titik(sebelumnya);
  const garis = jalur(ps);

  return (
    <div>
      <div
        className="relative mt-6 h-64 cursor-crosshair"
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const x = Math.min(Math.max((e.clientX - r.left) / r.width, 0), 1);
          setHover(Math.round(x * (n - 1)));
        }}
        onMouseLeave={() => setHover(null)}
      >
        <svg
          viewBox={`0 0 ${LEBAR} ${TINGGI}`}
          preserveAspectRatio="none"
          className="absolute inset-0 size-full overflow-visible"
          role="img"
          aria-label="Grafik pendapatan periode ini dibanding periode sebelumnya"
        >
          <defs>
            <linearGradient id="isi-grafik" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fff" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </linearGradient>
          </defs>
          {[0, 1, 2, 3, 4].map((i) => (
            <line
              key={i}
              x1="0"
              x2={LEBAR}
              y1={(i / 4) * TINGGI}
              y2={(i / 4) * TINGGI}
              stroke="#fff"
              strokeOpacity="0.06"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          <path
            d={`${garis} L${LEBAR},${TINGGI} L0,${TINGGI} Z`}
            fill="url(#isi-grafik)"
          />
          <path
            d={jalur(pb)}
            fill="none"
            stroke="#fff"
            strokeOpacity="0.4"
            strokeWidth="1.5"
            strokeDasharray="2 4"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          <path
            d={garis}
            fill="none"
            stroke="#fff"
            strokeWidth="1.75"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
          {hover !== null && (
            <line
              x1={ps[hover][0]}
              x2={ps[hover][0]}
              y1="0"
              y2={TINGGI}
              stroke="#fff"
              strokeOpacity="0.25"
              vectorEffect="non-scaling-stroke"
            />
          )}
        </svg>

        {hover !== null && (
          <>
            <span
              className="pointer-events-none absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#151516] bg-white"
              style={{
                left: `${(ps[hover][0] / LEBAR) * 100}%`,
                top: `${(ps[hover][1] / TINGGI) * 100}%`,
              }}
            />
            <div
              className={`pointer-events-none absolute z-10 w-52 rounded-lg border border-white/10 bg-[#1d1d1f] p-3 text-xs shadow-xl ${
                ps[hover][1] < TINGGI / 2 ? "bottom-2" : "top-2"
              }`}
              style={{
                left: `clamp(0px, calc(${(ps[hover][0] / LEBAR) * 100}% - 104px), calc(100% - 208px))`,
              }}
            >
              <p className="text-neutral-400">
                {label(hover) || `Titik ${hover + 1}`}
              </p>
              <p className="mt-1.5 flex justify-between gap-4">
                <span className="text-neutral-400">Sekarang</span>
                <span className="font-medium">{rupiah(sekarang[hover])}</span>
              </p>
              <p className="mt-1 flex justify-between gap-4">
                <span className="text-neutral-400">Sebelumnya</span>
                <span className="font-medium text-neutral-300">
                  {rupiah(sebelumnya[hover])}
                </span>
              </p>
            </div>
          </>
        )}
      </div>

      <div className="mt-3 flex justify-between text-xs text-neutral-500">
        {sekarang.map((_, i) => (
          <span
            key={i}
            className="w-0 flex-1 text-center first:text-left last:text-right"
          >
            {i % langkah === 0 ? label(i) : ""}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Halaman                                                             */
/* ------------------------------------------------------------------ */

type Urut = "nama" | "tanggal" | "jumlah";

export default function DashboardPage() {
  const [menuBuka, setMenuBuka] = useState(false);
  const [rentang, setRentang] = useState<Rentang>("12b");
  const [hariIni, setHariIni] = useState<Date | null>(null);
  const [daftar, setDaftar] = useState(pelangganAwal);
  const [cari, setCari] = useState("");
  const [urut, setUrut] = useState<{ kunci: Urut; naik: boolean }>({
    kunci: "tanggal",
    naik: false,
  });
  const [dipilih, setDipilih] = useState<number[]>([]);
  const [tersalin, setTersalin] = useState(false);

  // Tanggal dibaca setelah halaman tampil di browser (menghindari beda tampilan server/browser)
  useEffect(() => setHariIni(new Date()), []);

  const { sekarang, sebelumnya } = useMemo(() => buatData(rentang), [rentang]);
  const total = sekarang.reduce((a, b) => a + b, 0);
  const totalLalu = sebelumnya.reduce((a, b) => a + b, 0);
  const selisih = ((total - totalLalu) / totalLalu) * 100;

  const tampil = useMemo(() => {
    const q = cari.trim().toLowerCase();
    const hasil = daftar.filter(
      (p) => !q || `${p.nama} ${p.akun} ${p.email}`.toLowerCase().includes(q),
    );
    const arah = urut.naik ? 1 : -1;
    return hasil.sort((a, b) => {
      const x = a[urut.kunci];
      const y = b[urut.kunci];
      return (x < y ? -1 : x > y ? 1 : 0) * arah;
    });
  }, [daftar, cari, urut]);

  const semuaDipilih =
    tampil.length > 0 && tampil.every((p) => dipilih.includes(p.id));
  const hapus = (ids: number[]) => {
    setDaftar((d) => d.filter((p) => !ids.includes(p.id)));
    setDipilih((s) => s.filter((id) => !ids.includes(id)));
  };
  const ubahUrut = (kunci: Urut) =>
    setUrut((u) =>
      u.kunci === kunci
        ? { kunci, naik: !u.naik }
        : { kunci, naik: kunci === "nama" },
    );

  const salinLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setTersalin(true);
      setTimeout(() => setTersalin(false), 1800);
    } catch {
      /* clipboard tidak tersedia */
    }
  };

  const th = (kunci: Urut, teks: string, kelas = "") => (
    <th
      className={`px-4 py-3 font-medium ${kelas}`}
      aria-sort={
        urut.kunci === kunci
          ? urut.naik
            ? "ascending"
            : "descending"
          : undefined
      }
    >
      <button
        onClick={() => ubahUrut(kunci)}
        className="inline-flex items-center gap-1 hover:text-neutral-200"
      >
        {teks}
        <ChevronDown
          className={`size-3.5 transition-transform ${urut.kunci === kunci ? (urut.naik ? "rotate-180 text-neutral-200" : "text-neutral-200") : "opacity-40"}`}
        />
      </button>
    </th>
  );

  return (
    <div className="flex h-screen bg-[#0d0d0e] text-neutral-100">
      {/* Sidebar layar lebar */}
      <aside className="hidden shrink-0 border-r border-white/[0.08] lg:block">
        <Sidebar />
      </aside>

      {/* Sidebar layar kecil (laci) */}
      {menuBuka && (
        <div
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMenuBuka(false)}
        >
          <div className="absolute inset-0 bg-black/70" />
          <div
            className="relative h-full w-60"
            onClick={(e) => e.stopPropagation()}
          >
            <Sidebar tutup={() => setMenuBuka(false)} />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1 overflow-y-auto">
        <div className="mx-auto max-w-6xl px-4 py-5 sm:px-6 lg:px-8">
          {/* Atas */}
          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={() => setMenuBuka(true)}
              aria-label="Buka menu"
              className="grid size-9 place-items-center rounded-lg border border-white/10 text-neutral-300 lg:hidden"
            >
              <Menu className="size-4" />
            </button>
            <Avatar nama={PENGGUNA.nama} id={0} kecil />
            <span className="text-neutral-500">/</span>
            <span className="rounded-md bg-white/[0.08] px-2 py-1 text-xs text-neutral-200">
              Dashboard
            </span>
          </div>

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Dashboard saya
            </h1>
            <div className="flex flex-wrap gap-2">
              <button className={tombolKecil}>
                <Sparkles className="size-4 text-orange-400" /> Yang baru
              </button>
              <button onClick={salinLink} className={tombolKecil}>
                <Copy className="size-4" />{" "}
                {tersalin ? "Tersalin" : "Salin link"}
              </button>
              <button className={tombolKecil}>
                Kunjungi toko <ExternalLink className="size-4" />
              </button>
            </div>
          </div>

          {/* Kartu statistik */}
          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {statistik.map(({ label, nilai, delta, ikon: Ikon }) => (
              <div
                key={label}
                className={`${kartu} flex items-center gap-4 p-4`}
              >
                <span className="grid size-10 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.04] text-neutral-400">
                  <Ikon className="size-[18px]" />
                </span>
                <div>
                  <p className="text-xs text-neutral-400">{label}</p>
                  <p className="mt-1 flex items-baseline gap-2">
                    <span className="text-xl font-semibold tracking-tight">
                      {nilai}
                    </span>
                    <Delta nilai={delta} />
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Pendapatan bersih */}
          <section className="mt-8">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm text-neutral-400">Pendapatan bersih</p>
                <p className="mt-1 flex items-baseline gap-2">
                  <span className="text-2xl font-semibold tracking-tight">
                    {rupiah(total)}
                  </span>
                  <Delta nilai={selisih} />
                </p>
              </div>
              <div className="flex items-center gap-2">
                <div
                  role="tablist"
                  aria-label="Rentang waktu"
                  className="flex rounded-lg border border-white/10 bg-white/[0.03] p-0.5"
                >
                  {rentangList.map((r) => (
                    <button
                      key={r.id}
                      role="tab"
                      aria-selected={rentang === r.id}
                      onClick={() => setRentang(r.id)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        rentang === r.id
                          ? "bg-white/[0.12] text-white"
                          : "text-neutral-400 hover:text-neutral-200"
                      }`}
                    >
                      {r.label}
                    </button>
                  ))}
                </div>
                <button className={`${tombolKecil} !py-1.5 text-xs`}>
                  <SlidersHorizontal className="size-3.5" /> Filter
                </button>
              </div>
            </div>

            <Grafik rentang={rentang} hariIni={hariIni} />

            <div className="mt-4 flex items-center gap-5 text-xs text-neutral-400">
              <span className="flex items-center gap-2">
                <span className="h-0.5 w-5 bg-white" /> Periode ini
              </span>
              <span className="flex items-center gap-2">
                <span className="w-5 border-t-2 border-dotted border-white/50" />{" "}
                Periode sebelumnya
              </span>
            </div>
          </section>

          {/* Pelanggan */}
          <section className="mt-10 pb-10">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Pelanggan</h2>
              <div className="flex items-center gap-2">
                {dipilih.length > 0 && (
                  <button
                    onClick={() => hapus(dipilih)}
                    className="inline-flex items-center gap-2 rounded-lg border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-300 hover:bg-rose-500/20"
                  >
                    <Trash2 className="size-4" /> Hapus ({dipilih.length})
                  </button>
                )}
                <label className="relative">
                  <span className="sr-only">Cari pelanggan</span>
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-neutral-500" />
                  <input
                    value={cari}
                    onChange={(e) => setCari(e.target.value)}
                    placeholder="Cari"
                    className="w-56 rounded-lg border border-white/10 bg-white/[0.03] py-2 pl-9 pr-3 text-sm placeholder:text-neutral-500 focus:border-orange-500/60 focus:outline-none"
                  />
                </label>
              </div>
            </div>

            <div className={`${kartu} mt-4 overflow-x-auto`}>
              <table className="w-full min-w-[720px] text-sm">
                <thead>
                  <tr className="border-b border-white/[0.08] text-left text-xs text-neutral-400">
                    <th className="w-12 px-4 py-3">
                      <input
                        type="checkbox"
                        aria-label="Pilih semua"
                        checked={semuaDipilih}
                        onChange={() =>
                          setDipilih(
                            semuaDipilih ? [] : tampil.map((p) => p.id),
                          )
                        }
                        className="size-4 accent-orange-500"
                      />
                    </th>
                    {th("nama", "Pelanggan")}
                    <th className="px-4 py-3 font-medium">Email</th>
                    {th("tanggal", "Tanggal")}
                    <th className="px-4 py-3 font-medium">Status</th>
                    {th("jumlah", "Jumlah")}
                    <th className="w-24 px-4 py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.06]">
                  {tampil.map((p) => (
                    <tr
                      key={p.id}
                      className="transition-colors hover:bg-white/[0.03]"
                    >
                      <td className="px-4 py-3">
                        <input
                          type="checkbox"
                          aria-label={`Pilih ${p.nama}`}
                          checked={dipilih.includes(p.id)}
                          onChange={() =>
                            setDipilih((s) =>
                              s.includes(p.id)
                                ? s.filter((x) => x !== p.id)
                                : [...s, p.id],
                            )
                          }
                          className="size-4 accent-orange-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar nama={p.nama} id={p.id} />
                          <div>
                            <p className="font-medium">{p.nama}</p>
                            <p className="text-xs text-neutral-500">{p.akun}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-neutral-300">{p.email}</td>
                      <td className="whitespace-nowrap px-4 py-3 text-neutral-300">
                        {tglPendek(p.tanggal)}
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2 py-1 text-xs">
                          <span
                            className={`size-1.5 rounded-full ${statusGaya[p.status]}`}
                          />
                          {p.status}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 font-medium">
                        {rupiah(p.jumlah)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-1">
                          <button
                            onClick={() => hapus([p.id])}
                            title="Hapus"
                            aria-label={`Hapus ${p.nama}`}
                            className="rounded-md p-1.5 text-neutral-500 hover:bg-white/10 hover:text-rose-400"
                          >
                            <Trash2 className="size-4" />
                          </button>
                          <button
                            title="Ubah"
                            aria-label={`Ubah ${p.nama}`}
                            className="rounded-md p-1.5 text-neutral-500 hover:bg-white/10 hover:text-neutral-200"
                          >
                            <Pencil className="size-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {tampil.length === 0 && (
                    <tr>
                      <td
                        colSpan={7}
                        className="px-4 py-10 text-center text-neutral-500"
                      >
                        {daftar.length === 0
                          ? "Belum ada pelanggan."
                          : "Tidak ada pelanggan yang cocok."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
