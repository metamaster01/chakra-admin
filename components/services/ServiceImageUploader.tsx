"use client";

import { useState } from "react";

export default function ServiceImagesUploader({
  existing, onExistingChange, onFilesChange
}:{ existing:any[]; onExistingChange:(x:any[])=>void; onFilesChange:(f:File[])=>void }) {
  const [files, setFiles] = useState<File[]>([]);

  function addFiles(list: FileList | null) {
    if (!list) return;
    const arr = [...files, ...Array.from(list)];
    setFiles(arr);
    onFilesChange(arr);
  }

  function removeExisting(id:number){
    onExistingChange(existing.filter(x=>x.id!==id));
  }

  function removeNew(idx:number){
    const arr = files.filter((_,i)=>i!==idx);
    setFiles(arr);
    onFilesChange(arr);
  }

  return (
    <div className="bg-gray-50 border rounded-2xl p-4">
      <h4 className="font-semibold mb-2">Images</h4>

      {/* Existing images */}
      {existing.length>0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {existing.map((img:any)=>(
            <div key={img.id} className="relative">
              <img src={img.image_url} className="w-full h-20 object-cover rounded-lg"/>
              <button
                onClick={()=>removeExisting(img.id)}
                className="absolute top-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New files */}
      {files.length>0 && (
        <div className="grid grid-cols-3 gap-2 mb-3">
          {files.map((f,idx)=>(
            <div key={idx} className="relative">
              <img src={URL.createObjectURL(f)} className="w-full h-20 object-cover rounded-lg"/>
              <button
                onClick={()=>removeNew(idx)}
                className="absolute top-1 right-1 bg-white text-xs px-1.5 py-0.5 rounded"
              >
                x
              </button>
            </div>
          ))}
        </div>
      )}

      <input
        type="file"
        multiple
        accept="image/*"
        onChange={(e)=>addFiles(e.target.files)}
        className="text-sm"
      />
      <p className="text-xs text-gray-500 mt-1">Uploads to Supabase bucket `service-images`.</p>
    </div>
  );
}
