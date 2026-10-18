"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CheckCircle2, Inbox, LoaderCircle } from "lucide-react";
import { useDropzone } from "react-dropzone";
import { toast } from "sonner";

const FileUpload = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      if (!res.ok) {
        throw new Error("Failed to upload file");
      }
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["chats"] });
      toast.success("file berhasil di upload");
    },
    onError: () => {
      toast.error("file gagal di upload");
    },
  });

  const isUploading = mutation.isPending;

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
    disabled: isUploading,
    onDrop: (file) => {
      mutation.mutate(file[0]);
    },
  });

  return (
    <div
      {...getRootProps()}
      className={`bg-purple-800 flex flex-col cursor-pointer
        items-center justify-center rounded-lg py-4 px-8 h-full
        transition-all duration-200
        ${isUploading ? "opacity-80 cursor-wait" : "hover:bg-purple-900"}`}
    >
      <input {...getInputProps()} accept="application/pdf" />

      {isUploading ? (
        <>
          <LoaderCircle className="w-10 h-10 text-white animate-spin mb-3" />

          <p className="text-sm text-white text-center font-medium">
            Mengunggah file PDF...
          </p>

          <p className="text-xs text-purple-200 mt-2">Mohon tunggu sebentar</p>
        </>
      ) : mutation.isSuccess ? (
        <>
          <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />

          <p className="text-sm text-white text-center">
            File berhasil di-upload!
          </p>

          <p className="text-xs text-purple-200 mt-2">Upload PDF lainnya</p>
        </>
      ) : (
        <>
          <Inbox className="w-10 h-10 text-white dark:text-[#22262b]" />
          <p className="text-sm text-amber-500 dark:text-white">
            Drop PDF here
          </p>
        </>
      )}
    </div>
  );
};

export default FileUpload;
