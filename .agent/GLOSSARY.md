# Domain Glossary

Terms specific to the automotive paint business that aren't obvious from
generic e-commerce or Medusa knowledge.

| Term                | Meaning                                                                |
|-----------------------|----------------------------------------------------------------------|
| Basecoat              | Base color layer applied before clear coat; also a "Finish" variant option |
| Candy / Candy Neon    | Translucent, high-saturation color coat applied over a reflective base |
| Pearl / Shift Pearl   | Coating with color-shifting pigment depending on viewing angle          |
| Clear Coat             | Protective transparent top layer, sold separately (Acrylic Thinner / High Solid Clear) |
| Mix Ratio               | Ratio (e.g. `2:1 Urethane`) describing how a paint is mixed before use    |
| Lab Code                 | Internal SKU-like code (e.g. `DYN-AET-001`) identifying a specific paint mix, stored in variant metadata as `lab_code` |
| Lab Slip                  | Auto-generated instruction sheet for paint-mixing staff, produced on `order.placed` |
| `color_hex`                | Required variant metadata field: hex representation of the paint color   |
| `hazmat` / `hazmat_class`  | Required variant metadata field flagging hazardous-material status — **naming not yet reconciled between the original implementation plan (`hazmat`, boolean) and the architecture doc (`hazmat_class`, string e.g. `"Class 3 Flammable"`). Confirm actual field name in `product-validation-hook.ts` before use.** |
| Cartesian variant matrix    | The full set of Size × Finish combinations Medusa auto-generates per base product (e.g. `Dynamicshift Aether — 1L Tin — Gloss`) |

Add to this table as new paint-specific vocabulary shows up — don't let it
live only in code comments.
