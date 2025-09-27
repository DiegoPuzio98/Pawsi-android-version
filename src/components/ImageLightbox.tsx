import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { SensitiveImage } from "@/components/SensitiveImage";

interface ImageLightboxProps {
  images: string[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  isSensitive?: boolean;
  title?: string;
}

export function ImageLightbox({ 
  images, 
  currentIndex, 
  isOpen, 
  onClose, 
  isSensitive = false,
  title = ""
}: ImageLightboxProps) {
  const [activeIndex, setActiveIndex] = useState(currentIndex);

  const goToPrevious = () => {
    setActiveIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1));
  };

  const goToNext = () => {
    setActiveIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0));
  };

  const currentImage = images[activeIndex];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0 bg-black/95 border-none">
        <div className="relative w-full h-full flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>

          {images.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              >
                <ChevronLeft className="h-8 w-8" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={goToNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
              >
                <ChevronRight className="h-8 w-8" />
              </Button>
            </>
          )}

          <div className="w-full h-full flex items-center justify-center p-4">
            <SensitiveImage
              src={currentImage.startsWith('http') 
                ? currentImage 
                : `https://jwvcgawjkltegcnyyryo.supabase.co/storage/v1/object/public/posts/${currentImage}`
              }
              alt={`${title} - Imagen ${activeIndex + 1}`}
              className="max-w-full max-h-full object-contain"
              isSensitive={isSensitive}
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          </div>

          {images.length > 1 && (
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 rounded-full px-3 py-1 text-white text-sm">
              {activeIndex + 1} de {images.length}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}