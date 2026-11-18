'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { Briefcase, ChevronsUpDown, KanbanSquare, LayoutDashboard, LogOut, Monitor, Moon, Sun, UserRound } from 'lucide-react';
import { useTheme } from 'next-themes';
import { ThemeToggle } from '@/components/layout/theme-toggle';
import { clearToken } from '@/lib/auth';
import { ROUTES, STATUSES, stageGlow } from '@/lib/constants';
import { useApplications, useMe } from '@/hooks/use-api';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

const NAV = [
  { href: ROUTES.dashboard, label: 'Dashboard', icon: LayoutDashboard },
  { href: ROUTES.applications, label: 'Applications', icon: KanbanSquare },
  { href: ROUTES.profile, label: 'Profile', icon: UserRound },
];

const initials = (name?: string) =>
  (name ?? '?').split(' ').map((p) => p[0]).slice(0, 2).join('').toUpperCase();

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const qc = useQueryClient();
  const { data: me } = useMe();
  const { data: apps } = useApplications();
  const { theme, setTheme } = useTheme();

  const logout = () => {
    clearToken();
    qc.clear();
    router.replace(ROUTES.login);
  };

  const userMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger className="flex w-full items-center gap-3 rounded-lg p-2 text-left outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">{initials(me?.name)}</AvatarFallback>
        </Avatar>
        <span className="hidden min-w-0 flex-1 md:block">
          <span className="block truncate text-sm font-medium">{me?.name ?? ' '}</span>
          <span className="block truncate text-xs text-muted-foreground">{me?.email ?? ' '}</span>
        </span>
        <ChevronsUpDown className="hidden h-4 w-4 text-muted-foreground md:block" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" className="w-56">
        <DropdownMenuLabel className="truncate font-normal text-muted-foreground">{me?.email}</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={() => router.push(ROUTES.profile)}>
          <UserRound aria-hidden /> Profile & resume
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">Theme</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={theme} onValueChange={setTheme}>
          <DropdownMenuRadioItem value="light"><Sun aria-hidden size={16} />&nbsp;Light</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="dark"><Moon aria-hidden size={16} />&nbsp;Dark</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="system"><Monitor aria-hidden size={16} />&nbsp;Match device</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={logout}>
          <LogOut aria-hidden size={16} /> Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <aside className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur md:fixed md:inset-y-0 md:left-0 md:flex md:w-64 md:flex-col md:border-b-0 md:border-r md:bg-card/40">
      <div className="flex items-center gap-2 px-4 py-3 md:block md:px-4 md:py-5">
        <Link href={ROUTES.dashboard} className="flex items-center gap-2.5 rounded-md px-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground shadow-glow">
            <Briefcase className="h-4 w-4" aria-hidden />
          </span>
          <span className="hidden font-display text-lg font-bold sm:inline">JobTrackr</span>
        </Link>

        <nav className="ml-auto flex gap-1 md:ml-0 md:mt-8 md:flex-col" aria-label="Main">
          {NAV.map(({ href, label, icon: Icon }) => {
            const active = pathname.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'relative flex items-center gap-3 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  active ? 'bg-accent text-foreground' : 'text-muted-foreground hover:bg-accent/60 hover:text-foreground'
                )}
              >
                {active && <span className="absolute inset-y-2 left-0 hidden w-0.5 rounded-full bg-primary shadow-glow md:block" aria-hidden />}
                <Icon className="h-4 w-4" aria-hidden />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center md:hidden">
          <ThemeToggle />
          {userMenu}
        </div>
      </div>

      {/* Stage counts: a glanceable legend that doubles as a live summary. */}
      <div className="mt-6 hidden px-6 md:block">
        <p className="mb-3 text-xs font-medium text-muted-foreground">Pipeline</p>
        <ul className="space-y-2">
          {STATUSES.map((s) => (
            <li key={s.value} className="flex items-center justify-between text-sm">
              <span className="flex items-center gap-2.5 text-muted-foreground">
                <span className={`h-2 w-2 rounded-full ${s.color}`} style={{ boxShadow: stageGlow(s, 8) }} aria-hidden />
                {s.label}
              </span>
              <span className="tabular-nums">{apps?.filter((a) => a.status === s.value).length ?? '–'}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto hidden items-center gap-1 border-t p-3 md:flex">
        <div className="min-w-0 flex-1">{userMenu}</div>
        <ThemeToggle />
      </div>
    </aside>
  );
}
