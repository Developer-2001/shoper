"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { X, Sparkles, Loader2, Check } from "lucide-react";

interface AIEnhanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  originalImage: string; // Base64 or URL
  onSelectImage: (imageUrl: string) => void;
}

const MODELS = [
  { id: "gemini-2.5-flash-image", name: "Pro Image (2.5 Flash)", premium: false },
  { id: "gemini-3.1-flash-image-preview", name: "Premium Image (3.1 Flash)", premium: true },
];

const ASPECT_RATIOS = ["1:1", "16:9", "9:16", "4:3", "3:4"];
const RESOLUTIONS = ["1K", "2K", "4K"];

export function AIEnhanceModal({ isOpen, onClose, originalImage, onSelectImage }: AIEnhanceModalProps) {
  const [selectedModel, setSelectedModel] = useState(MODELS[0].id);
  const [aspectRatio, setAspectRatio] = useState("1:1");
  const [resolution, setResolution] = useState("1K");
  const [prompt, setPrompt] = useState("");
  const [isEnhancing, setIsEnhancing] = useState(false);
   const [generatedImage, setGeneratedImage] = useState<string | null>(null);
   const [error, setError] = useState<string | null>(null);
   const [fullScreenImage, setFullScreenImage] = useState<string | null>(null);


  const isPremiumModel = MODELS.find((m) => m.id === selectedModel)?.premium;

  useEffect(() => {
    if (!isPremiumModel) {
      setAspectRatio("1:1");
      setResolution("1K");
    }
  }, [selectedModel, isPremiumModel]);

  const convertToBase64 = async (url: string): Promise<string> => {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  const handleEnhance = async () => {

    if (!prompt.trim()) {
      setError("Please enter a prompt.");
      return;
    }

    setIsEnhancing(true);
    setError(null);

    try {
      const base64Image = await convertToBase64(originalImage);
      
      const response = await fetch("/api/gemini-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt,
          imageData: base64Image,
          model: selectedModel,
          aspectRatio: isPremiumModel ? aspectRatio : "1:1",
          resolution: isPremiumModel ? resolution : "1K",
        }),
      });


      const data = await response.json();

      if (data.success && data.imageUrl) {
        setGeneratedImage(data.imageUrl);
      } else {
        setError(data.error || data.details || "Failed to generate image.");
      }
    } catch (err) {
      setError("An error occurred while enhancing the image.");
      console.error(err);
    } finally {
      setIsEnhancing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-4xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 p-6">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <Sparkles size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">AI Image Enhancer</h2>
              <p className="text-sm text-slate-500">Refine your product images with Gemini AI</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600 transition"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid gap-8 lg:grid-cols-2">
            {/* Left Column: Settings */}
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Model Selection</label>
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {MODELS.map((model) => (
                    <button
                      key={model.id}
                      onClick={() => setSelectedModel(model.id)}
                      className={`flex flex-col rounded-2xl border p-4 text-left transition ${selectedModel === model.id
                          ? "border-indigo-600 bg-indigo-50/50 ring-1 ring-indigo-600"
                          : "border-slate-200 hover:border-slate-300"
                        }`}
                    >
                      <span className={`text-sm font-bold ${selectedModel === model.id ? "text-indigo-700" : "text-slate-800"}`}>
                        {model.name}
                      </span>
                      <span className="mt-1 text-xs text-slate-500">
                        {model.premium ? "Higher quality, custom ratios" : "1K resolution, 1:1 ratio"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Aspect Ratio</label>
                  <select
                    disabled={!isPremiumModel}
                    value={aspectRatio}
                    onChange={(e) => setAspectRatio(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  >
                    {ASPECT_RATIOS.map((ratio) => (
                      <option key={ratio} value={ratio}>
                        {ratio}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-700">Resolution</label>
                  <select
                    disabled={!isPremiumModel}
                    value={resolution}
                    onChange={(e) => setResolution(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm focus:border-indigo-500 focus:outline-none disabled:opacity-50"
                  >
                    {RESOLUTIONS.map((res) => (
                      <option key={res} value={res}>
                        {res}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700">Enhancement Prompt</label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="e.g. Enhance clarity, fix lighting, sharpen details..."
                  className="min-h-[120px] w-full rounded-2xl border border-slate-200 bg-white p-4 text-sm shadow-sm focus:border-indigo-500 focus:outline-none"
                />
              </div>

              {error && (
                <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <button
                onClick={handleEnhance}
                disabled={isEnhancing}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 px-6 py-3.5 font-bold text-white transition hover:bg-slate-800 disabled:opacity-70"
              >
                {isEnhancing ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Processing...
                  </>
                ) : (
                  <>
                    <Sparkles size={18} />
                    Enhance Image
                  </>
                )}
              </button>
            </div>

            {/* Right Column: Preview */}
            <div className="flex flex-col gap-4">
              <div className="flex h-full flex-col gap-4 rounded-3xl bg-slate-50 p-4">
                <div className="grid h-full grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-1 overflow-y-auto">
                  {/* Original Image */}
                  <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between bg-slate-50/50 px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Original</span>
                      <button
                        onClick={() => onSelectImage(originalImage)}
                        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition"
                      >
                        <Check size={12} /> Use This
                      </button>
                    </div>
                    <div 
                      className="relative aspect-square w-full overflow-hidden p-2 cursor-zoom-in"
                      onClick={() => setFullScreenImage(originalImage)}
                    >
                      <Image
                        src={originalImage}
                        alt="Original image"
                        fill
                        className="rounded-xl object-contain transition hover:scale-[1.02]"
                      />
                    </div>

                  </div>

                  {/* Generated Image */}
                  <div className="flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm h-full">
                    <div className="flex items-center justify-between bg-slate-50/50 px-4 py-2 border-b border-slate-100">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">AI Enhanced</span>
                      {generatedImage && (
                        <button
                          onClick={() => onSelectImage(generatedImage)}
                          className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-2.5 py-1 text-xs font-bold text-white hover:bg-indigo-700 transition"
                        >
                          <Check size={12} /> Use This
                        </button>
                      )}
                    </div>
                    <div className="relative flex flex-1 items-center justify-center bg-slate-100/30 p-2 min-h-[200px]">
                      {generatedImage ? (
                        <div 
                          className="relative h-full w-full cursor-zoom-in"
                          onClick={() => setFullScreenImage(generatedImage)}
                        >
                          <Image
                            src={generatedImage}
                            alt="Generated image"
                            fill
                            className="rounded-xl object-contain transition hover:scale-[1.02]"
                          />
                        </div>
                      ) : isEnhancing ? (
                        <div className="flex flex-col items-center gap-3 text-slate-400">
                          <Loader2 className="animate-spin" size={32} />
                          <span className="text-sm font-medium">AI is working...</span>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3 text-slate-300">
                          <Sparkles size={48} className="opacity-20" />
                          <span className="text-sm font-medium">Your enhanced image will appear here</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {fullScreenImage && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/90 p-4 transition-all animate-in fade-in duration-200"
          onClick={() => setFullScreenImage(null)}
        >
          <button className="absolute top-6 right-6 text-white/70 hover:text-white bg-white/10 p-2 rounded-full backdrop-blur-md transition">
            <X size={24} />
          </button>
          <div className="relative h-full w-full max-w-5xl">
            <Image
              src={fullScreenImage!}
              alt="Full screen preview"
              fill
              className="object-contain"
              unoptimized={fullScreenImage!.startsWith('data:')}
            />
          </div>
        </div>
      )}
    </div>
  );
}

