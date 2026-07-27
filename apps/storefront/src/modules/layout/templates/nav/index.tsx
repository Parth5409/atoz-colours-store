import { Suspense } from "react"
import Image from "next/image"

import { listLocales } from "@lib/data/locales"
import { getLocale } from "@lib/data/locale-actions"
import { listRegions } from "@lib/data/regions"
import { StoreRegion } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import CartButton from "@modules/layout/components/cart-button"
import SideMenu from "@modules/layout/components/side-menu"

export default async function Nav() {
  const [regions, locales, currentLocale] = await Promise.all([
    listRegions().then((regions: StoreRegion[]) => regions),
    listLocales(),
    getLocale(),
  ])

  return (
    <div className="sticky top-0 inset-x-0 z-50 group">
      {/* Blue Strip Navbar */}
      <header className="relative w-full bg-[#0a192f] text-white shadow-md">
        <nav className="content-container flex flex-col w-full">
          {/* Top Row: Icons & Logo */}
          <div className="flex items-center justify-between h-20 w-full">
            <div className="flex-1 basis-0 h-full flex items-center">
              <div className="h-full">
                <SideMenu regions={regions} locales={locales} currentLocale={currentLocale} />
              </div>
            </div>

            <div className="flex items-center justify-center h-full">
              <LocalizedClientLink
                href="/"
                className="flex items-center justify-center bg-white rounded-lg p-1 overflow-hidden h-16 w-32 shadow-sm"
                data-testid="nav-store-link"
              >
                <Image src="/logo_blackwhite.jpg" alt="AtoZ Colours" width={110} height={50} className="object-contain h-full w-full" />
              </LocalizedClientLink>
            </div>

            <div className="flex items-center gap-x-6 h-full flex-1 basis-0 justify-end">
              <div className="hidden small:flex items-center gap-x-6 h-full">
                <LocalizedClientLink
                  className="hover:text-blue-300 transition-colors"
                  href="/account"
                  data-testid="nav-account-link"
                >
                  Account
                </LocalizedClientLink>
              </div>
              <Suspense
                fallback={
                  <LocalizedClientLink
                    className="hover:text-blue-300 flex gap-2 transition-colors"
                    href="/cart"
                    data-testid="nav-cart-link"
                  >
                    Cart (0)
                  </LocalizedClientLink>
                }
              >
                <CartButton />
              </Suspense>
            </div>
          </div>

          {/* Bottom Row: Categories */}
          <div className="hidden md:flex items-center justify-center gap-x-8 text-sm font-medium h-12 w-full border-t border-blue-800">
            <LocalizedClientLink href="/" className="hover:text-blue-300 transition-colors">Home</LocalizedClientLink>
            
            {/* Colour Changing Dropdown */}
            <div className="relative hover-dropdown h-full flex items-center">
              <LocalizedClientLink href="/categories/colour-changing" className="hover:text-blue-300 transition-colors flex items-center gap-1 h-full">
                <span>Colour Changing</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-200 dropdown-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </LocalizedClientLink>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[12rem] bg-[#0a192f] border border-blue-800 rounded-md shadow-xl py-2 hidden dropdown-menu flex-col z-50">
                <LocalizedClientLink href="/categories/dynamicshift" className="px-4 py-2 hover:bg-blue-800 hover:text-blue-300 transition-colors text-left text-xs font-semibold text-white">
                  Dynamicshift
                </LocalizedClientLink>
                <LocalizedClientLink href="/categories/colorshift" className="px-4 py-2 hover:bg-blue-800 hover:text-blue-300 transition-colors text-left text-xs font-semibold text-white">
                  Colorshift
                </LocalizedClientLink>
                <LocalizedClientLink href="/categories/lazerghost" className="px-4 py-2 hover:bg-blue-800 hover:text-blue-300 transition-colors text-left text-xs font-semibold text-white">
                  Lazerghost
                </LocalizedClientLink>
              </div>
            </div>

            {/* Pearls Dropdown */}
            <div className="relative hover-dropdown h-full flex items-center">
              <LocalizedClientLink href="/categories/pearls" className="hover:text-blue-300 transition-colors flex items-center gap-1 h-full">
                <span>Pearls</span>
                <svg className="w-3.5 h-3.5 transition-transform duration-200 dropdown-arrow" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </LocalizedClientLink>
              
              <div className="absolute top-full left-1/2 -translate-x-1/2 min-w-[12rem] bg-[#0a192f] border border-blue-800 rounded-md shadow-xl py-2 hidden dropdown-menu flex-col z-50">
                <LocalizedClientLink href="/categories/crystal-pearls" className="px-4 py-2 hover:bg-blue-800 hover:text-blue-300 transition-colors text-left text-xs font-semibold text-white">
                  Crystal Pearls
                </LocalizedClientLink>
                <LocalizedClientLink href="/categories/vivid-pearls" className="px-4 py-2 hover:bg-blue-800 hover:text-blue-300 transition-colors text-left text-xs font-semibold text-white">
                  Vivid pearls
                </LocalizedClientLink>
              </div>
            </div>

            <LocalizedClientLink href="/categories/candy" className="hover:text-blue-300 transition-colors">Candy</LocalizedClientLink>
            <LocalizedClientLink href="/categories/neons" className="hover:text-blue-300 transition-colors">Neons</LocalizedClientLink>
            <LocalizedClientLink href="/categories/metal-flake" className="hover:text-blue-300 transition-colors">Metal Flake</LocalizedClientLink>
            <LocalizedClientLink href="/categories/premix" className="hover:text-blue-300 transition-colors">Premix</LocalizedClientLink>
            <LocalizedClientLink href="/categories/paint-shop" className="hover:text-blue-300 transition-colors">Paint Shop</LocalizedClientLink>
          </div>
        </nav>
      </header>
    </div>
  )
}
