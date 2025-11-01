import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const data = await prisma.jasa_pengirim.findMany();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (err) {
    return new Response(JSON.stringify({ error: "Gagal memuat jasa pengiriman" }), {
      status: 500,
    });
  }
}
export async function POST(req) {
    try {
      const { jasa_kirim, harga_pengiriman } = await req.json();
  
      if (!jasa_kirim || harga_pengiriman === undefined) {
        return NextResponse.json({ error: "jasa_pengirim dan harga_pengiriman wajib diisi" }, { status: 400 });
      }
  
      const jasaBaru = await prisma.jasa_pengirim.create({
        data: {
          jasa_kirim,
          harga_pengiriman: harga_pengiriman || null,
        },
      });
  
      // Sertakan image_url untuk kompatibilitas frontend
      return NextResponse.json({ ...jasaBaru }, { status: 201 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ error: "Gagal menambah jasa pengirim" }, { status: 500 });
    }
}