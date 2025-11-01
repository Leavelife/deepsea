// /app/api/transaction/history/route.js
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET(req) {
  try {
    const token = cookies().get("access_token")?.value;
    if (!token) {
      return Response.json({ message: "Unauthorized" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const transaksi = await prisma.transaksi.findMany({
      where: { id_user: decoded.id_user },
      include: {
        jasa_pengirim: true,
      },
      orderBy: { tgl_transaksi: "desc" },
    });

    return Response.json({ transaksi });
  } catch (error) {
    return Response.json({ message: error.message }, { status: 500 });
  }
}
