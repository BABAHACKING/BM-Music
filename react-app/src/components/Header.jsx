import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Header = () => {
    const navigate = useNavigate();

    return (
        <div className="flex justify-between items-center rounded bg-[#121212] p-4 m-2">
            <div className="flex gap-4">
                <div onClick={() => navigate(-1)} className="bg-black rounded-full p-2 cursor-pointer">
                    <ChevronLeft size={24} color="white" />
                </div>
                <div onClick={() => navigate(1)} className="bg-black rounded-full p-2 cursor-pointer">
                    <ChevronRight size={24} color="white" />
                </div>
            </div>
            <div className="flex gap-4">
                <button className="text-gray bg-transparent font-bold border-none hover:text-white transition-all transform hover:scale-105">
                    Sign up
                </button>
                <button className="bg-white text-black font-bold py-2 px-6 rounded-3xl hover:scale-105 transition-transform">
                    Log in
                </button>
            </div>
        </div>
    );
};

export default Header;
