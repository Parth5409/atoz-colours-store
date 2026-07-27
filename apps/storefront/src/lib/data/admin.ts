"use server"

import { sdk } from "@lib/config"
import { cookies as nextCookies } from "next/headers"
import { revalidateTag } from "next/cache"
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

// Retrieve products using admin privilege
export async function retrieveAdminProducts() {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    return []
  }

  try {
    const response = await sdk.client.fetch<{ products: any[] }>("/admin/products", {
      method: "GET",
      headers,
      query: {
        limit: 100,
        fields: "*categories,*variants,*variants.prices",
      },
    })
    return response.products
  } catch (error) {
    console.error("Failed to retrieve admin products:", error)
    return []
  }
}

// Create a new paint product/color
export async function createAdminProduct(payload: any) {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    throw new Error("Unauthorized")
  }

  try {
    const response = await sdk.client.fetch<any>("/admin/products", {
      method: "POST",
      headers,
      body: payload,
    })

    revalidateTag("products")
    return response.product
  } catch (error: any) {
    console.error("Failed to create admin product:", error)
    throw new Error(error?.message || "Failed to create product")
  }
}

// Delete an admin product
export async function deleteAdminProduct(productId: string) {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    throw new Error("Unauthorized")
  }

  try {
    await sdk.client.fetch<any>(`/admin/products/${productId}`, {
      method: "DELETE",
      headers,
    })
    revalidateTag("products")
  } catch (error: any) {
    console.error("Failed to delete admin product:", error)
    throw new Error(error?.message || "Failed to delete product")
  }
}

// Retrieve categories using admin privilege
export async function retrieveAdminCategories() {
  const headers = await getAdminAuthHeaders()
  if (!headers.authorization) {
    return []
  }

  try {
    const response = await sdk.client.fetch<{ product_categories: any[] }>("/admin/product-categories", {
      method: "GET",
      headers,
      query: {
        limit: 100,
      },
    })
    return response.product_categories
  } catch (error) {
    console.error("Failed to retrieve admin categories:", error)
    return []
  }
}

