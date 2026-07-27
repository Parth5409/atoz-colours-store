import { listCategories } from "@lib/data/categories";
import { listCollections } from "@lib/data/collections";
import { Text, clx } from "@modules/common/components/ui";

import LocalizedClientLink from "@modules/common/components/localized-client-link";
import MedusaCTA from "@modules/layout/components/medusa-cta";

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  });
  const productCategories = await listCategories();

  return (
    <footer className="w-full bg-black text-white">
      {/* Trust Badges Row */}
      <div className="border-b border-gray-800 py-4 bg-white text-black">
        <div className="content-container flex flex-wrap items-center justify-between text-xs font-semibold uppercase tracking-wider gap-4">
          <div className="flex items-center gap-2"><span className="text-xl">⛨</span> PROFESSIONAL GUIDENCE 24*7</div>
          <div className="flex items-center gap-2"><span className="text-xl">✓</span> PROUD INDIAN COMPANY</div>
          <div className="flex items-center gap-2"><span className="text-xl">⚡</span> SECURE PAYMENT</div>
          <div className="flex items-center gap-2"><span className="text-xl">🏅</span> HIGH END ENGINEERED SHADES</div>
          <div className="flex items-center gap-2"><span className="text-xl">★</span> PREMIUM QUALITY</div>
          <div className="flex items-center gap-2"><span className="text-xl">🚚</span> SAME OR NEXT DAY DISPATCH</div>
        </div>
      </div>

      <div className="content-container py-16 flex flex-col md:flex-row justify-between gap-12">
        {/* Logo and Taglines */}
        <div className="flex flex-col gap-4 max-w-xs items-center text-center">
          <LocalizedClientLink href="/" className="mb-4">
            <img src="/logo_coloured.jpg" alt="AtoZ Colours" className="w-32 h-auto object-contain" />
          </LocalizedClientLink>
          <ul className="text-sm space-y-2 font-medium">
            <li>Only The Best !</li>
            <li>Pearls | Paints | Effects</li>
            <li>Automotive Colour Lab</li>
            <li>Performance Proven</li>
          </ul>
          <div className="flex gap-4 mt-4">
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">f</div>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">X</div>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">in</div>
            <div className="w-8 h-8 rounded-full bg-white text-black flex items-center justify-center">✉</div>
          </div>
        </div>

        {/* Support Links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg mb-2">Support</h3>
          <ul className="text-sm space-y-3">
            <li><LocalizedClientLink href="/privacy">Privacy Policy</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/refund">Refund Policy</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/shipping">Shipping Policy</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/about">About Us</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/contact">Contact Us</LocalizedClientLink></li>
          </ul>
        </div>

        {/* Store Links */}
        <div className="flex flex-col gap-4">
          <h3 className="font-bold text-lg mb-2">Store</h3>
          <ul className="text-sm space-y-3">
            <li><LocalizedClientLink href="/blogs/inside-randd">Inside AtoZ R&D</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/categories/candy">Candy Red</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/blogs/carbon-fiber">Pop fucia on Carbon fiber</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/speciality">Speciality</LocalizedClientLink></li>
            <li><LocalizedClientLink href="/tds">TDS</LocalizedClientLink></li>
          </ul>
        </div>

        {/* Newsletter */}
        <div className="flex flex-col gap-4 max-w-sm">
          <h3 className="font-bold text-lg mb-2">Subscribe To Newsletter</h3>
          <p className="text-xs mb-2">Keep a touch with us to know the exciting offers and products.</p>
          <div className="flex">
            <input type="email" placeholder="Email address" className="px-4 py-2 text-black w-full outline-none" />
            <button className="bg-red-600 px-6 py-2 text-white font-bold whitespace-nowrap">Submit ↗</button>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-800">
        <div className="content-container py-6 flex flex-col md:flex-row justify-between items-center text-xs text-gray-400">
          <p>© {new Date().getFullYear()} AtoZ Colours. All Rights Reserved.</p>
          <div className="flex gap-2">
            {/* Payment Icons Placeholder */}
            <div className="bg-white rounded px-2 text-black text-xs font-bold py-1">AMEX</div>
            <div className="bg-white rounded px-2 text-black text-xs font-bold py-1">Pay</div>
            <div className="bg-white rounded px-2 text-black text-xs font-bold py-1">VISA</div>
          </div>
        </div>
      </div>
    </footer>
  );
}
