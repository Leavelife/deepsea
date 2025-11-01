import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    // Ambil semua produk tanpa kategori (tabel kategori sudah dihapus)
    const produk = await prisma.produk.findMany();

    // Map kolom baru agar kompatibel dengan frontend yang memakai image_url
    const shaped = produk.map((p) => ({
      ...p,
      image_url: p.gambar || null,
    }));

    console.log("API Product - Found products:", shaped.length);
    return NextResponse.json(shaped);
  } catch (error) {
    console.error("API Product Error:", error);
    return NextResponse.json({ error: "Gagal mengambil data produk" }, { status: 500 });
  }
}

// POST tambah produk
export async function POST(req) {
  try {
    const { nama_produk, stok_kg, harga_kg, deskripsi, status, gambar } = await req.json();

    if (!nama_produk || harga_kg === undefined || harga_kg === null) {
      return NextResponse.json({ error: "nama_produk dan harga_kg wajib diisi" }, { status: 400 });
    }

    const produkBaru = await prisma.produk.create({
      data: {
        nama_produk,
        stok_kg: stok_kg !== undefined ? Number(stok_kg) : 0,
        harga_kg: Number(harga_kg),
        deskripsi: deskripsi || null,
        status: status || null,
        gambar: gambar || null,
      },
    });

    // Sertakan image_url untuk kompatibilitas frontend
    return NextResponse.json({ ...produkBaru, image_url: produkBaru.gambar || null }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal menambah produk" }, { status: 500 });
  }
}
