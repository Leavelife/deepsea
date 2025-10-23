'use client'
import Navbar from '@/components/Navbar';

export default function AboutPage() {
  return (
    <>
    <Navbar />
    <div className="w-full h-screen flex flex-col justify-center items-center bg-blue-400">
        <h1>About Page</h1>
        <p>Welcome to the About page!</p>
    </div>
    </>
  )
}