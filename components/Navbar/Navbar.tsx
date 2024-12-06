"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList } from "@/components/ui/navigation-menu";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "../ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";

export default function Navbar() {
  const router = useRouter();

  return (
    <div>
      <NavigationMenu className="pt-4 flex m-auto w-[90%] h-[3.5rem]">
        <NavigationMenuList className="flex gap-[40rem] lg:gap-[30rem]">
          <NavigationMenuItem onClick={() => router.push("/")} className="cursor-pointer">
            <Image src="/logo.svg" alt="logo" width={100} height={100} />
          </NavigationMenuItem>

          <div className="flex gap-8">
            <NavigationMenuItem className="cursor-pointer flex" onClick={() => router.push("/intent")}>
              <h3 className="text-sm text-zinc-500 hover:text-black font-medium">Maia AI</h3>
            </NavigationMenuItem>
            <NavigationMenuItem className="cursor-pointer" onClick={() => router.push("/payments")}>
              <h3 className="text-sm text-zinc-500 hover:text-black font-medium">Payments</h3>
            </NavigationMenuItem>

            <NavigationMenuItem className="cursor-pointer" onClick={() => router.push("/requests")}>
              <h3 className="text-sm text-zinc-500 hover:text-black font-medium">Requests</h3>
            </NavigationMenuItem>

            <NavigationMenuItem className="cursor-pointer" onClick={() => router.push("/invoice")}>
              <h3 className="text-sm text-zinc-500 hover:text-black font-medium">Invoice</h3>
            </NavigationMenuItem>
          </div>
          <NavigationMenuItem>
            <ConnectButton.Custom>
              {({ account, chain, openAccountModal, openConnectModal, authenticationStatus, mounted }) => {
                const ready = mounted && authenticationStatus !== "loading";
                const connected = ready && account && chain && (!authenticationStatus || authenticationStatus === "authenticated");

                return (
                  <div
                    {...(!ready && {
                      "aria-hidden": true,
                      style: {
                        opacity: 0,
                        pointerEvents: "none",
                        userSelect: "none",
                      },
                    })}
                  >
                    {(() => {
                      if (!connected) {
                        return <Button onClick={openConnectModal}>Sign In</Button>;
                      }

                      return (
                        <div style={{ display: "flex", gap: 12 }}>
                          <Button onClick={openAccountModal} type="button">
                            {account.displayName}
                          </Button>
                        </div>
                      );
                    })()}
                  </div>
                );
              }}
            </ConnectButton.Custom>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </div>
  );
}

const ListItem = React.forwardRef<React.ElementRef<"a">, React.ComponentPropsWithoutRef<"a">>(({ className, title, children, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">{children}</p>
        </a>
      </NavigationMenuLink>
    </li>
  );
});
ListItem.displayName = "ListItem";
