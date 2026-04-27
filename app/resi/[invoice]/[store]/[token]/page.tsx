"use client";

import { useState, FormEvent } from "react";
import { use } from "react";
import toast from "react-hot-toast";
import axios from "axios";

interface PageProps {
  params: Promise<{
    invoice: string;
    store: string;
    token: string;
  }>;
}

export default function ResiPage({ params }: PageProps) {
  const { invoice, store, token } = use(params);
  const decodedInvoice = decodeURIComponent(invoice);

  const [resi, setResi] = useState("");
  const [loading, setLoading] = useState(false);

  const submitResi = async (e: FormEvent) => {
    e.preventDefault();

    console.log(decodedInvoice, store, token, resi);

    if (!resi.trim()) {
      toast.error("Nomor resi wajib diisi");
      return;
    }

    setLoading(true);

    try {
      await axios.post("http://localhost:8000/api/resi/submit", {
        invoice: decodedInvoice,
        store,
        token,
        resi,
      });

      toast.success("Resi berhasil disimpan");
      setResi("");
    } catch (err) {
      if (axios.isAxiosError(err)) {
        toast.error(
          err.response?.data?.message || "Token tidak valid / expired",
        );
      } else {
        toast.error("Terjadi kesalahan");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 px-4">
      <form
        onSubmit={submitResi}
        className="w-full max-w-md bg-white p-6 shadow-lg"
      >
        <h1 className="mb-4 text-xl font-semibold">Input Resi Pengiriman</h1>

        <p className="mb-2 text-sm text-gray-600">
          <b>Invoice:</b> {decodedInvoice}
        </p>
        <p className="mb-4 text-sm text-gray-600">
          <b>Store:</b> {store}
        </p>

        <input
          value={resi}
          onChange={(e) => setResi(e.target.value)}
          placeholder="Nomor resi"
          className="mb-4 w-full border px-3 py-2 focus:outline-none"
        />

        <button
          disabled={loading}
          className="w-full bg-black py-2 text-white hover:opacity-80 disabled:opacity-60 cursor-pointer"
        >
          {loading ? "Menyimpan..." : "Simpan Resi"}
        </button>
      </form>
    </div>
  );
}
