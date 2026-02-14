import React from 'react';
import { Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const PlaylistCard = ({ title, description, image, id }) => {
    const navigate = useNavigate();

    return (
        <div
            onClick={() => navigate(`/playlist/${id}`)}
            className="group bg-[#181818] p-4 rounded-lg hover:bg-[#282828] transition-all cursor-pointer relative w-[180px]"
        >
            <div className="relative mb-4">
                <img
                    src={image}
                    alt={title}
                    className="w-full aspect-square object-cover rounded-md shadow-lg"
                />
                <div className="absolute bottom-2 right-2 bg-[#1db954] rounded-full p-3 shadow-xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                    <Play size={20} fill="black" className="text-black ml-0.5" />
                </div>
            </div>

            <h3 className="text-white font-bold mb-1 truncate">{title}</h3>
            <p className="text-[#a7a7a7] text-sm line-clamp-2">{description}</p>
        </div>
    );
};

export default PlaylistCard;
