import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BadgeIndianRupee,
  Search,
  Users,
  ClipboardList,
  ShieldCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { RouteBadge } from "@/components/common/RouteBadge";
import { StatusBadge } from "@/components/common/StatusBadge";
import { GroupProgress } from "@/components/groups/GroupProgress";
import { SourceBadge } from "@/components/quotations/SourceBadge";
import { formatINR } from "@/utils/format";
import hero from "@/assets/hero-sky.jpg";
import { FadeUp } from "@/components/motion/Motion";

const STEPS = [
  {
    icon: ClipboardList,
    title: "Publish your requirement",
    text: "Route, date, flexibility and how many seats you need.",
  },
  {
    icon: Search,
    title: "Get matched",
    text: "We suggest groups on compatible routes and dates. You decide to join.",
  },
  {
    icon: Users,
    title: "Reach the threshold",
    text: "Once enough seats are pooled, an admin requests group quotations.",
  },
  {
    icon: BadgeIndianRupee,
    title: "Compare offers",
    text: "Review quotations side by side and book directly with the airline.",
  },
];

export function Home() {
  return (
    <div>
      <section className="relative overflow-hidden bg-hero">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 md:py-24 lg:grid-cols-2">
          <div className="animate-rise space-y-6">
            <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
              <ShieldCheck className="size-3.5" /> Demand aggregation · no ticket sales
            </span>
            <h1 className="text-5xl font-semibold leading-[1.02] sm:text-6xl lg:text-7xl">
              Fly the same route? Ask airlines <span className="font-serif-accent">together.</span>
            </h1>
            <p className="max-w-lg text-lg text-muted-foreground">
              FlyTogether pools travellers heading the same way on similar dates, so a group can
              request quotations that individuals rarely see.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button variant="hero" size="xl" asChild>
                <Link to="/register">
                  Publish a requirement <ArrowRight />
                </Link>
              </Button>
              <Button variant="outline" size="xl" asChild>
                <Link to="/login" search={{ redirect: undefined }}>
                  Sign in
                </Link>
              </Button>
            </div>
          </div>
          <div className="relative">
            <img
              src={hero}
              alt="View over clouds from an aircraft window at sunset"
              width={1280}
              height={1280}
              className="aspect-[4/5] w-full rounded-3xl border object-cover sm:aspect-square"
            />
            <div className="animate-float absolute -bottom-6 left-4 right-4 glass rounded-2xl border p-4 shadow-lift sm:left-auto sm:w-80">
              <div className="mb-3 flex items-center justify-between">
                <RouteBadge origin="BLR" destination="DEL" />
                <StatusBadge status="quotation_eligible" />
              </div>
              <GroupProgress filled={14} max={30} threshold={10} />
              <p className="mt-2 text-xs text-muted-foreground">Target 21 Dec · ±2 days window</p>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-20">
        <h2 className="text-4xl font-semibold">
          How it <span className="font-serif-accent">works</span>
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <FadeUp key={s.title} delay={i * 0.06}>
              <div className="h-full rounded-2xl border bg-card p-6 shadow-soft transition-all duration-200 hover:-translate-y-0.5 hover:border-border-strong">
                <div className="mb-4 flex items-center justify-between">
                  <span className="grid size-10 place-items-center rounded-xl border text-primary">
                    <s.icon className="size-5" />
                  </span>
                  <span className="text-sm tabular-nums text-subtle">0{i + 1}</span>
                </div>
                <h3 className="font-semibold">{s.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{s.text}</p>
              </div>
            </FadeUp>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-20">
        <div className="grid gap-8 rounded-3xl border bg-card p-8 shadow-soft md:grid-cols-2 md:p-12">
          <div className="space-y-3">
            <h2 className="text-4xl font-semibold">
              Transparent about <span className="font-serif-accent">every</span> quote
            </h2>
            <p className="text-muted-foreground">
              Each quotation is labelled with where it came from. We never claim an offer is
              airline-verified.
            </p>
          </div>
          <div className="space-y-3">
            {[
              { a: "Air India", p: 5320, s: "manual" as const },
              { a: "IndiGo", p: 4850, s: "simulated" as const },
            ].map((q) => (
              <div
                key={q.a}
                className="flex items-center justify-between rounded-2xl border bg-background p-4"
              >
                <div>
                  <div className="font-semibold">{q.a}</div>
                  <SourceBadge source={q.s} className="mt-1" />
                </div>
                <div className="text-right">
                  <div className="text-xl font-semibold tabular-nums">{formatINR(q.p)}</div>
                  <div className="text-xs text-muted-foreground">per passenger</div>
                </div>
              </div>
            ))}
            <p className="text-xs text-muted-foreground">Illustrative, not a real airline offer.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
