// /app/api/payment/create/route.js
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

export async function POST(req) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) return Response.json({ error: "Unauthorized" }, { status: 401 });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id_user;

    const { id_pengiriman, total_harga } = await req.json();

    // Simulasi buat transaksi baru
    const transaksi = await prisma.transaksi.create({
      data: {
        id_user: userId,
        id_pengiriman,
        tgl_transaksi: new Date(),
      },
    });

    // Simulasi payment_id dan redirect
    const paymentId = `MOCKPAY-${Date.now()}`;
    const paymentUrl = `/payment/mock?id=${paymentId}`;

    // Simpan “status sementara” ke DB (kalau mau, bisa buat kolom status)
    await prisma.transaksi.update({
      where: { id_transaksi: transaksi.id_transaksi },
      data: { metode_transaksi: { connect: { id_metode_transaksi: 3 } } }, // misalnya metode dummy id=3
    });

    return Response.json({
      message: "Transaksi berhasil dibuat (simulasi)",
      paymentId,
      redirectUrl: paymentUrl,
      status: "pending",
    });
  } catch (err) {
    console.error(err);
    return Response.json({ error: "Gagal membuat transaksi" }, { status: 500 });
  }
}
