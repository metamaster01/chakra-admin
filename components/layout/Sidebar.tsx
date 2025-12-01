"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid, CalendarCheck, Sparkles, Users, ShoppingBag, CreditCard,
  ImageIcon, Package, MessageSquare, Settings, LogOut,
  BookAIcon
} from "lucide-react";
import { supabaseBrowser } from "@/lib/supabase-browser";

const nav = [
  { label: "Dashboard", href: "/", icon: LayoutGrid },
  { label: "Bookings", href: "/bookings", icon: CalendarCheck },
  { label: "Services", href: "/services", icon: Sparkles },
  { label: "Customers", href: "/customers", icon: Users },
  { label: "Order", href: "/orders", icon: ShoppingBag },
  { label: "Payments", href: "/payments", icon: CreditCard },
  // { label: "Gallery", href: "/gallery", icon: ImageIcon },
  { label: "Products", href: "/products", icon: Package },
  { label: "Blogs", href: "/blogs", icon: BookAIcon },
  { label: "Contact", href: "/contact", icon: MessageSquare },
  { label: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();
  const supabase = supabaseBrowser();

  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/login";
  }

  return (
    <aside className="w-[260px] shrink-0 p-4 md:p-6">
      <div className="bg-white/70 backdrop-blur rounded-2xl shadow-lg border border-purple-100 h-[calc(100vh-2rem)] flex flex-col">
        {/* Logo block */}
        <div className="px-4 py-5 flex items-center gap-3">
          <div className="h-12 w-12 rounded-xl bg-[#4B2DB3] text-white grid place-items-center font-bold">
            CH
          </div>
          <div>
            <p className="text-xs text-gray-500">Chakra Healing</p>
            <h2 className="text-base font-semibold">Admin Panel</h2>
          </div>
        </div>

        <nav className="px-2 flex-1 overflow-y-auto">
          {nav.map((item) => {
            const active = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition
                  ${active
                    ? "bg-[#4B2DB3] text-white shadow"
                    : "text-gray-600 hover:bg-purple-50 hover:text-gray-900"}`}
              >
                <Icon size={18} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-purple-100">
          <button
            onClick={logout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-600 hover:bg-red-50 hover:text-red-700"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}
