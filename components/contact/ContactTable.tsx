"use client";

import { useState } from "react";
import ContactViewDialog from "./ContactViewDialog";
import ReplyDrawer from "./ReplyDrawer";
import { Eye, Reply, Trash2 } from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function ContactTable({ initialData }:{ initialData:any[] }) {
  const supabase = supabaseBrowser();
  const [rows, setRows] = useState(initialData);
  const [view, setView] = useState<any|null>(null);
  const [replyTo, setReplyTo] = useState<any|null>(null);

  async function del(id:number){
    const { error } = await supabase.from("contact").delete().eq("id", id);
    if(!error) setRows(p=>p.filter(r=>r.id!==id));
  }

  return (
    <div className="bg-white/70 backdrop-blur rounded-2xl shadow border border-purple-100 p-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-gray-500">
            <tr>
              <th className="text-left py-2">Name</th>
              <th className="text-left py-2">Email</th>
              <th className="text-left py-2">Date received</th>
              <th className="text-left py-2">Message preview</th>
              <th className="text-left py-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(m=>(
              <tr key={m.id} className="border-t">
                <td className="py-3">{m.name || "—"}</td>
                <td className="py-3">{m.email || "—"}</td>
                <td className="py-3">{new Date(m.created_at).toLocaleString()}</td>
                <td className="py-3 truncate max-w-[360px]">{m.message}</td>
                <td className="py-3 flex gap-2">
                  <button onClick={()=>setView(m)} className="px-3 py-1.5 rounded-lg border text-xs flex gap-1">
                    <Eye size={14}/> View
                  </button>
                  <button
                    onClick={()=>setReplyTo(m)}
                    className="px-3 py-1.5 rounded-lg border text-xs flex gap-1"
                  >
                    <Reply size={14}/> Reply
                  </button>
                  <button
                    onClick={()=>del(m.id)}
                    className="p-2 rounded-lg hover:bg-red-50 text-red-600"
                  >
                    <Trash2 size={16}/>
                  </button>
                </td>
              </tr>
            ))}
            {rows.length===0 && (
              <tr><td colSpan={5} className="py-6 text-center text-gray-500">No messages.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {view && <ContactViewDialog row={view} onClose={()=>setView(null)} />}
      {replyTo && <ReplyDrawer row={replyTo} onClose={()=>setReplyTo(null)} />} {/* static */}
    </div>
  );
}
