'use client'

import Footer from "@/components/Footer";
import HeaderCart from "@/components/HeaderCart";
import Navbar from "@/components/Navbar";

const ProfilePage = () => {
    return <>
        <Navbar/>
        <div className="w-full h-1/3 md:h-screen relative">
            <HeaderCart/>
        </div>
        <div className="flex flex-col w-full justify-center items-center">
            <div className="h-screen flex justify-center items-center">
                <h1 className="">My Bag</h1>
            </div>
            <Footer/>
        </div>;
    </>
}
export default ProfilePage;