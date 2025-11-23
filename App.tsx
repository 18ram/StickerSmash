import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Image as ImageIcon, Zap, AlertCircle } from 'lucide-react';
import { Sticker, GenerationStatus, StickerStyle } from './types';
import { fileToGenerativePart } from './utils';
import { generateSticker, getRandomStyles } from './services/geminiService';
import { Button } from './components/Button';
import { StickerCard } from './components/StickerCard';

const App: React.FC = () => {
  const [status, setStatus] = useState<GenerationStatus>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [stickers, setStickers] = useState<Sticker[]>([]);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setErrorMsg("File is too large. Please upload an image under 5MB.");
        return;
      }
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setErrorMsg(null);
      setStickers([]); // Reset stickers on new upload
      setStatus('idle');
    }
  };

  const handleGenerate = async () => {
    if (!selectedFile) return;

    setStatus('generating');
    setErrorMsg(null);

    try {
      const imagePart = await fileToGenerativePart(selectedFile);
      // Generate 3 unique styles
      const stylesToGenerate = getRandomStyles(3);
      
      // Generate concurrently
      const promises = stylesToGenerate.map(async (style): Promise<Sticker | null> => {
        const imageUrl = await generateSticker(imagePart, style);
        if (imageUrl) {
          return {
            id: crypto.randomUUID(),
            imageUrl,
            style,
            prompt: `Funny ${style} sticker`,
            createdAt: Date.now()
          };
        }
        return null;
      });

      const results = await Promise.all(promises);
      
      const successfulStickers = results.filter((s): s is Sticker => s !== null);
      
      if (successfulStickers.length === 0) {
        throw new Error("Failed to generate any stickers. Please try a different image.");
      }

      setStickers(successfulStickers);
      setStatus('success');
    } catch (err) {
      console.error(err);
      setErrorMsg("Something went wrong while creating your stickers. The AI might be taking a nap.");
      setStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-96 bg-gradient-to-b from-purple-100 to-transparent -z-10" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-primary/10 rounded-full blur-3xl -z-10" />
      <div className="absolute top-40 -left-20 w-72 h-72 bg-secondary/20 rounded-full blur-3xl -z-10" />

      {/* Header */}
      <header className="container mx-auto px-4 py-8 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 bg-gradient-to-tr from-primary to-purple-600 rounded-xl flex items-center justify-center text-white shadow-lg transform rotate-3">
             <Zap size={24} fill="currentColor" />
          </div>
          <span className="text-2xl font-black tracking-tight text-slate-900">StickerSmash</span>
        </div>
        <div className="text-sm font-medium text-slate-500 hidden sm:block">
          Powered by Gemini 2.5
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-5xl">
        
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            Turn your photos into <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-purple-600">Hilarious Stickers</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-8">
            Upload any face, pet, or object and let our AI generate a pack of unique, funny, and die-cut ready stickers in seconds.
          </p>
        </div>

        {/* Upload & Preview Area */}
        <div className="bg-white rounded-3xl p-6 md:p-10 shadow-xl border border-slate-100 mb-16 relative overflow-hidden">
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            
            {/* Left Column: Upload */}
            <div className="space-y-6">
              <div 
                className={`border-4 border-dashed rounded-2xl h-80 flex flex-col items-center justify-center transition-all duration-300 cursor-pointer group
                  ${selectedFile ? 'border-primary/30 bg-primary/5' : 'border-slate-200 hover:border-primary/50 hover:bg-slate-50'}
                `}
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <div className="relative w-full h-full p-4">
                     <img src={previewUrl} alt="Preview" className="w-full h-full object-contain rounded-lg" />
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                        <span className="text-white font-bold flex items-center gap-2"><Upload size={20}/> Change Image</span>
                     </div>
                  </div>
                ) : (
                  <div className="text-center p-8">
                    <div className="w-20 h-20 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                      <ImageIcon size={40} />
                    </div>
                    <p className="text-lg font-bold text-slate-700 mb-1">Click to upload</p>
                    <p className="text-sm text-slate-400">JPG, PNG up to 5MB</p>
                  </div>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileSelect} 
                  accept="image/png, image/jpeg, image/webp" 
                  className="hidden" 
                />
              </div>

              <div className="flex justify-center">
                 <Button 
                    onClick={handleGenerate} 
                    disabled={!selectedFile || status === 'generating'}
                    className="w-full md:w-auto min-w-[200px] text-lg py-4"
                    icon={status === 'generating' ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Sparkles />}
                 >
                   {status === 'generating' ? 'Creating Magic...' : 'Generate Stickers'}
                 </Button>
              </div>
              
              {errorMsg && (
                <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center gap-3 text-sm font-medium">
                  <AlertCircle size={20} />
                  {errorMsg}
                </div>
              )}
            </div>

            {/* Right Column: Information / Decoration */}
            <div className="hidden md:block relative h-full min-h-[300px]">
               <div className="absolute inset-0 bg-slate-50 rounded-2xl p-8 flex flex-col justify-center border border-slate-100">
                  <h3 className="text-xl font-bold text-slate-800 mb-4">How it works</h3>
                  <ul className="space-y-4">
                    {[
                      { title: "Upload", desc: "Choose a clear photo of a face, pet, or object." },
                      { title: "AI Magic", desc: "Gemini 2.5 analyzes features and creates funny variations." },
                      { title: "Download", desc: "Get high-res stickers ready for your chats." }
                    ].map((step, idx) => (
                      <li key={idx} className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-bold flex-shrink-0 flex items-center justify-center text-sm">
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-bold text-slate-700">{step.title}</p>
                          <p className="text-sm text-slate-500">{step.desc}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Decorative Elements */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 bg-secondary text-slate-900 rounded-full flex items-center justify-center font-black transform rotate-12 shadow-lg z-10">
                    <div className="text-center text-xs leading-tight">
                      100%<br/><span className="text-lg">FREE</span>
                    </div>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {stickers.length > 0 && (
          <div className="space-y-8 animate-fade-in-up">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="text-3xl font-bold text-slate-900">Your Sticker Pack</h2>
              <div className="h-px bg-slate-200 flex-grow"></div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {stickers.map((sticker) => (
                <StickerCard key={sticker.id} sticker={sticker} />
              ))}
            </div>

            <div className="text-center mt-12">
               <p className="text-slate-500 mb-4">Want more styles?</p>
               <Button variant="secondary" onClick={handleGenerate}>
                 Generate More
               </Button>
            </div>
          </div>
        )}

        {/* Loading State Placeholder */}
        {status === 'generating' && stickers.length === 0 && (
           <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="aspect-square rounded-2xl bg-white border border-slate-100 p-4 shadow-sm animate-pulse">
                   <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-300">
                     <Sparkles size={40} className="animate-spin-slow opacity-50" />
                   </div>
                   <div className="h-4 bg-slate-100 rounded mt-4 w-1/2 mx-auto"></div>
                </div>
              ))}
           </div>
        )}

      </main>

      <footer className="bg-white border-t border-slate-100 py-12 mt-20">
         <div className="container mx-auto px-4 text-center text-slate-400">
            <p className="mb-2">Made with ❤️ using Gemini API</p>
            <p className="text-sm opacity-60">
              Disclaimer: AI-generated images may vary. No personal data is stored.
            </p>
         </div>
      </footer>
      
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.5s ease-out forwards;
        }
        .animate-spin-slow {
          animation: spin 3s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default App;