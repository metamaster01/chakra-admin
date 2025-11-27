"use client";

export default function ContactViewDialog({ row, onClose }:{row:any; onClose:()=>void}) {
  return (
    <div className="fixed inset-0 bg-black/30 grid place-items-center z-50">
      <div className="bg-white w-[90%] max-w-xl rounded-2xl p-5 shadow-xl">
        <h3 className="font-semibold text-lg mb-4">Contact Message</h3>

        <div className="grid gap-3 text-sm">
          <Field label="Name" value={row.name}/>
          <Field label="Email" value={row.email}/>
          <Field label="Phone" value={row.phone}/>
          <Field label="Received" value={new Date(row.created_at).toLocaleString()}/>
          <div>
            <p className="text-gray-700 font-medium">Message</p>
            <p className="mt-1 p-3 rounded-xl bg-gray-50 border whitespace-pre-wrap">
              {row.message}
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button onClick={onClose} className="px-4 py-2 rounded-xl border">Close</button>
        </div>
      </div>
    </div>
  );
}

function Field({label,value}:{label:string;value:any}) {
  return (
    <div>
      <p className="text-gray-700 font-medium">{label}</p>
      <p className="mt-1 p-2 rounded-xl bg-gray-50 border">{value || "—"}</p>
    </div>
  );
}
