import { supabase } from "@/integrations/supabase/client";
import imageCompression from "browser-image-compression"; // asegúrate de tener instalada esta lib

export const uploadFile = async (file: File): Promise<string> => {
  // Nombre único
  const fileExt = file.name.split(".").pop();
  const baseName = `${Date.now()}-${Math.random().toString(36).substring(2)}`;
  const fileName = `${baseName}.${fileExt}`;
  const thumbName = `${baseName}_thumb.${fileExt}`;

  // 📌 Opciones de compresión
  const originalOptions = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1280,
    useWebWorker: true,
  };
  const thumbOptions = {
    maxSizeMB: 0.2,        // más chico
    maxWidthOrHeight: 300, // thumbnail
    useWebWorker: true,
  };

  // Generar versiones
  const originalFile = await imageCompression(file, originalOptions);
  const thumbFile = await imageCompression(file, thumbOptions);

  // Subir original
  const { error: originalError } = await supabase.storage
    .from("posts")
    .upload(fileName, originalFile, {
      cacheControl: "public, max-age=31536000, immutable",
      upsert: false,
    });

  if (originalError) {
    throw new Error(`Error uploading original: ${originalError.message}`);
  }

  // Subir thumbnail
  const { error: thumbError } = await supabase.storage
    .from("posts")
    .upload(thumbName, thumbFile, {
      cacheControl: "public, max-age=31536000, immutable",
      upsert: false,
    });

  if (thumbError) {
    console.warn("⚠️ No se pudo subir el thumbnail:", thumbError.message);
  }

  // Devolvemos la URL pública del original (el frontend usará thumb cuando corresponda)
  const { data: urlData } = supabase.storage.from("posts").getPublicUrl(fileName);
  return urlData.publicUrl;
};

export const uploadFiles = async (files: FileList): Promise<string[]> => {
  const uploadPromises = Array.from(files).map((file) => uploadFile(file));
  return Promise.all(uploadPromises);
};


