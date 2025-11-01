import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function POST(req) {
  try {
    // Dapatkan user ID dari kedua sistem authentication
    const { userId, authType } = await getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Silakan login terlebih dahulu" }, { status: 401 });
    }

    console.log(`User authenticated via ${authType}, userId: ${userId}`);

    const { id_produk, jumlah_pembelian, harga_satuan } = await req.json();

    // Hitung total harga
    const total_harga = jumlah_pembelian * harga_satuan;

    // Cek apakah produk sudah ada di keranjang user ini
    const existing = await prisma.keranjang.findFirst({
      where: {
        id_user: userId,
        id_produk,
      },
    });

    let item;
    if (existing) {
      item = await prisma.keranjang.update({
        where: { id_keranjang: existing.id_keranjang },
        data: {
          jumlah_pembelian: existing.jumlah_pembelian + jumlah_pembelian,
          total_harga: existing.total_harga + total_harga,
        },
      });
    } else {
      item = await prisma.keranjang.create({
        data: {
          id_user: userId,
          id_produk,
          jumlah_pembelian,
          total_harga,
        },
      });
    }

    return NextResponse.json(item, { status: 200 });
  } catch (err) {
    console.error("Error adding to cart:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
