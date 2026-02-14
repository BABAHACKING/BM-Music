import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';
import MusicPlayer from './MusicPlayer';

const Layout = ({ children }) => {
    return (
        <div className="h-screen bg-black p-2 flex gap-2 overflow-hidden">
            <Sidebar />
            <div className="flex-1 bg-[#121212] rounded flex flex-col h-full overflow-hidden relative">
                <Header />
                <div className="flex-1 overflow-y-auto p-4 pb-24">
                    {children}
                </div>
            </div>
            <MusicPlayer />
        </div>
    );
};

export default Layout;
