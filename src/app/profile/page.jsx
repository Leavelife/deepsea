'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editingAlamat, setEditingAlamat] = useState(false);
    const [alamat, setAlamat] = useState("");
    const [savingAlamat, setSavingAlamat] = useState(false);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                let userData = null;

                // Jika ada NextAuth session (Google Auth), ambil data lengkap dari API
                if (session?.user?.id_user) {
                    const res = await fetch('/api/me');
                    const data = await res.json();
                    
                    if (res.ok && data.user) {
                        userData = {
                            ...data.user,
                            authProvider: 'google'
                        };
                    } else {
                        // Fallback ke session data
                        userData = {
                            id_user: session.user.id_user,
                            username: session.user.username || session.user.name,
                            email: session.user.email,
                            image: session.user.image,
                            authProvider: 'google',
                            alamat: session.user.alamat || null
                        };
                    }
                } else {
                    // Jika tidak ada NextAuth session, coba ambil dari JWT
                    const res = await fetch('/api/me');
                    const data = await res.json();
                    
                    if (res.ok && data.user) {
                        userData = {
                            ...data.user,
                            authProvider: 'jwt'
                        };
                    } else {
                        // Jika tidak ada user dari kedua sistem, redirect ke login
                        console.log('User tidak ditemukan, redirect ke login');
                        router.push('/login');
                        return;
                    }
                }

                if (userData) {
                    setUser(userData);
                    setAlamat(userData.alamat || "");
                }
            } catch (err) {
                console.error('Gagal ambil user:', err);
                // Jika ada error, redirect ke login
                router.push('/login');
                return;
            } finally {
                setLoading(false);
            }
        };

        // Tunggu NextAuth session selesai loading
        if (status === 'loading') return;
        
        // Jika NextAuth session tidak ada dan tidak loading, langsung cek JWT
        if (status === 'unauthenticated') {
            fetchUser();
        } else {
            fetchUser();
        }
    }, [session, status, router]);

    const handleLogout = async () => {
        try {
            await fetch('/api/logout', { method: 'POST' });
            await signOut({ callbackUrl: '/login' });
        } catch (err) {
            console.error('Logout error:', err);
        }
    };

    const handleSaveAlamat = async () => {
        if (!alamat.trim()) {
            alert("Alamat tidak boleh kosong");
            return;
        }

        setSavingAlamat(true);
        try {
            const res = await fetch('/api/profile/update-alamat', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ alamat }),
            });

            const data = await res.json();

            if (res.ok) {
                setUser({ ...user, alamat: data.user.alamat });
                setEditingAlamat(false);
                alert("Alamat berhasil diperbarui!");
            } else {
                alert(data.error || "Gagal memperbarui alamat");
            }
        } catch (err) {
            console.error('Error saving address:', err);
            alert("Terjadi kesalahan saat menyimpan alamat");
        } finally {
            setSavingAlamat(false);
        }
    };

    // Jika masih loading atau user belum ditemukan, tampilkan loading
    if (loading || !user) {
        return (
            <div className="flex h-dvh w-full justify-center items-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Memverifikasi akses...</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Navbar textColor="text-black" />
            <div className="min-h-screen flex flex-col items-center justify-center py-10 px-6 bg-gray-50">
                <div className="max-w-2xl w-full bg-white rounded-2xl shadow-lg p-8">
                    <h1 className="text-3xl font-bold mb-6">Profile Page</h1>
                    
                    <div className="space-y-4">
                        <div>
                            <label className="text-gray-600 font-semibold">Username:</label>
                            <p className="text-lg">{user?.username || 'Loading...'}</p>
                        </div>
                        <div>
                            <label className="text-gray-600 font-semibold">Email:</label>
                            <p className="text-lg">{user?.email || 'Loading...'}</p>
                        </div>
                        
                        <div>
                            <label className="text-gray-600 font-semibold block mb-2">Alamat:</label>
                            {editingAlamat ? (
                                <div className="space-y-2">
                                    <textarea
                                        value={alamat}
                                        onChange={(e) => setAlamat(e.target.value)}
                                        placeholder="Masukkan alamat lengkap"
                                        className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        rows="3"
                                    />
                                    <div className="flex gap-2">
                                        <button
                                            onClick={handleSaveAlamat}
                                            disabled={savingAlamat}
                                            className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                                        >
                                            {savingAlamat ? "Menyimpan..." : "Simpan"}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setAlamat(user?.alamat || "");
                                                setEditingAlamat(false);
                                            }}
                                            disabled={savingAlamat}
                                            className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition disabled:opacity-50"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-lg mb-2">{user?.alamat || "Belum ada alamat"}</p>
                                    <button
                                        onClick={() => setEditingAlamat(true)}
                                        className="text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        {user?.alamat ? "Edit Alamat" : "Tambah Alamat"}
                                    </button>
                                </div>
                            )}
                        </div>
                        
                        <button 
                            onClick={handleLogout}
                            className="mt-6 w-full bg-red-500 text-white py-3 px-4 rounded-lg hover:bg-red-600 transition font-semibold"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
            <Footer />
        </>
    );
}

export default ProfilePage;
