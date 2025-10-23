"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useEffect, useState, useRef } from "react";
import gsap from "gsap";
import { IoCartOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";


export default function Navbar({ serverSession }) {

  const { data: clientSession, status } = useSession();
  const session = clientSession ?? serverSession;
  const [jwtUser, setJwtUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scrolled, setScrolled] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sidebarRef = useRef(null)
  const overlayRef = useRef(null)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      // aktifkan saat scroll > 50px
      if (scrollTop > 50 && !scrolled) setScrolled(true);
      // kembalikan transparan kalau balik ke atas
      else if (scrollTop <= 50 && scrolled) setScrolled(false);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [scrolled]);

  // Ambil user dari token manual (kalau ada)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch("/api/me");
        if (res.ok) {
          const data = await res.json();
          if (data?.user) setJwtUser(data.user);
        }
      } catch (err) {
        console.error("Gagal ambil user JWT:", err);
      } finally {
        setLoading(false); // <- selesai cek token
      }
    };

    // kalau NextAuth masih loading, tunggu dulu
    if (status === "loading") return;
    fetchUser();
  }, [status]);

  // Logout handle gabungan
  const handleLogout = async () => {
    try {
      await fetch("/api/logout", { method: "POST" }); // hapus cookies JWT
      signOut({ callbackUrl: "/" }); // logout NextAuth
      setJwtUser(null);
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  // Ambil username dari dua sumber (NextAuth / JWT)
  const username = session?.user?.name || jwtUser?.username;

  // Animasi sidebar & overlay
  useEffect(() => {
    const sidebar = sidebarRef.current;
    const overlay = overlayRef.current;
    if (!sidebar || !overlay) return;

    if (isMenuOpen) {
      gsap.set(sidebar, { x: "-100%" });
      gsap.set(overlay, { opacity: 0, pointerEvents: "auto" });
      gsap.to(sidebar, { x: 0, duration: 0.35, ease: "power3.out" });
      gsap.to(overlay, { opacity: 1, duration: 0.35, ease: "power3.out" });
    } else {
      gsap.to(sidebar, { x: "-100%", duration: 0.3, ease: "power3.in" });
      gsap.to(overlay, { opacity: 0, duration: 0.3, ease: "power3.in", onComplete: () => {
        overlay.style.pointerEvents = "none";
      }});
    }
  }, [isMenuOpen]);

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") setIsMenuOpen(false); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Saat loading (hindari flicker)
  if (loading) {
    return (
      <nav className={`fixed flex items-center justify-between px-5 md:px-15 py-4 w-screen z-50 transition-all duration-500 ${
        scrolled
          ? "bg-white text-black" :
          "bg-transparent text-white"}`}>
        <div className="w-full flex items-center justify-between gap-8">
          <Link href="/" className="font-semibold text-xl">DeepSea</Link>
          <div className="nav-link hidden md:block">
            <ul className="flex items-center gap-8 mr-5 font-semibold">
              <li><Link href={"/product"}>Product</Link></li>
              <li><Link href={"/about"}>About Deepsea</Link></li>
              <li><Link href={"/sustainability"}>Sustainability</Link></li>
              <li><Link href={"/contact"}>Contact Me</Link></li>
              <li className="text-xl"><Link href="/cart"><IoCartOutline /></Link></li>
            </ul>
          </div>
          <button
            aria-label="Open Menu"
            aria-expanded={isMenuOpen}
            onClick={() => setIsMenuOpen(true)}
            className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded text-current border border-current"
          >
            <span className="sr-only">Open menu</span>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-sm text-white animate-pulse">Loading...</span>
        </div>
        <div ref={overlayRef} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/40 opacity-0 pointer-events-none md:hidden"></div>
        <aside ref={sidebarRef} className={`fixed top-0 left-0 h-1/3 w-screen md:hidden ${scrolled ? "bg-white text-black" : "bg-white text-black"} shadow-xl`} role="dialog" aria-modal="true">
          <div className="flex items-center justify-between px-5 py-4 border-b">
            <span className="font-semibold">Menu</span>
            <button aria-label="Close Menu" onClick={() => setIsMenuOpen(false)} className="inline-flex w-8 h-8 items-center justify-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>
          <nav className="px-5 py-4">
            <ul className="flex flex-col gap-4 font-semibold">
              <li><Link href="/product" onClick={() => setIsMenuOpen(false)}>Product</Link></li>
              <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>About Deepsea</Link></li>
              <li><Link href="/sustainability" onClick={() => setIsMenuOpen(false)}>Sustainability</Link></li>
              <li><Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact Me</Link></li>
              <li className="text-xl"><Link href="/cart" onClick={() => setIsMenuOpen(false)}><IoCartOutline /> Cart</Link></li>
            </ul>
          </nav>
        </aside>
      </nav>
    );
  }

  return (
    <nav className={`fixed flex items-center justify-between px-5 md:px-15 py-4 w-screen z-50 transition-all duration-500 ${
      scrolled 
      ? "bg-white text-black"
      : "bg-transparent text-white"}`}>
      <div className="w-full flex items-center justify-between gap-8">
        <Link href="/" className="font-semibold text-xl">DeepSea</Link>
        <div className="nav-link hidden md:block">
          <ul className="flex items-center gap-8 mr-5 font-semibold">
            <li><Link href={"/about"}>About Deepsea</Link></li>
            <li><Link href={"/product"}>Product</Link></li>
            <li><Link href={"/sustainability"}>Sustainability</Link></li>
            <li><Link href={"/contact"}>Contact</Link></li>
            <li className="text-xl"><Link href="/cart"><IoCartOutline /></Link></li>
          </ul>
        </div>
        <button
          aria-label="Open Menu"
          aria-expanded={isMenuOpen}
          onClick={() => setIsMenuOpen(true)}
          className="md:hidden inline-flex items-center justify-center w-9 h-9 rounded text-current border border-current"
        >
          <span className="sr-only">Open menu</span>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
        </button>
      </div>
      {username ? (
        <div className="hidden md:flex items-center gap-4">
          <Link href={"/profile"} className="text-2xl">
            <CgProfile/>
          </Link>
        </div>
      ) : (
        <div className="hidden md:flex items-center">
          <button className="px-3 py-1 bg-transparent text-white font-semibold cursor-pointer">
            <Link href="/login">Login</Link>
          </button>
        </div>
      )}
      
      <div ref={overlayRef} onClick={() => setIsMenuOpen(false)} className="fixed inset-0 bg-black/40 opacity-0 pointer-events-none md:hidden"></div>
      
      <aside ref={sidebarRef} className={`fixed top-1 left-0 w-11/12 md:hidden p-2 ${scrolled ? "bg-white text-black" : "bg-white text-black"} shadow-xl`} role="dialog" aria-modal="true">
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <span className="font-semibold">Menu</span>
          <button aria-label="Close Menu" onClick={() => setIsMenuOpen(false)} className="inline-flex w-8 h-8 items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>
        <nav className="px-5 py-4">
          <ul className="flex flex-col gap-4 font-semibold">
            <li><Link href="/about" onClick={() => setIsMenuOpen(false)}>About Deepsea</Link></li>
            <li><Link href="/product" onClick={() => setIsMenuOpen(false)}>Product</Link></li>
            <li><Link href="/sustainability" onClick={() => setIsMenuOpen(false)}>Sustainability</Link></li>
            <li><Link href="/contact" onClick={() => setIsMenuOpen(false)}>Contact Me</Link></li>
            <li><Link href="/cart" onClick={() => setIsMenuOpen(false)} className="flex gap-2 items-center"><IoCartOutline />Cart</Link></li>
            {username ? (
              <li><Link href={"/profile"} onClick={() => { setIsMenuOpen(false); handleLogout(); }} >Profile</Link></li>
            ) : (
              <li><Link href="/login" onClick={() => setIsMenuOpen(false)} >Sign in</Link></li>
            )}
          </ul>
        </nav>
      </aside>
    </nav>
  );
}
