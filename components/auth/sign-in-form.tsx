"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { sendPasswordResetEmail, signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import Link from "next/link"

const formSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }),
})

const resetSchema = z.object({
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const inputClassName = "glass-well h-11 rounded-xl px-4 text-sm"

export function SignInForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [mode, setMode] = useState<"sign-in" | "reset">("sign-in")
  const router = useRouter()

  useEffect(() => {
    const syncMode = () =>
      setMode(window.location.hash === "#reset-password" ? "reset" : "sign-in")
    syncMode()
    window.addEventListener("hashchange", syncMode)
    return () => window.removeEventListener("hashchange", syncMode)
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const resetForm = useForm<z.infer<typeof resetSchema>>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true)
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password)
      toast.success("Welcome back!")
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Sign in error:", error)
      const errorCode = error.code
      let errorMessage = "Invalid email or password."

      if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password" || errorCode === "auth/invalid-credential") {
        errorMessage = "Invalid email or password. Please try again."
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later."
      } else if (error.message) {
        errorMessage = error.message
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  async function onReset(values: z.infer<typeof resetSchema>) {
    setIsLoading(true)
    try {
      await sendPasswordResetEmail(auth, values.email)
      toast.success("Reset link sent", {
        description: "Check your inbox to set a new password.",
      })
      window.history.replaceState(null, "", "/sign-in")
      resetForm.reset()
      setMode("sign-in")
    } catch (error: any) {
      console.error("Password reset error:", error)
      const errorCode = error.code
      let errorMessage = "Could not send the reset link. Please try again."

      if (errorCode === "auth/user-not-found") {
        errorMessage = "No account found with that email address."
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many attempts. Please try again later."
      }

      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  const openReset = () => {
    window.location.hash = "reset-password"
  }

  const closeReset = () => {
    window.history.replaceState(null, "", "/sign-in")
    setMode("sign-in")
  }

  if (mode === "reset") {
    return (
      <div>
        <button
          type="button"
          onClick={closeReset}
          className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to sign in
        </button>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">Reset your password</h1>
          <p className="text-sm text-muted-foreground">
            We&apos;ll email you a link to set a new password.
          </p>
        </div>

        <Form {...resetForm}>
          <form onSubmit={resetForm.handleSubmit(onReset)} className="mt-8 space-y-5">
            <FormField
              control={resetForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@company.com"
                      className={inputClassName}
                      {...field}
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" variant="glass" className="h-11 w-full rounded-xl" disabled={isLoading}>
              {isLoading ? (
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
              ) : (
                "Send reset link"
              )}
            </Button>
          </form>
        </Form>
      </div>
    )
  }

  return (
    <div>
      <div className="space-y-1.5">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="text-sm text-muted-foreground">Sign in to continue to your dashboard</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-5">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="name@company.com"
                    className={inputClassName}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Password</FormLabel>
                  <button
                    type="button"
                    onClick={openReset}
                    className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    Forgot password?
                  </button>
                </div>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="••••••••"
                    className={inputClassName}
                    {...field}
                    disabled={isLoading}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" variant="glass" className="h-11 w-full rounded-xl" disabled={isLoading}>
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-t-transparent" />
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
      </Form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        Don&apos;t have an account?{" "}
        <Link href="/sign-up" className="font-medium text-foreground transition-colors hover:text-primary">
          Sign up
        </Link>
      </p>
    </div>
  )
}
