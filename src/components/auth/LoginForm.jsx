"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import Link from "next/link";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/lib/firebase";
import { toast } from "react-hot-toast";
import { Loader2 } from "lucide-react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loading1, setLoading1] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.status === 403) {
        toast.error(data.error)
        window.location.href = `/verifyEmail?email=${encodeURIComponent(email)}`;
        return;
      }

      if (!response.ok) {
        toast.error(data.error || "Login failed");
        return;
      }
      toast.success(data.message)
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  const handleGoogleLogin = async () => {
    setLoading1(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const idToken = await user.getIdToken(true);

      const res = await fetch("/api/auth/googleAuth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idToken }),
      });

      const data = await res.json();

      if (!res.ok) toast.error(data.error);
      
      toast.success("Google Login Successfull")
      setLoading1(false);
      window.location.href = "/dashboard";
    } catch (err) {
      console.error(err);
      toast.error(data.error);
    }
  };

  return (
    <Card className="p-6 border-border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Email</label>
          <Input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Password</label>
          <Input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && (
          <div className="text-destructive text-sm bg-destructive/10 p-3 rounded">
            {error}
          </div>
        )}

        <Button type="submit" className="w-full" disabled={loading}>
           {loading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
          {loading ? "" : "Sign In"}
        </Button>

        <div className="relative my-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-card text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <Button
            type="button"
            variant="outline"
            className="w-1/2"
            disabled={loading1}
            onClick={handleGoogleLogin}
          >
            {loading1 ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            {loading1 ? "" : "Continue With Google"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="w-1/2 bg-transparent hover:bg-yellow-600"
          >
            Guest Account
          </Button>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don't have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </form>
    </Card>
  );
}
