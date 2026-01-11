"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useAuth } from "@/contexts/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"
import { Droplets, Loader2, Copy, Check, AlertTriangle } from "lucide-react"

const DEMO_CREDENTIALS = {
  admin: {
    email: "admin@delhiflood.gov.in",
    password: "Admin@123",
    role: "Admin (Full Access)",
  },
  citizen: {
    email: "citizen@demo.com",
    password: "Citizen@123",
    role: "Citizen (Report Access)",
  },
}

const getFirebaseErrorMessage = (errorCode: string): string => {
  const errorMessages: Record<string, string> = {
    "auth/configuration-not-found":
      "Firebase Authentication is not enabled. Please enable Email/Password sign-in in Firebase Console.",
    "auth/invalid-credential": "Invalid email or password. Please check your credentials.",
    "auth/user-not-found": "No account found with this email. Please sign up first.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/email-already-in-use": "An account with this email already exists.",
    "auth/weak-password": "Password should be at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/too-many-requests": "Too many failed attempts. Please try again later.",
    "auth/network-request-failed": "Network error. Please check your internet connection.",
  }
  return errorMessages[errorCode] || "An unexpected error occurred. Please try again."
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const [setupError, setSetupError] = useState<string | null>(null)
  const { signIn } = useAuth()
  const router = useRouter()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSetupError(null)

    try {
      await signIn(email, password)
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
      router.push("/")
    } catch (error: unknown) {
      const firebaseError = error as { code?: string; message?: string }
      const errorCode = firebaseError.code || ""
      const friendlyMessage = getFirebaseErrorMessage(errorCode)

      // Show setup instructions for configuration errors
      if (errorCode === "auth/configuration-not-found") {
        setSetupError(friendlyMessage)
      } else {
        toast({
          title: "Sign in failed",
          description: friendlyMessage,
          variant: "destructive",
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (type: "admin" | "citizen") => {
    setEmail(DEMO_CREDENTIALS[type].email)
    setPassword(DEMO_CREDENTIALS[type].password)
    toast({
      title: `${type === "admin" ? "Admin" : "Citizen"} credentials filled`,
      description: "Click 'Sign In' to continue",
    })
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopiedField(field)
    setTimeout(() => setCopiedField(null), 2000)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Droplets className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">Sign In</CardTitle>
          <CardDescription>Access the Waterlogging Intelligence System</CardDescription>
        </CardHeader>
        <CardContent>
          {setupError && (
            <Alert variant="destructive" className="mb-4">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Firebase Setup Required</AlertTitle>
              <AlertDescription className="mt-2 text-sm">
                <p className="mb-2">{setupError}</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>
                    Go to{" "}
                    <a
                      href="https://console.firebase.google.com/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline"
                    >
                      Firebase Console
                    </a>
                  </li>
                  <li>
                    Select project: <strong>delhi-water-logging</strong>
                  </li>
                  <li>
                    Click <strong>Authentication</strong> → <strong>Sign-in method</strong>
                  </li>
                  <li>
                    Enable <strong>Email/Password</strong>
                  </li>
                  <li>Save and refresh this page</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span className="text-muted-foreground">Don&apos;t have an account? </span>
            <Link href="/signup" className="text-primary hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-6 space-y-3">
            <p className="text-xs text-center text-muted-foreground font-medium uppercase tracking-wide">
              Demo Credentials
            </p>

            {/* Admin Credentials */}
            <div className="p-3 bg-accent/10 border border-accent/20 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-accent">ADMIN ACCESS</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => fillCredentials("admin")}
                >
                  Use This
                </Button>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-1">
                    <code className="bg-muted px-1.5 py-0.5 rounded">{DEMO_CREDENTIALS.admin.email}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.admin.email, "admin-email")}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {copiedField === "admin-email" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-1">
                    <code className="bg-muted px-1.5 py-0.5 rounded">{DEMO_CREDENTIALS.admin.password}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.admin.password, "admin-pass")}
                      className="p-1 hover:bg-muted rounded"
                    >
                      {copiedField === "admin-pass" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Citizen Credentials */}
            <div className="p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground">CITIZEN ACCESS</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-6 text-xs"
                  onClick={() => fillCredentials("citizen")}
                >
                  Use This
                </Button>
              </div>
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <div className="flex items-center gap-1">
                    <code className="bg-background px-1.5 py-0.5 rounded">{DEMO_CREDENTIALS.citizen.email}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.citizen.email, "citizen-email")}
                      className="p-1 hover:bg-background rounded"
                    >
                      {copiedField === "citizen-email" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Password:</span>
                  <div className="flex items-center gap-1">
                    <code className="bg-background px-1.5 py-0.5 rounded">{DEMO_CREDENTIALS.citizen.password}</code>
                    <button
                      type="button"
                      onClick={() => copyToClipboard(DEMO_CREDENTIALS.citizen.password, "citizen-pass")}
                      className="p-1 hover:bg-background rounded"
                    >
                      {copiedField === "citizen-pass" ? (
                        <Check className="h-3 w-3 text-green-500" />
                      ) : (
                        <Copy className="h-3 w-3 text-muted-foreground" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-center text-muted-foreground">
              First time? Create accounts via Sign Up after enabling Firebase Auth.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
