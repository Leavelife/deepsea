import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
  try {
    const product = await prisma.produk.findUnique({
      where: { id_produk: Number(params.id) },
    });

    if (!product) {
      return NextResponse.json({ message: "Produk tidak ditemukan" }, { status: 404 });
    }

    // Map kolom gambar -> image_url untuk kompatibilitas frontend
    return NextResponse.json({
      ...product,
      image_url: product.gambar || null,
    });
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
