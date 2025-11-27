export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-screen bg-gradient-to-br from-[#F5F0FF] via-white to-[#ECE6FF] flex items-center justify-center p-4">
      {children}
    </main>
  );
}
