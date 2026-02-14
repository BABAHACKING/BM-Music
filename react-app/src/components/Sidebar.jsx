import React from 'react';
import { Home, Search, Library } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

const Sidebar = () => {
    const navigate = useNavigate();

    return (
        <div className="w-[25vw] h-full flex flex-col gap-2 p-2">
            <div className="bg-[#121212] rounded p-4 flex flex-col gap-4">
                <div className="cursor-pointer" onClick={() => navigate('/')}>
                    <img className="invert w-24 ml-2" src="/assets/logo.svg" alt="Logo" />
                </div>
                <div className="flex flex-col gap-4 pl-2">
                    <Link to="/" className="flex items-center gap-4 text-white text-sm font-bold no-underline hover:text-white">
                        <Home size={24} />
                        Home
                    </Link>
                    <Link to="/youtube" className="flex items-center gap-4 text-gray text-sm font-bold no-underline hover:text-white transition-colors">
                        <Search size={24} />
                        Search
                    </Link>
                </div>
            </div>

            <div className="bg-[#121212] rounded flex-1 p-2">
                <div className="flex items-center gap-4 p-4 text-gray font-bold hover:text-white transition-colors cursor-pointer">
                    <Library size={24} />
                    Your Library
                </div>

                {/* Scrollable song list area could go here */}
                <div className="p-2 space-y-4 mt-4">
                    <div className="bg-[#242424] p-4 rounded-lg">
                        <p className="font-bold mb-2">Create your first playlist</p>
                        <p className="text-sm mb-4">It's easy, we'll help you</p>
                        <button className="bg-white text-black font-bold py-1 px-4 rounded-2xl text-sm hover:scale-105 transition-transform">
                            Create playlist
                        </button>
                    </div>
                </div>

                <div className="mt-auto p-4 flex flex-wrap gap-4 text-[10px] text-gray absolute bottom-24 w-[20vw]">
                    <a href="#" className="hover:underline">Legal</a>
                    <a href="#" className="hover:underline">Privacy Center</a>
                    <a href="#" className="hover:underline">Privacy Policy</a>
                    <a href="#" className="hover:underline">Cookies</a>
                    <a href="#" className="hover:underline">About Ads</a>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
