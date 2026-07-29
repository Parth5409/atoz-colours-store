"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag, revalidatePath } from "next/cache"

// Retrieve sales channels using admin authorization
export async function retrieveAdminSalesChannels() {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) return []
  try {
    const response = await sdk.client.fetch<{ sales_channels: any[] }>("/admin/sales-channels", {
      method: "GET",
      headers,
    })
    return response?.sales_channels || []
  } catch (error) {
    console.warn("Failed to retrieve sales channels:", error)
    return []
  }
}

// Create a new paint product/color
export async function createAdminProduct(payload: any) {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    throw new Error("Unauthorized: Please log in as store admin.")
  }

  try {
    const salesChannels = await retrieveAdminSalesChannels()
    if (!payload.sales_channels && salesChannels.length > 0) {
      payload.sales_channels = salesChannels.map((sc: any) => ({ id: sc.id }))
    }

    const response = await sdk.client.fetch<any>("/admin/products", {
      method: "POST",
      headers,
      body: payload,
    })

    const createdProduct = response?.product
    if (createdProduct?.id && salesChannels.length > 0) {
      try {
        await sdk.client.fetch<any>(`/admin/products/${createdProduct.id}/sales-channels`, {
          method: "POST",
          headers,
          body: { add: salesChannels.map((sc: any) => sc.id) },
        })
      } catch (scErr) {
        console.warn("Sales channel explicit bind warning:", scErr)
      }
    }

    try {
      revalidateTag("products")
      revalidatePath("/", "layout")
    } catch (e) {
      // Ignore revalidate context errors if called client side
    }

    return createdProduct
  } catch (error: any) {
    console.error("Failed to create admin product:", error)
    throw new Error(error?.message || "Failed to create product")
  }
}

// Update an existing paint product
export async function updateAdminProduct(productId: string, payload: any) {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    throw new Error("Unauthorized: Please log in as store admin.")
  }

  try {
    const response = await sdk.client.fetch<any>(`/admin/products/${productId}`, {
      method: "POST",
      headers,
      body: payload,
    })

    try {
      revalidateTag("products")
      revalidatePath("/", "layout")
    } catch (e) {
      // Ignore revalidate context errors if called client side
    }

    return response.product
  } catch (error: any) {
    console.error("Failed to update admin product:", error)
    throw new Error(error?.message || "Failed to update product")
  }
}

// Delete an admin product
export async function deleteAdminProduct(productId: string) {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    throw new Error("Unauthorized: Please log in as store admin.")
  }

  try {
    await sdk.client.fetch<any>(`/admin/products/${productId}`, {
      method: "DELETE",
      headers,
    })

    try {
      revalidateTag("products")
      revalidatePath("/", "layout")
    } catch (e) {
      // Ignore revalidate context errors if called client side
    }
  } catch (error: any) {
    console.error("Failed to delete admin product:", error)
    throw new Error(error?.message || "Failed to delete product")
  }
}
import { redirect } from "next/navigation"

// Helper to get admin authorization headers
export const getAdminAuthHeaders = async (): Promise<
  { authorization: string } | Record<string, never>
> => {
  try {
    const cookies = await nextCookies()
    const token = cookies.get("_medusa_admin_jwt")?.value

    if (!token) {
      return {}
    }

    return { authorization: `Bearer ${token}` }
  } catch {
    return {}
  }
}

// Verify if admin JWT session cookie exists on server
export async function checkAdminSession(): Promise<boolean> {
  try {
    const headers = await getAdminAuthHeaders()
    return !!headers.authorization
  } catch (error) {
    console.warn("Failed to check admin session:", error)
    return false
  }
}


// Log in as an administrator
export async function adminLogin(
  _currentState: unknown,
  formData: FormData
): Promise<{ state: "success" | "error"; error?: string }> {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  try {
    const result = await sdk.auth.login("user", "emailpass", { email, password })

    if (typeof result !== "string") {
      return {
        state: "error",
        error: "Invalid login response from server.",
      }
    }

    const cookies = await nextCookies()
    cookies.set("_medusa_admin_jwt", result, {
      maxAge: 60 * 60 * 24, // 1 day
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
    })

    return { state: "success" }
  } catch (error: any) {
    return { state: "error", error: error?.message || String(error) }
  }
}

// Log out administrative user
export async function adminLogout() {
  const cookies = await nextCookies()
  cookies.set("_medusa_admin_jwt", "", {
    maxAge: -1,
  })
  redirect("/admin/login")
}

// Retrieve products using admin privilege (with public store fallback)
export async function retrieveAdminProducts() {
  const headers = await getAdminAuthHeaders()

  if (headers.authorization) {
    try {
      const response = await sdk.client.fetch<{ products: any[] }>("/admin/products", {
        method: "GET",
        headers,
        query: {
          limit: 100,
          fields: "*categories,*variants,*variants.prices",
        },
      })
      if (response?.products && response.products.length > 0) {
        return response.products
      }
    } catch (error) {
      console.warn("Failed to fetch via /admin/products, falling back to /store/products:", error)
    }
  }

  // Fallback to store products API
  try {
    const storeResp = await sdk.client.fetch<{ products: any[] }>("/store/products", {
      method: "GET",
      query: {
        limit: 100,
        fields: "*categories,*variants,*variants.prices",
      },
    })
    return storeResp?.products || []
  } catch (err) {
    console.error("Failed to retrieve products:", err)
    return []
  }
}


// Retrieve categories using admin privilege (with store fallback)
export async function retrieveAdminCategories() {
  const headers = await getAdminAuthHeaders()

  if (headers.authorization) {
    try {
      const response = await sdk.client.fetch<{ product_categories: any[] }>("/admin/product-categories", {
        method: "GET",
        headers,
        query: {
          limit: 100,
        },
      })
      if (response?.product_categories) {
        return response.product_categories
      }
    } catch (error) {
      console.warn("Failed to retrieve admin categories, falling back to store categories:", error)
    }
  }

  try {
    const storeCatResp = await sdk.client.fetch<{ product_categories: any[] }>("/store/product-categories", {
      method: "GET",
      query: {
        limit: 100,
      },
    })
    return storeCatResp?.product_categories || []
  } catch (err) {
    console.error("Failed to retrieve categories:", err)
    return []
  }
}


