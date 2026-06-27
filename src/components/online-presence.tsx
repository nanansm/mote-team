"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { UserAvatar } from "@/components/user-avatar";
import { useRealtime } from "@/components/realtime-provider";

const MAX_SHOWN = 4;

export function OnlinePresence({ currentUserId }: { currentUserId: string }) {
  const { online } = useRealtime();
  if (online.length === 0) return null;

  const shown = online.slice(0, MAX_SHOWN);
  const extra = online.length - shown.length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center rounded-full p-0.5 hover:bg-accent"
        aria-label={`${online.length} online`}
      >
        <span className="flex -space-x-2">
          {shown.map((u) => (
            <span key={u.userId} className="relative">
              <UserAvatar
                name={u.name}
                src={u.image}
                className="size-7 text-[10px] ring-2 ring-background"
              />
              <span className="absolute -right-0 bottom-0 size-2 rounded-full bg-emerald-500 ring-2 ring-background" />
            </span>
          ))}
          {extra > 0 && (
            <span className="grid size-7 place-items-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground ring-2 ring-background">
              +{extra}
            </span>
          )}
        </span>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuGroup>
          <DropdownMenuLabel>Online ({online.length})</DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        {online.map((u) => (
          <DropdownMenuItem key={u.userId} className="gap-2">
            <span className="relative">
              <UserAvatar name={u.name} src={u.image} className="size-6 text-[10px]" />
              <span className="absolute -right-0 bottom-0 size-1.5 rounded-full bg-emerald-500 ring-2 ring-popover" />
            </span>
            <span className="truncate">
              {u.name}
              {u.userId === currentUserId && (
                <span className="text-muted-foreground"> (kamu)</span>
              )}
            </span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
