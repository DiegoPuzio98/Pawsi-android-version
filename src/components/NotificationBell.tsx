import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
interface Notification {
  id: string;
  type: string;
  message: string;
  meta: any;
  read: boolean;
  created_at: string;
}

export function NotificationBell() {
  return null;
}