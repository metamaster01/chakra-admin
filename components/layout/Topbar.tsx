"use client";

import { Bell, Settings } from "lucide-react";
import { useEffect, useState } from "react";
import { supabaseBrowser } from "@/lib/supabase-browser";

export default function Topbar() {
  const supabase = supabaseBrowser();
  const [name, setName] = useState("Admin");

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      setName(data.user?.user_metadata?.full_name || data.user?.email || "Admin");
    })();
  }, []);

  return (
    <header className="sticky top-0 z-10 px-6 md:px-8 py-4 backdrop-blur bg-white/60 border-b border-purple-100">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <p className="text-xs text-gray-500">Welcome back!</p>
          <h1 className="text-lg font-semibold text-gray-900">{name}</h1>
        </div>

        {/* <div className="flex-1 hidden md:block">
          <div className="bg-white rounded-full shadow-sm border border-gray-100 px-4 py-2 flex items-center">
            <input
              placeholder="Search for booking, customers and more..."
              className="w-full text-sm outline-none bg-transparent"
            />
          </div>
        </div> */}

        <button className="h-10 w-10 grid place-items-center rounded-full bg-white border border-gray-100 shadow-sm">
          <Bell size={18} />
        </button>
        <button className="h-10 w-10 grid place-items-center rounded-full bg-white border border-gray-100 shadow-sm">
          <a href="/settings">
          
          <Settings size={18} />
          </a>
        </button>
      </div>
    </header>
  );
}
