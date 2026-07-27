import React from "react"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "AtoZ Colours — Admin Dashboard",
  description: "Administrative console for AtoZ Colours automotive paint store.",
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen bg-white text-black font-sans antialiased flex flex-col">
      {/* Admin Header */}
      <header className="border-b border-black py-4 px-6 md:px-12 flex justify-between items-center bg-white z-10">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs uppercase tracking-widest bg-black text-white px-2 py-0.5">Admin</span>
          <span className="font-bold tracking-tight text-lg uppercase">AtoZ Colours</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col bg-neutral-50">
        {children}
      </main>
    </div>
  )
}
