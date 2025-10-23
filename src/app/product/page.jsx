'use client'
import Navbar from '@/components/Navbar';

export default function ProductPage() {
  return (
    <>
    <Navbar />
    <div className="w-full h-screen flex flex-col justify-center items-center bg-blue-400">
        <h1>Product Page</h1>
        <p>Welcome to the product page!</p>
    </div>
    </>
  )
}