'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const { data: session, status } = useSession();

    useEffect(() => {
        const fetchUser = async () => {
            try {
                // Jika ada NextAuth session (Google Auth), gunakan data dari session
                if (session?.user) {
                    setUser({
                        id_user: session.user.id_user,
                        username: session.user.username || session.user.name,
                        email: session.user.email,
                        image: session.user.image,
                        authProvider: 'google'
                    });
                    setLoading(false);
                    return;
                }

                // Jika tidak ada NextAuth session, coba ambil dari JWT
                const res = await fetch('/api/me');
                const data = await res.json();
                
                if (res.ok && data.user) {
                    setUser({
                        ...data.user,
                        authProvider: 'jwt'
                    });
                } else {
                    // Jika tidak ada user dari kedua sistem, redirect ke login
                    console.log('User tidak ditemukan, redirect ke login');
                    router.push('/login');
                    return;
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