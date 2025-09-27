import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, X } from "lucide-react";
import { allColors, type ColorType } from "@/utils/breeds";

interface ColorSelectorProps {
  selectedColors: string[];
  onColorsChange: (colors: string[]) => void;
  maxColors?: number;
}

export function ColorSelector({ selectedColors, onColorsChange, maxColors = 4 }: ColorSelectorProps) {
  const [open, setOpen] = useState(false);

  const toggleColor = (color: string) => {
    if (selectedColors.includes(color)) {
      onColorsChange(selectedColors.filter(c => c !== color));
    } else if (selectedColors.length < maxColors) {
      onColorsChange([...selectedColors, color]);
    }
  };

  const removeColor = (color: string) => {
    onColorsChange(selectedColors.filter(c => c !== color));
  };

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="w-full justify-start">
            Seleccionar colores ({selectedColors.length}/{maxColors})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4">
          <div className="space-y-2">
            <h4 className="font-medium">Selecciona hasta {maxColors} colores</h4>
            <div className="grid grid-cols-3 gap-2">
              {allColors.map((color) => (
                <Button
                  key={color}
                  variant={selectedColors.includes(color) ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleColor(color)}
                  disabled={!selectedColors.includes(color) && selectedColors.length >= maxColors}
                  className="justify-start text-xs h-8"
                >
                  {selectedColors.includes(color) && <Check className="h-3 w-3 mr-1" />}
                  {color}
                </Button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
      
      {selectedColors.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedColors.map((color) => (
            <Badge key={color} variant="secondary" className="text-xs">
              {color}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer hover:text-destructive" 
                onClick={() => removeColor(color)}
              />
            </Badge>
          ))}
        </div>
      )}
    </div>
  );
}