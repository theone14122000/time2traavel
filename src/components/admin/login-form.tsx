"use client";

import * as React from "react";
import Link from "next/link";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, LoaderCircle, ShieldCheck } from "lucide-react";
import { loginSchema, type LoginInput } from "@/schemas/forms";
import { loginAction } from "@/actions/auth";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const defaultValues: LoginInput = { email: "", password: "" };

export function LoginForm({ redirectTo }: { redirectTo?: string }) {
  const [showPassword, setShowPassword] = React.useState(false);
  const form = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: "onBlur",
  });
  const { formState } = form;

  async function onSubmit(values: LoginInput) {
    const result = await loginAction(values, redirectTo);
    // On success `loginAction` redirects — nothing else to do here.
    if (result.ok) return;

    let matched = false;
    if (result.fieldErrors) {
      for (const [field, messages] of Object.entries(result.fieldErrors)) {
        if (field in defaultValues && messages?.[0]) {
          form.setError(field as keyof LoginInput, { message: messages[0] });
          matched = true;
        }
      }
    }
    if (!matched) {
      form.setError("root", { message: result.error });
    }
  }

  const rootError = form.formState.errors.root?.message;

  return (
    <main className="flex min-h-dvh items-center justify-center bg-cream px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex flex-col items-center gap-2 text-center">
          <span className="label-brutal border-[3px] border-ink bg-ink px-3 py-1.5 text-cream">
            Admin panel
          </span>
          <h1 className="font-display text-h3 uppercase">Time to Travel</h1>
        </div>

        <div className="border-[3px] border-ink bg-paper shadow-hard-xl">
          <div className="flex items-center gap-3 border-b-[3px] border-ink bg-lemon px-5 py-4">
            <ShieldCheck aria-hidden="true" className="size-5" />
            <h2 className="font-display text-lg uppercase leading-none">
              Sign in
            </h2>
          </div>

          <FormProvider {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit)}
              noValidate
              className="grid gap-4 p-5"
            >
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel required>Email</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        autoComplete="username"
                        placeholder="admin@example.com"
                        {...field}
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
                    <FormLabel required>Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          type={showPassword ? "text" : "password"}
                          autoComplete="current-password"
                          placeholder="••••••••"
                          className="pr-14"
                          {...field}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword((v) => !v)}
                          className="absolute right-0 top-0 flex h-full items-center gap-1 border-l-[3px] border-ink bg-butter px-3 text-xs font-bold uppercase hover:bg-lemon"
                          aria-label={
                            showPassword ? "Hide password" : "Show password"
                          }
                        >
                          {showPassword ? (
                            <EyeOff aria-hidden="true" className="size-4" />
                          ) : (
                            <Eye aria-hidden="true" className="size-4" />
                          )}
                        </button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {rootError ? (
                <p
                  role="alert"
                  className="border-[2px] border-ink bg-pink px-3 py-2 text-sm font-bold"
                >
                  {rootError}
                </p>
              ) : null}

              <Button
                type="submit"
                size="lg"
                className="w-full"
                loading={formState.isSubmitting}
              >
                {formState.isSubmitting ? (
                  <>
                    <LoaderCircle aria-hidden="true" className="size-4" />
                    Signing in
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </FormProvider>
        </div>

        <p className="mt-6 text-center text-xs font-semibold text-ink-soft">
          <Link href="/" className="underline underline-offset-2">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
