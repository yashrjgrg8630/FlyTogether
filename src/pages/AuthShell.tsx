import type { ReactNode } from "react";
export function AuthShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <div className="bg-hero flex flex-1 items-center justify-center px-4 py-16">
      <div className="animate-rise w-full max-w-md rounded-3xl border bg-card p-8 shadow-lift">
        <h1 className="text-2xl font-semibold">{title}</h1>
        <p className="mb-6 mt-1 text-sm text-muted-foreground">{subtitle}</p>
        {children}
      </div>
    </div>
  );
}
