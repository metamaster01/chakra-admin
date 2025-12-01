"use client";

import { Upload, X } from "lucide-react";

const publicUrlFromPath = (path?: string | null) =>
  path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/blog-image/${path}`
    : "";

export default function BlogImagesEditor({
  images,
  onChange,
}: {
  images: {
    position: number;
    path: string | null;
    caption: string | null;
    file?: File | null;
  }[];
  onChange: (
    imgs: {
      position: number;
      path: string | null;
      caption: string | null;
      file?: File | null;
    }[]
  ) => void;
}) {
  function updateImage(
    pos: number,
    updates: Partial<{
      path: string | null;
      caption: string | null;
      file: File | null;
    }>
  ) {
    onChange(
      images.map((img) =>
        img.position === pos ? { ...img, ...updates } : img
      )
    );
  }

  function clearImage(pos: number) {
    onChange(
      images.map((img) =>
        img.position === pos
          ? { ...img, path: null, caption: null, file: null }
          : img
      )
    );
  }

  function handleFileSelect(pos: number, file: File | null) {
    if (!file) return;
    updateImage(pos, { file });
  }

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium text-gray-700">
        Inline Images (Positions 1-4)
      </label>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {images.map((img) => {
          const displayUrl = img.file
            ? URL.createObjectURL(img.file)
            : publicUrlFromPath(img.path);

          return (
            <div
              key={img.position}
              className="border rounded-xl p-3 bg-gray-50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  Position {img.position}
                </span>
                {(img.path || img.file) && (
                  <button
                    type="button"
                    onClick={() => clearImage(img.position)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Image preview or upload */}
              {displayUrl ? (
                <img
                  src={displayUrl}
                  alt={`Position ${img.position}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
              ) : (
                <label className="flex flex-col items-center justify-center h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#4B2DB3] transition">
                  <Upload size={24} className="text-gray-400 mb-1" />
                  <span className="text-xs text-gray-500">
                    Click to upload
                  </span>
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect(
                        img.position,
                        e.target.files?.[0] ?? null
                      )
                    }
                  />
                </label>
              )}

              {/* Caption input */}
              <input
                type="text"
                placeholder="Caption (optional)"
                className="w-full border rounded-lg px-2 py-1.5 text-xs"
                value={img.caption ?? ""}
                onChange={(e) =>
                  updateImage(img.position, { caption: e.target.value })
                }
              />
            </div>
          );
        })}
      </div>

      <p className="text-xs text-gray-500">
        These images can be placed between body sections in your blog post.
      </p>
    </div>
  );
}