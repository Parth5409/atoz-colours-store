import { getBaseURL } from "@lib/util/env"
import { Metadata } from "next"
import "styles/globals.css"
import { Poppins } from "next/font/google"

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
})

export const metadata: Metadata = {
  metadataBase: new URL(getBaseURL()),
}

export default function RootLayout(props: { children: React.ReactNode }) {
  return (
    <html lang="en" data-mode="light" className={`${poppins.variable} font-sans`}>
      <body className="bg-slate-900 text-grey-5 selection:bg-rainbow-blue/30 min-h-screen border-t-4 border-transparent" style={{ borderImage: "linear-gradient(to right, #ff003c, #ff5e00, #ffcc00, #00ff66, #00d4ff, #6a00ff, #b000ff) 1" }}>
        <main className="relative">{props.children}</main>
      </body>
    </html>
  )
}
