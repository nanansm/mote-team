"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LogOut, Plus, Search, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MobileNav } from "@/components/mobile-nav";
import { OnlinePresence } from "@/components/online-presence";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserAvatar } from "@/components/user-avatar";
import { signOut } from "@/lib/auth-client";
import { navItems } from "./nav-items";

type TopBarUser = {
  id: string;
  name: string;
  email: string;
  image?: string | null;
};

function pageTitle(pathname: string): string {
  const match = navItems.find(
    (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
  );
  return match?.label ?? "Mote Team";
}

export function TopBar({
  user,
  isAdmin,
}: {
  user: TopBarUser;
  isAdmin: boolean;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleSignOut() {
    await signOut();
    router.push("/sign-in");
    router.refresh();
  }

  return (
    <header className="sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b bg-background/80 px-4 backdrop-blur-md md:px-6">
      <div className="flex items-center gap-2">
        <MobileNav isAdmin={isAdmin} />
        <h1 className="text-base font-semibold">{pageTitle(pathname)}</h1>
      </div>

      <div className="flex items-center gap-1.5">
        <OnlinePresence currentUserId={user.id} />
        <Button
          variant="ghost"
          size="icon"
          aria-label="Cari (⌘K)"
          title="Cari (⌘K)"
          onClick={() => window.dispatchEvent(new Event("mote:command"))}
        >
          <Search className="size-5" />
        </Button>
        <Button
          size="icon"
          aria-label="Task baru"
          onClick={() => router.push("/tasks?new=1")}
        >
          <Plus className="size-4" />
        </Button>

        <ThemeToggle />

      <DropdownMenu>
        <DropdownMenuTrigger
          render={<Button variant="ghost" className="gap-2 px-1.5" />}
        >
          <UserAvatar name={user.name} src={user.image} className="size-7 text-xs" />
          <span className="hidden text-sm font-medium sm:inline">
            {user.name}
          </span>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex flex-col">
              <span className="font-medium">{user.name}</span>
              <span className="text-xs font-normal text-muted-foreground">
                {user.email}
              </span>
            </DropdownMenuLabel>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem render={<Link href="/profile" />}>
            <User className="size-4" />
            Profil saya
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut} variant="destructive">
            <LogOut className="size-4" />
            Keluar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      </div>
    </header>
  );
}
