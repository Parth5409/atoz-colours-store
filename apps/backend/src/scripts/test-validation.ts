import { ExecArgs } from "@medusajs/framework/types"
import { createProductsWorkflow } from "@medusajs/medusa/core-flows"
import { MedusaError } from "@medusajs/framework/utils"
import { Modules } from "@medusajs/framework/utils"

export default async function testValidation({ container }: ExecArgs) {
  const productModuleService = container.resolve(Modules.PRODUCT)

  let categories = await productModuleService.listProductCategories({ handle: "candy-neon-basecoats" })
  let categoryId = categories[0]?.id

  if (!categoryId) {
    console.error("Paint category missing. Run seed script first.")
    return
  }

  const runTest = async (name: string, metadata: any, categoryIds: string[], expectSuccess: boolean) => {
    console.log(`\nRunning test: ${name}`)
    try {
      await createProductsWorkflow(container).run({
        input: {
          products: [{
            title: `Test Product ${name}`,
            handle: `test-product-${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`,
            category_ids: categoryIds,
            options: [{ title: "Volume", values: ["1L"] }],
            metadata
          }]
        }
      })
      if (expectSuccess) {
        console.log(`✅ Success: Product created as expected.`)
      } else {
        console.error(`❌ Failed: Expected error but product was created.`)
      }
    } catch (e: any) {
      if (!expectSuccess && e instanceof MedusaError && e.type === MedusaError.Types.INVALID_DATA) {
        console.log(`✅ Success: Caught expected validation error: ${e.message}`)
      } else {
        console.error(`❌ Failed: Unexpected error type or success expected.`, e)
      }
    }
  }

  // 7.1 Happy path
  await runTest("Happy Path", { color_hex: "#000", mix_ratio: "1:1", hazmat_class: "Class 1" }, [categoryId], true)

  // 7.2 Missing color_hex
  await runTest("Missing color_hex", { mix_ratio: "1:1", hazmat_class: "Class 1" }, [categoryId], false)

  // 7.3 Missing mix_ratio
  await runTest("Missing mix_ratio", { color_hex: "#000", hazmat_class: "Class 1" }, [categoryId], false)

  // 7.4 Missing hazmat_class
  await runTest("Missing hazmat_class", { color_hex: "#000", mix_ratio: "1:1" }, [categoryId], false)

  // 7.5 hazmat instead of hazmat_class
  await runTest("hazmat mismatch", { color_hex: "#000", mix_ratio: "1:1", hazmat: "Class 1" }, [categoryId], false)

  // 7.6 Non-paint product
  await runTest("Non-paint product", { }, [], true)

  // 7.7 Multiple missing fields
  await runTest("Multiple missing", { color_hex: "#000" }, [categoryId], false)

  console.log("\\nTesting complete.")
}
