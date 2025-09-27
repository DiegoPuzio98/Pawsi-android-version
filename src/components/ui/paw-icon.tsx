import { cn } from "@/lib/utils";

interface PawIconProps {
  className?: string;
  size?: number;
}

export const PawIcon = ({ className, size = 24 }: PawIconProps) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="hsl(25 45% 25%)"
      className={cn("", className)}
    >
      <path d="M12 2C10.9 2 10 2.9 10 4s.9 2 2 2 2-.9 2-2-.9-2-2-2zM8.5 7C7.4 7 6.5 7.9 6.5 9s.9 2 2 2 2-.9 2-2-.9-2-2-2zm7 0C14.4 7 13.5 7.9 13.5 9s.9 2 2 2 2-.9 2-2-.9-2-2-2zM6 15c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-9 2c-2.2 0-4 1.8-4 4v1h14v-1c0-2.2-1.8-4-4-4H9z"/>
    </svg>
  );
};