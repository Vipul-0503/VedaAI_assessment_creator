import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "VedaAI - Assessment Creator",
  description: "Generate high-quality AI school assessments seamlessly.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <div className="flex min-h-screen">
          {/* Universal Left Hand Persistent Sidebar Layout */}
          <Sidebar />
          
          {/* Main Body Content Frame Workspace */}
          <main className="flex-1 overflow-y-auto px-8 py-6">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}