import { Hammer } from "lucide-react";
import { EmptyState } from "./EmptyState";
export function ComingSoon({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <h1 className="mb-6 text-3xl font-bold">{title}</h1>
      <EmptyState
        icon={Hammer}
        title="Coming in the next step"
        description="This page is wired into routing and guards; its content will be built next."
      />
    </div>
  );
}
