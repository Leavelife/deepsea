// /app/api/transaction/update/route.js
import { prisma } from "@/lib/prisma";

export async function PUT(req) {
  try {
    const { id_transaksi, status } = await req.json();

    const validStatus = ["proses", "dikirim", "sampai", "dibatalkan"];
    if (!validStatus.includes(status)) {
      return Response.json({ message: "Status tidak valid" }, { status: 400 });
    }

    const update = await prisma.transaksi.update({
      where: { id_transaksi },
      data: { status_transaksi: status },
    });

    return Response.json({ message: "Status diperbarui", update });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
