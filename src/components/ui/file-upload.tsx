import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";

interface FileUploadProps {
  onFilesSelected: (files: FileList) => void;
  onFileRemove?: (index: number) => void;
  selectedFiles?: File[];
  multiple?: boolean;
  accept?: string;
  disabled?: boolean;
}

export const FileUpload = ({ 
  onFilesSelected, 
  onFileRemove, 
  selectedFiles = [], 
  multiple = true,
  accept = "image/*",
  disabled = false
}: FileUploadProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      onFilesSelected(files);
    }
  };

  return (
    <div className="space-y-2">
        <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileChange}
        multiple={multiple}
        accept={accept}
        capture={false}
        className="hidden"
        disabled={disabled}
      />
      
      <Button
        type="button"
        variant="outline"
        onClick={handleFileSelect}
        disabled={disabled}
        className="w-full"
      >
        <Upload className="h-4 w-4 mr-2" />
        {selectedFiles.length > 0 
          ? `${selectedFiles.length} archivo(s) seleccionado(s)` 
          : "Seleccionar fotos"
        }
      </Button>

      {selectedFiles.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {selectedFiles.map((file, index) => (
            <div key={index} className="relative bg-muted p-2 rounded text-sm">
              <span className="truncate block pr-6">{file.name}</span>
              {onFileRemove && (
                <button
                  type="button"
                  onClick={() => onFileRemove(index)}
                  className="absolute top-1 right-1 text-muted-foreground hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};