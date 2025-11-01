import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import jwt from "jsonwebtoken";

/**
 * Helper function untuk mendapatkan user ID dari kedua sistem authentication
 * @param {Request} req - Request object
 * @returns {Object} - { userId: number | null, authType: 'nextauth' | 'jwt' | null }
 */
export async function getUserIdFromRequest(req) {
  try {
    // Coba NextAuth session terlebih dahulu
    const session = await getServerSession(authOptions);
    if (session?.user?.id_user) {
      return {
        userId: session.user.id_user,
        authType: 'nextauth'
      };
    }

    // Jika NextAuth tidak ada, coba JWT
    const token = req.cookies.get("access_token")?.value;
    if (token) {
      const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
      return {
        userId: decoded.id_user,
        authType: 'jwt'
      };
    }

    return { userId: null, authType: null };
  } catch (err) {
    console.error("Error getting user ID:", err);
    return { userId: null, authType: null };
  }
}

/**
 * Helper function untuk client-side authentication check
 * @returns {Object} - { isAuthenticated: boolean, authType: 'nextauth' | 'jwt' | null }
 */
export function checkClientAuth() {
  // Cek NextAuth session (akan diimplementasikan di client)
  // Cek JWT token dari cookies
  if (typeof window !== 'undefined') {
    const token = document.cookie
      .split('; ')
      .find(row => row.startsWith('access_token='))
      ?.split('=')[1];
    
    if (token) {
      return { isAuthenticated: true, authType: 'jwt' };
    }
  }
  
  return { isAuthenticated: false, authType: null };
}
