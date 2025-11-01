'use client';
import { useEffect, useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function CartPage() {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const router = useRouter();
  const { data: session, status } = useSession();

  // 🔐 Cek login via NextAuth (Google) atau JWT cookie
  useEffect(() => {
    if (status === 'loading') return; // tunggu next-auth siap

    // Jika login via NextAuth, langsung fetch
    if (status === 'authenticated' && session?.user?.id_user) {
      fetchCart();
      return;
    }

    // Jika tidak authenticated NextAuth, cek JWT cookie
    const token = Cookies.get("access_token");
    if (token) {
      fetchCart();
      return;
    }

    // Tidak ada keduanya → minta login
    alert("Silakan login terlebih dahulu!");
    router.push("/login");
  }, [status, session, router]);

  // 🛒 Ambil isi keranjang user
  const fetchCart = async () => {
    try {
      const res = await fetch("/api/cart", {
        cache: "no-store",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal memuat data keranjang");

      setCartItems(data);
      const totalHarga = data.reduce(
        (sum, item) => sum + item.total_harga,
        0
      );
      setTotal(totalHarga);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 🗑️ Hapus item dari keranjang
  const handleRemove = async (id_keranjang) => {
    if (!confirm("Yakin mau menghapus produk ini dari keranjang?")) return;

    try {
      const res = await fetch(`/api/cart/${id_keranjang}`, {
        method: "DELETE",
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menghapus item");

      alert("Produk berhasil dihapus dari keranjang!");
      fetchCart();
    } catch (err) {
      console.error(err);
      alert(err.message);
    }
  };

  // 🧾 Loading state
  if (loading) {
    return (
      <div className="flex h-screen justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  // Error / kosong
  if (error || cartItems.length === 0) {
    return (
      <>
        <Navbar textColor="text-black" />
        <div className="flex flex-col items-center justify-center min-h-screen">
          <p className="text-lg text-gray-700">
            {error ? error : "Keranjang kamu masih kosong 😢"}
          </p>
          <button
            onClick={() => router.push("/product")}
            className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            Lihat Produk
          </button>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar textColor="text-black" />
      <div className="min-h-screen py-10 px-6 bg-gray-50">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl shadow-lg p-6">
          <h1 className="text-3xl font-bold mb-6 text-blue-900">Keranjang Saya</h1>

          <div className="space-y-6">
            {cartItems.map((item) => (
              <div
                key={item.id_keranjang}
                className="flex flex-col md:flex-row items-center justify-between border-b pb-4"
              >
                <div className="flex items-center gap-4 w-full md:w-auto">
                  <img
                    src={item.produk?.image_url || "/product-media/default.jpg"}
                    alt={item.produk?.nama_produk}
                    className="w-20 h-20 object-cover rounded-md border"
                  />
                  <div>
                    <h2 className="text-lg font-semibold">{item.produk?.nama_produk}</h2>
                    <p className="text-gray-600 text-sm">
                      Rp {item.produk?.harga_kg.toLocaleString()} / kg
                    </p>
                    <p className="text-sm text-gray-500">
                      Jumlah: {item.jumlah_pembelian}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end mt-4 md:mt-0">
                  <p className="text-xl font-semibold text-blue-700">
                    Rp {item.total_harga.toLocaleString()}
                  </p>
                  <button
                    onClick={() => handleRemove(item.id_keranjang)}
                    className="mt-2 text-red-600 hover:text-red-800 text-sm"
                  >
                    Hapus
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex justify-between items-center border-t pt-6">
            <h2 className="text-2xl font-bold text-blue-900">
              Total: Rp {total.toLocaleString()}
            </h2>
            <button
              className="bg-blue-700 text-white px-6 py-3 rounded-md hover:bg-blue-800 transition"
              onClick={() => router.push("/payment")}
            >
              Checkout
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
