'use client';
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function PaymentPage() {
  const [cartItems, setCartItems] = useState([]);
  const [jasaList, setJasaList] = useState([]);
  const [selectedJasa, setSelectedJasa] = useState("");
  const [metode, setMetode] = useState("");
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === 'loading') return; // tunggu next-auth siap

    // Cek apakah user sudah login (NextAuth atau JWT)
    const isNextAuthLoggedIn = status === 'authenticated' && session?.user?.id_user;
    const jwtToken = Cookies.get("access_token");
    
    if (!isNextAuthLoggedIn && !jwtToken) {
      alert("Silakan login terlebih dahulu!");
      router.push("/login");
      return;
    }

    fetchCart();
    fetchJasa();
  }, [status, session, router]);

  const fetchCart = async () => {
    const res = await fetch("/api/cart");
    const data = await res.json();
    if (!res.ok) return alert(data.error || "Gagal memuat data keranjang");

    setCartItems(data);
    const totalHarga = data.reduce((sum, item) => sum + item.total_harga, 0);
    setTotal(totalHarga);
  };

  const fetchJasa = async () => {
    const res = await fetch("/api/shipping_service");
    const data = await res.json();
    if (!res.ok) return alert("Gagal memuat data jasa pengiriman");
    setJasaList(data);
  };

  const handlePayment = async () => {
    if (!metode) return alert("Pilih metode pembayaran!");
    if (!selectedJasa) return alert("Pilih jasa pengiriman!");

    setLoading(true);
    try {
      const res = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id_pengiriman: selectedJasa, metode }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Pembayaran gagal");
      alert("Transaksi berhasil!");
      router.push("/history");
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  const ongkir = jasaList.find((j) => j.id_pengiriman == selectedJasa)?.harga_pengiriman || 0;
  const grandTotal = total + ongkir;

  return (
    <>
      <Navbar textColor="text-black" />
      <div className="min-h-screen py-10 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-blue-900">Checkout Pembayaran</h1>

          <div className="space-y-4">
            {cartItems.map((item) => (
              <div key={item.id_keranjang} className="flex justify-between border-b pb-2">
                <p>{item.produk?.nama_produk}</p>
                <p>Rp {item.total_harga.toLocaleString()}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <label className="block text-gray-700 font-semibold mb-2">
              Pilih Jasa Pengiriman:
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={selectedJasa}
              onChange={(e) => setSelectedJasa(e.target.value)}
            >
              <option value="">-- Pilih Jasa --</option>
              {jasaList.map((j) => (
                <option key={j.id_pengiriman} value={j.id_pengiriman}>
                  {j.jasa_kirim} - Rp {j.harga_pengiriman.toLocaleString()}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 font-semibold mb-2">
              Pilih Metode Pembayaran:
            </label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={metode}
              onChange={(e) => setMetode(e.target.value)}
            >
              <option value="">-- Pilih Metode --</option>
              <option value="transfer_bank">Transfer Bank</option>
              <option value="e_wallet">E-Wallet</option>
              <option value="cod">COD</option>
            </select>
          </div>

          <div className="mt-6 border-t pt-4 flex justify-between">
            <h2 className="text-xl font-bold text-gray-800">Subtotal:</h2>
            <span>Rp {total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between">
            <h2 className="text-xl font-bold text-gray-800">Ongkir:</h2>
            <span>Rp {ongkir.toLocaleString()}</span>
          </div>

          <div className="mt-2 border-t pt-4 flex justify-between text-blue-800 font-bold text-2xl">
            <h2>Total:</h2>
            <span>Rp {grandTotal.toLocaleString()}</span>
          </div>

          <button
            onClick={handlePayment}
            disabled={loading}
            className="mt-8 w-full bg-blue-700 text-white py-3 rounded-lg hover:bg-blue-800 transition"
          >
            {loading ? "Memproses..." : "Bayar Sekarang"}
          </button>
        </div>
      </div>
      <Footer />
    </>
  );
}
