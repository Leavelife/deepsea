'use client'
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function MockPaymentPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("id");
  const [loading, setLoading] = useState(false);

  const handleSimulatePay = async () => {
    setLoading(true);
    const res = await fetch("/api/payment/webhook", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentId }),
    });

    const data = await res.json();
    setLoading(false);

    if (res.ok) {
      alert("Pembayaran berhasil (simulasi)!");
      router.push("/payment/success");
    } else {
      alert(data.error || "Gagal simulasi pembayaran");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <h1 className="text-3xl font-bold mb-4 text-blue-800">Mock Payment Gateway</h1>
      <p className="mb-6 text-gray-600">ID Pembayaran: {paymentId}</p>
      <button
        onClick={handleSimulatePay}
        disabled={loading}
        className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
      >
        {loading ? "Memproses..." : "Bayar Sekarang (Simulasi)"}
      </button>
    </div>
  );
}
