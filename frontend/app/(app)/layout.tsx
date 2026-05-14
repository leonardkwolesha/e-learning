import Navbar from "@/components/shared/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: "#0a0a0f" }}>
      <Navbar />
      <main className="pt-16 min-h-screen">
        {children}
      </main>
    </div>
  );
}
