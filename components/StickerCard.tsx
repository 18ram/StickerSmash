import React from 'react';
import { Sticker } from '../types';
import { downloadImage } from '../utils';

interface StickerCardProps {
  sticker: Sticker;
}

export const StickerCard: React.FC<StickerCardProps> = ({ sticker }) => {
  const handleDownload = () => {
    downloadImage(sticker.imageUrl, `sticker-${sticker.style.toLowerCase().replace(/\s/g, '-')}-${Date.now()}.png`);
  };

  return (
    <div className="group relative bg-white rounded-2xl p-4 shadow-md hover:shadow-xl transition-all duration-300 border-2 border-slate-100 hover:border-primary/20">
      <div className="aspect-square w-full overflow-hidden rounded-xl bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-slate-50 flex items-center justify-center relative">
        <img 
          src={sticker.imageUrl} 
          alt={`Generated ${sticker.style} sticker`} 
          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-110 drop-shadow-xl"
        />
        
        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center rounded-xl backdrop-blur-[2px]">
           <button 
            onClick={handleDownload}
            className="bg-white text-slate-900 px-4 py-2 rounded-full font-bold transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:bg-primary hover:text-white"
           >
             Download
           </button>
        </div>
      </div>
      
      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-slate-100 px-2 py-1 rounded-md">
          {sticker.style}
        </span>
        <span className="text-xs text-slate-400">
           ✨ AI Generated
        </span>
      </div>
    </div>
  );
};