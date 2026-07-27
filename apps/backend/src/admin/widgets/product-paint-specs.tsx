import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { DetailWidgetProps, AdminProduct } from "@medusajs/framework/types"
import { Container, Heading, Input, Button, Label, toast } from "@medusajs/ui"
import { useState } from "react"

const ProductPaintSpecsWidget = ({ data: product }: DetailWidgetProps<AdminProduct>) => {
  const [colorHex, setColorHex] = useState((product.metadata?.color_hex as string) || "")
  const [mixRatio, setMixRatio] = useState((product.metadata?.mix_ratio as string) || "")
  const [hazmatClass, setHazmatClass] = useState((product.metadata?.hazmat_class as string) || "")
  const [loading, setLoading] = useState(false)

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const response = await fetch(`/admin/products/${product.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          metadata: {
            ...product.metadata,
            color_hex: colorHex,
            mix_ratio: mixRatio,
            hazmat_class: hazmatClass,
          }
        })
      })

      if (!response.ok) {
        throw new Error("Failed to save specifications")
      }

      toast.success("Paint specifications updated successfully.")
    } catch (error) {
      console.error(error)
      toast.error("Failed to update paint specifications.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Container className="divide-y divide-gray-200 p-0">
      <div className="flex items-center justify-between px-6 py-4">
        <Heading level="h2">Paint Specifications</Heading>
      </div>
      <form onSubmit={handleSave} className="p-6 flex flex-col gap-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-y-2">
            <Label htmlFor="color_hex">Color Hex Code</Label>
            <div className="flex items-center gap-x-2">
              <Input
                id="color_hex"
                placeholder="#FF0000"
                value={colorHex}
                onChange={(e) => setColorHex(e.target.value)}
              />
              <div 
                className="w-10 h-10 border border-gray-200 shrink-0" 
                style={{ backgroundColor: colorHex || "transparent" }}
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <Label htmlFor="mix_ratio">Mix Ratio</Label>
            <Input
              id="mix_ratio"
              placeholder="2:1"
              value={mixRatio}
              onChange={(e) => setMixRatio(e.target.value)}
            />
          </div>

          <div className="flex flex-col gap-y-2 col-span-2">
            <Label htmlFor="hazmat_class">Classification (e.g. Hazmat)</Label>
            <Input
              id="hazmat_class"
              placeholder="Class 3 Flammable"
              value={hazmatClass}
              onChange={(e) => setHazmatClass(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-x-2 mt-4">
          <Button type="submit" variant="primary" isLoading={loading}>
            Save Specifications
          </Button>
        </div>
      </form>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductPaintSpecsWidget
