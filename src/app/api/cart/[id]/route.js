import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { getUserIdFromRequest } from "@/lib/authHelper";

export async function DELETE(req, { params }) {
  try {
    // Dapatkan user ID dari kedua sistem authentication
    const { userId, authType } = await getUserIdFromRequest(req);
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized - Silakan login terlebih dahulu" }, { status: 401 });
    }

    console.log(`User authenticated via ${authType}, userId: ${userId}`);

    const id = Number(params.id);

    // Pastikan item keranjang milik user yang sedang login
    const cartItem = await prisma.keranjang.findFirst({
      where: {
        id_keranjang: id,
        id_user: userId,
      },
    });

    if (!cartItem) {
      return NextResponse.json({ error: "Item tidak ditemukan atau bukan milik Anda" }, { status: 404 });
    }

    await prisma.keranjang.delete({
      where: {
        id_keranjang: id,
      },
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (err) {
    console.error("Error deleting cart item:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
