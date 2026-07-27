import { ExecArgs } from "@medusajs/framework/types"
import { Modules } from "@medusajs/framework/utils"

export default async function listProducts({ container }: ExecArgs) {
  const productModuleService = container.resolve(Modules.PRODUCT)
  const products = await productModuleService.listProducts({}, { relations: ["categories"] })
  console.log("Database Products:")
  products.forEach(p => {
    console.log(`- Title: ${p.title}, Handle: ${p.handle}, Categories: ${p.categories?.map(c => c.handle).join(", ") || "None"}`)
  })
}
