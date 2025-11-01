// /app/api/payment/webhook/route.js
import { prisma } from "@/lib/prisma";

export async function POST(req) {
  try {
    const { paymentId } = await req.json();

    // Cari transaksi berdasarkan id_payment (kalau disimpan, di sini contoh simple)
    const transaksi = await prisma.transaksi.findFirst({
      orderBy: { id_transaksi: "desc" },
    });

    if (!transaksi)
      return Response.json({ error: "Transaksi tidak ditemukan" }, { status: 404 });

    // Update status transaksi jadi 'paid'
    // (Tambahkan kolom `status` di model transaksi: String @default("pending"))
    await prisma.transaksi.update({
      where: { id_transaksi: transaksi.id_transaksi },
      data: { status: "paid" },
    });

    return Response.json({ message: "Pembayaran berhasil (mock)" });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Gagal memproses webhook" }, { status: 500 });
  }
}
