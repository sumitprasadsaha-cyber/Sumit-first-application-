import React, { useRef, useState } from "react";
import { Image, X, RotateCw, ZoomIn, Check, RefreshCw } from "lucide-react";

interface ProfilePictureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPhoto: (dataUrl: string) => void;
}

export default function ProfilePictureModal({
  isOpen,
  onClose,
  onSelectPhoto
}: ProfilePictureModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1.0);
  const [rotation, setRotation] = useState<number>(0);

  if (!isOpen) return null;

  // Handle local file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setImageSrc(reader.result);
          setZoom(1.0);
          setRotation(0);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const rotateImage = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSaveCroppedImage = () => {
    if (!imageSrc) return;
    const img = new window.Image();
    img.src = imageSrc;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const size = 300;
      canvas.width = size;
      canvas.height = size;

      ctx.clearRect(0, 0, size, size);
      
      // Center and translate
      ctx.translate(size / 2, size / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(zoom, zoom);

      const imgWidth = img.width;
      const imgHeight = img.height;
      const minDimension = Math.min(imgWidth, imgHeight);
      
      const sWidth = minDimension;
      const sHeight = minDimension;
      const sx = (imgWidth - sWidth) / 2;
      const sy = (imgHeight - sHeight) / 2;

      ctx.drawImage(
        img,
        sx, sy, sWidth, sHeight,
        -size / 2, -size / 2, size, size
      );

      const croppedDataUrl = canvas.toDataURL("image/jpeg", 0.85);
      onSelectPhoto(croppedDataUrl);
      setImageSrc(null);
      setZoom(1.0);
      setRotation(0);
      onClose();
    };
  };

  const handleCancelEdit = () => {
    setImageSrc(null);
    setZoom(1.0);
    setRotation(0);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 sm:items-center p-0 backdrop-blur-xs" id="profile-picture-modal">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-sm bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-2xl p-6 shadow-2xl animate-slideUp z-10 flex flex-col gap-4 border border-slate-100 dark:border-slate-800 m-0 sm:m-4">
        <div className="w-12 h-1 bg-slate-200 dark:bg-slate-700 rounded-full self-center sm:hidden mb-1" />

        <div className="flex justify-between items-center pb-1 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm font-extrabold text-slate-850 dark:text-slate-100">
            {imageSrc ? "Edit Photo (Crop & Zoom)" : "Update Student Photo"}
          </h2>
          <button
            onClick={onClose}
            className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-600 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
          id="profile-picture-file-input"
        />

        {!imageSrc ? (
          /* Select Image Step */
          <div className="flex flex-col gap-3 py-2">
            <button
              onClick={triggerFileSelect}
              className="w-full py-8 px-5 border-2 border-dashed border-blue-200 dark:border-blue-900/50 hover:border-blue-500 hover:bg-blue-50/20 dark:hover:bg-blue-950/10 rounded-2xl flex flex-col items-center justify-center gap-3 font-bold text-slate-700 dark:text-slate-300 transition-all duration-200 cursor-pointer group"
            >
              <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded-full group-hover:scale-110 transition-transform">
                <Image className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex flex-col items-center text-center">
                <span className="text-xs font-black text-slate-800 dark:text-slate-100">Select Image from Device</span>
                <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1">Supports PNG, JPG, JPEG</span>
              </div>
            </button>
          </div>
        ) : (
          /* Crop, Zoom, Rotate Editor Step */
          <div className="flex flex-col gap-4 py-2">
            {/* Live Cropper Viewport */}
            <div className="relative w-48 h-48 mx-auto rounded-full overflow-hidden border-2 border-blue-500/50 shadow-inner bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
              <div 
                className="w-full h-full transition-all duration-100 flex items-center justify-center"
                style={{
                  transform: `rotate(${rotation}deg) scale(${zoom})`,
                }}
              >
                <img 
                  src={imageSrc} 
                  alt="Preview" 
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              {/* Circular Guideline Overlay */}
              <div className="absolute inset-0 border-4 border-white/60 dark:border-slate-900/60 rounded-full pointer-events-none" />
            </div>

            {/* Removed Zoom Level and Rotation Offset Controls */}

            {/* Actions Footer */}
            <div className="flex gap-2 justify-end pt-3 border-t border-slate-100 dark:border-slate-800 mt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="px-3.5 py-2 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 rounded-xl transition-all cursor-pointer"
              >
                Reset Image
              </button>
              <button
                type="button"
                onClick={handleSaveCroppedImage}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-extrabold flex items-center gap-1.5 shadow-md shadow-blue-500/10 cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                <span>Crop & Save</span>
              </button>
            </div>
          </div>
        )}

        <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 text-center leading-relaxed mt-1">
          Adjust the picture to fit correctly in the circular profile framing.
        </p>
      </div>
    </div>
  );
}
