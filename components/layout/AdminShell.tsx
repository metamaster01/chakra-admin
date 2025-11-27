import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-white to-[#ECE6FF]">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 min-w-0">
          <Topbar />
          <div className="p-6 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
