'use client'
import Image from "next/image";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import Cookies from "js-cookie";

export default function ProductDetail({ params }) {
    const router = useRouter();
    const { data: session } = useSession();
    const resolvedParams = use(params);
    const [loading, setLoading] = useState(false);
    const [product, setProduct] = useState(null);
    const [productLoading, setProductLoading] = useState(true);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const res = await fetch(`/api/product/${resolvedParams.id}`, {
                    cache: "no-store",
                });
                const productData = await res.json();
                
                if (!productData || res.status === 404) {
                    setError("Produk tidak ditemukan");
                } else {
                    setProduct(productData);
                }
            } catch (err) {
                console.error("Error fetching product:", err);
                setError("Gagal memuat produk");
            } finally {
                setProductLoading(false);
            }
        };

        fetchProduct();
    }, [resolvedParams.id]);

    // Fungsi untuk mengatur quantity
    const increaseQuantity = () => {
        setQuantity(prev => prev + 1);
    };

    const decreaseQuantity = () => {
        if (quantity > 1) {
            setQuantity(prev => prev - 1);
        }
    };

    const handleAddToCart = async () => {
        // Cek apakah user sudah login (NextAuth atau JWT)
        const isNextAuthLoggedIn = session?.user?.id_user;
        const jwtToken = Cookies.get("access_token");
        
        if (!isNextAuthLoggedIn && !jwtToken) {
            alert("Silakan login terlebih dahulu!");
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_produk: product.id_produk,
                    jumlah_pembelian: quantity,
                    harga_satuan: product.harga_kg,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menambahkan ke keranjang");
            alert("Produk berhasil ditambahkan ke keranjang!");
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOrderNow = async () => {
        // Cek apakah user sudah login (NextAuth atau JWT)
        const isNextAuthLoggedIn = session?.user?.id_user;
        const jwtToken = Cookies.get("access_token");
        
        if (!isNextAuthLoggedIn && !jwtToken) {
            alert("Silakan login terlebih dahulu!");
            router.push("/login");
            return;
        }

        setLoading(true);
        try {
            // Tambahkan produk ke keranjang dulu
            const res = await fetch("/api/cart/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    id_produk: product.id_produk,
                    jumlah_pembelian: quantity,
                    harga_satuan: product.harga_kg,
                }),
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Gagal menambahkan ke keranjang");
            
            // Redirect ke payment page
            router.push("/payment");
        } catch (err) {
            console.error(err);
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (productLoading) {
        return (
            <div className="flex h-screen w-full justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memuat produk...</p>
                </div>
            </div>
        );
    }

    if (error || !product) {
        return (
            <div className="flex h-screen w-full justify-center items-center">
                <div className="text-center">
                    <p className="text-red-600 text-lg">{error || "Produk tidak ditemukan"}</p>
                    <button 
                        onClick={() => router.push("/product")}
                        className="mt-4 bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition"
                    >
                        Kembali ke Daftar Produk
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
        <Navbar textColor="text-black"/>
            <div className="min-h-screen flex flex-col items-center justify-center py-10 px-6">
                <div className="max-w-4xl w-full bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="flex flex-col md:flex-row">
                        <div className="relative w-full md:w-1/2 h-[400px]">
                            <Image
                            src={product.image_url || "/product-media/default.jpg"}
                            alt={product.nama_produk}
                            fill
                            className="object-cover"
                            />
                        </div>

                        <div className="p-6 md:w-1/2 flex flex-col justify-between">
                            <div>
                                <h1 className="text-3xl font-bold mb-4">{product.nama_produk}</h1>
                                <p className="text-gray-600 mb-6">{product.deskripsi || "Tidak ada deskripsi."}</p>
                                <p className="text-2xl font-semibold text-blue-600">
                                    Rp {product.harga_kg.toLocaleString()} / kg
                                </p>
                                <p className="text-lg font-medium text-green-600">
                                    Total: Rp {(product.harga_kg * quantity).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex gap-3 items-center">
                                <p className="text-gray-600">Quantity:</p>
                                <button 
                                    onClick={decreaseQuantity}
                                    disabled={quantity <= 1}
                                    className="px-3 text-2xl bg-gray-200 hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed rounded"
                                >
                                    -
                                </button>
                                <p className="px-4 py-2 bg-gray-100 rounded min-w-12 text-center">{quantity}</p>
                                <button 
                                    onClick={increaseQuantity}
                                    className="px-3 text-2xl bg-gray-200 hover:bg-gray-300 rounded"
                                >
                                    +
                                </button>
                            </div>
                            <div className="flex gap-5 items-end w-full">
                                <button onClick={handleAddToCart} disabled={loading} className="mt-6 bg-gray-200 text-blue-800 py-2 px-8 rounded-sm border border-blue-800 transition disabled:opacity-50">{loading ? "Adding..." : "Add To Cart"}</button>
                                <button onClick={handleOrderNow} disabled={loading} className="mt-6 bg-blue-800 text-white py-2 px-8 rounded-sm hover:bg-blue-900 transition disabled:opacity-50">{loading ? "Processing..." : "Order Now"}</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        <Footer/>
        </>
    );
}
