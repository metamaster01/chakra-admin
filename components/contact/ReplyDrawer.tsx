"use client";

export default function ReplyDrawer({ row, onClose }:{row:any; onClose:()=>void}) {
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl p-5">
        <h3 className="font-semibold text-lg mb-4">Reply (static for now)</h3>

        <label className="text-sm block mb-3">
          To
          <input className="mt-1 w-full border rounded-xl px-3 py-2"
                 value={row.email || ""} readOnly/>
        </label>

        <label className="text-sm block mb-3">
          Subject
          <input className="mt-1 w-full border rounded-xl px-3 py-2"
                 placeholder="Subject..." />
        </label>

        <label className="text-sm block mb-3">
          Body
          <textarea className="mt-1 w-full border rounded-xl px-3 py-2 h-40"
                    placeholder="Write your reply..." />
        </label>

        <div className="flex justify-end gap-2 mt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Cancel</button>
          <button disabled className="px-4 py-2 rounded-xl bg-[#4B2DB3] text-white opacity-60">
            Send (later)
          </button>
        </div>
      </aside>
    </div>
  );
}
