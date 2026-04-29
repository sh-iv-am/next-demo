import { useEffect, useState } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import DemoPopup from "@/components/DemoPopup";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    setStatus(new URLSearchParams(window.location.search).get("status"));
  }, []);

  return (
    <div
      className={`${geistSans.className} ${geistMono.className} flex flex-col gap-8 min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black`}
    >
      {status && <span
        className="flex h-12 w-full items-center justify-center gap-2 px-5 transition-colors md:w-[300px]"
      >
        Status: {status.toUpperCase()}
      </span>}
      <button
        onClick={() => setOpen(true)}
        className="flex h-12 items-center justify-center rounded-full bg-foreground px-8 text-base font-medium text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc]"
      >
        Start Demo
      </button>

      {open && <DemoPopup onClose={() => setOpen(false)} />}
    </div>
  );
}
