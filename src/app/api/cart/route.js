import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function GET(req) {
  try {
    // Dapatkan user ID dari kedua sistem authentication
    const { userId, authType } = await getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Silakan login terlebih dahulu" }, { status: 401 });
    }

    console.log(`User authenticated via ${authType}, userId: ${userId}`);

    const cart = await prisma.keranjang.findMany({
      where: { id_user: userId },
      include: {
        produk: true, // biar bisa tampilkan nama produk, gambar, harga, dll
      },
    });

    return NextResponse.json(cart, { status: 200 });
  } catch (err) {
    console.error("Error fetching cart:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
