import { useState } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { LogOut, Menu, Moon, Sun, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/common/Logo";
import { useAuth } from "@/context/AuthContext";
import { useTheme } from "@/context/ThemeContext";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { cn } from "@/lib/utils";

type NavLink = { to: string; label: string };
const TRAVELLER: NavLink[] = [
  { to: "/dashboard", label: "Dashboard" },
  { to: "/create-request", label: "New request" },
  { to: "/discover", label: "Discover" },
  { to: "/my-groups", label: "My groups" },
  { to: "/quotations", label: "Quotations" },
];
const ADMIN: NavLink[] = [
  { to: "/admin", label: "Overview" },
  { to: "/admin/groups", label: "Groups" },
  { to: "/admin/quotes", label: "Quotes" },
  { to: "/admin/analytics", label: "Analytics" },
];

export function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [open, setOpen] = useState(false);
  const links = !isAuthenticated ? [] : isAdmin ? ADMIN : TRAVELLER;

  const signOut = () => {
    logout();
    navigate({ to: "/login", search: { redirect: undefined }, replace: true });
  };
  const isActive = (to: string) =>
    to === "/admin" ? pathname === "/admin" : pathname.startsWith(to);

  return (
    <header className="sticky top-3 z-40 px-3">
      <div className="glass mx-auto flex h-14 max-w-6xl items-center gap-3 rounded-2xl border px-3 shadow-lift sm:px-4">
        <Logo />
        <nav className="ml-6 hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <Link
              key={l.to}
              to={l.to}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground",
                isActive(l.to) && "bg-secondary text-foreground",
              )}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={toggle} aria-label="Toggle dark mode">
            {theme === "dark" ? <Sun /> : <Moon />}
          </Button>
          {isAuthenticated ? (
            <>
              <NotificationBell />
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" aria-label="Account" className="rounded-full">
                    <span className="grid size-8 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground">
                      <span aria-hidden>{user?.full_name.slice(0, 1)}</span>
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-xl">
                  <DropdownMenuLabel>
                    <div className="font-semibold">{user?.full_name}</div>
                    <div className="text-xs font-normal text-muted-foreground">
                      {user?.email} · {user?.role}
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="size-4" /> Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Sheet open={open} onOpenChange={setOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Menu">
                    <Menu />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-72">
                  <SheetTitle className="sr-only">Navigation</SheetTitle>
                  <nav className="mt-8 flex flex-col gap-1">
                    {links.map((l) => (
                      <Link
                        key={l.to}
                        to={l.to}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "rounded-xl px-4 py-3 font-medium",
                          isActive(l.to) ? "bg-secondary" : "hover:bg-muted",
                        )}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </nav>
                </SheetContent>
              </Sheet>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden sm:inline-flex">
                <Link to="/login" search={{ redirect: undefined }}>
                  <UserIcon /> Sign in
                </Link>
              </Button>
              <Button variant="coral" asChild>
                <Link to="/register">Get started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
