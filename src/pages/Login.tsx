import { useEffect } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { USE_MOCKS, type ApiError } from "@/services";
import { AuthShell } from "./AuthShell";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});
type Values = z.infer<typeof schema>;

export function Login({ redirect }: { redirect?: string }) {
  const { login, isAuthenticated, isAdmin, ready } = useAuth();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });

  const go = (admin: boolean) => {
    if (redirect && redirect.startsWith("/") && !redirect.startsWith("//"))
      navigate({ to: redirect, replace: true });
    else navigate({ to: admin ? "/admin" : "/dashboard", replace: true });
  };
  useEffect(() => {
    if (ready && isAuthenticated) go(isAdmin);
  }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSubmit = async (v: Values) => {
    try {
      const u = await login(v);
      toast.success(`Welcome back, ${u.full_name.split(" ")[0]}`);
      go(u.role === "admin");
    } catch (e) {
      toast.error((e as ApiError).message || "Sign in failed");
    }
  };
  const fill = (email: string) => {
    setValue("email", email);
    setValue("password", "demo1234");
  };

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to manage your flight requirements.">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            className="h-11 rounded-xl"
            {...register("email")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            className="h-11 rounded-xl"
            {...register("password")}
          />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        <Button type="submit" variant="hero" size="xl" className="w-full" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="animate-spin" />} Sign in
        </Button>
      </form>
      {USE_MOCKS && (
        <div className="mt-6 rounded-2xl bg-secondary p-4 text-sm">
          <p className="mb-2 font-semibold">Demo accounts (password: demo1234)</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => fill("traveller@demo.com")}>
              Traveller
            </Button>
            <Button size="sm" variant="outline" onClick={() => fill("admin@demo.com")}>
              Admin
            </Button>
          </div>
        </div>
      )}
      <p className="mt-6 text-center text-sm text-muted-foreground">
        New here?{" "}
        <Link to="/register" className="font-semibold text-primary hover:underline">
          Create an account
        </Link>
      </p>
    </AuthShell>
  );
}
