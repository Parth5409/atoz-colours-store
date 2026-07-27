import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import Categories from "@modules/home/components/categories"
import FeaturedProducts from "@modules/home/components/featured-products"
import WhyChooseUs from "@modules/home/components/why-choose-us"
import FeaturedBlogs from "@modules/home/components/featured-blogs"
import Faq from "@modules/home/components/faq"

export const metadata: Metadata = {
  title: "AtoZ Colours | Automotive Custom Paints",
  description:
    "Premium automotive custom paints, candy colors, and pearls.",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  return (
    <>
      <Categories />
      <Hero />
      <FeaturedProducts />
      <WhyChooseUs />
      <FeaturedBlogs />
      <Faq />
    </>
  )
}
