"use client"

import React, { useActionState, useEffect } from "react"
import { adminLogin } from "@lib/data/admin"
import { useRouter, useParams } from "next/navigation"

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(adminLogin, null)
  const router = useRouter()
  const params = useParams()
  const countryCode = params?.countryCode as string || "in"

  useEffect(() => {
    if (state?.state === "success") {
      router.push(`/${countryCode}/admin/dashboard`)
    }
  }, [state, router, countryCode])

  return (
    <div className="flex-grow flex items-center justify-center p-6 bg-neutral-50">
      <div className="w-full max-w-md bg-white border border-black p-8 sm:p-12 shadow-none rounded-none">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold uppercase tracking-tight mb-2">
            Admin Portal
          </h1>
          <p className="text-sm text-neutral-500">
            Sign in to manage custom automotive colors
          </p>
        </div>

        <form action={formAction} className="space-y-6">
          {state?.state === "error" && (
            <div className="p-4 bg-red-50 border border-red-500 text-red-700 text-sm font-medium rounded-none">
              {state.error}
            </div>
          )}

          <div>
            <label
              htmlFor="email"
              className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2"
            >
              Email Address
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              placeholder="admin@test.com"
              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none text-black rounded-none transition-colors duration-150 placeholder-neutral-300"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-xs uppercase font-mono tracking-wider text-neutral-500 mb-2"
            >
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              className="w-full px-4 py-3 border border-neutral-300 focus:border-black focus:outline-none text-black rounded-none transition-colors duration-150 placeholder-neutral-300"
            />
          </div>

          <button
            type="submit"
            disabled={isPending}
            className="w-full py-4 bg-black text-white hover:bg-neutral-900 transition-colors uppercase font-mono tracking-widest text-xs font-bold disabled:bg-neutral-400 disabled:cursor-not-allowed rounded-none"
          >
            {isPending ? "Authenticating..." : "Sign In"}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-neutral-100 text-center text-xs text-neutral-400">
          <span className="block mb-1 font-mono">DEFAULT DEV CREDENTIALS</span>
          <code className="bg-neutral-100 px-1 py-0.5 rounded text-neutral-600">
            admin@test.com / supersecret
          </code>
        </div>
      </div>
    </div>
  )
}
