import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";

interface SensitiveImageProps {
  src: string;
  alt: string;
  className?: string;
  isSensitive?: boolean;
  disableReveal?: boolean;
  onError?: (e: any) => void;
  /** Si está en modo preview (listados/cards) usamos thumbnail si existe */
  useThumbnail?: boolean;
}

export function SensitiveImage({
  src,
  alt,
  className,
  isSensitive = false,
  disableReveal = false,
  onError,
  useThumbnail = false,
}: SensitiveImageProps) {
  const [revealed, setRevealed] = useState(false);
  const [finalSrc, setFinalSrc] = useState(src);

  // Intentar usar thumbnail si está habilitado
  useEffect(() => {
    if (!useThumbnail) {
      setFinalSrc(src);
      return;
    }

    try {
      const url = new URL(src);
      const parts = url.pathname.split("/");
      const filename = parts.pop()!;
      const [name, ext] = filename.split(".");
      const thumbName = `${name}_thumb.${ext}`;
      const thumbUrl = `${url.origin}${parts.join("/")}/${thumbName}`;

      // Probamos si el thumbnail carga, si no, fallback al original
      const img = new Image();
      img.src = thumbUrl;
      img.onload = () => setFinalSrc(thumbUrl);
      img.onerror = () => setFinalSrc(src);
    } catch {
      setFinalSrc(src);
    }
  }, [src, useThumbnail]);

  // Check de sensibilidad
  const shouldBlur =
    isSensitive ||
    alt.toLowerCase().includes("enfermo") ||
    alt.toLowerCase().includes("herido") ||
    alt.toLowerCase().includes("injured") ||
    alt.toLowerCase().includes("sick");

  if (!shouldBlur) {
    return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
  }

  if (!revealed) {
    return (
      <div
        className={`${className} bg-muted flex items-center justify-center relative cursor-pointer`}
        onClick={() => setRevealed(true)}
        role="button"
        aria-label="Revelar contenido sensible"
      >
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20 flex flex-col items-center justify-center p-4 text-center">
          <AlertTriangle className="h-8 w-8 text-orange-500 mb-2" />
          <p className="text-sm font-medium mb-2 text-foreground">
            Contenido potencialmente sensible
          </p>
          {!disableReveal && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                setRevealed(true);
              }}
              className="bg-background/80"
            >
              ¿Ver de todas formas?
            </Button>
          )}
        </div>
        <img src={finalSrc} alt={alt} className={`${className} blur-md`} onError={onError} />
      </div>
    );
  }

  return <img src={finalSrc} alt={alt} className={className} onError={onError} />;
}

