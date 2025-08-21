"use client";

import React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Icon } from "@/app/components/DemoComponents";
import { ShoppingCartIcon } from "@/app/components/home/_components/icons";
import { useCart } from "@/app/components/home/_components/cart-hooks";

export default function MobileNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { cartItems } = useCart();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname?.startsWith(href);
  };

  const go = (href: string) => () => router.push(href);

  return (
    <div className="fixed bottom-0 inset-x-0 z-50 pb-safe">
      <nav className="max-w-md mx-auto h-16 bg-white/95 backdrop-blur-md border-t border-gray-200">
        <div className="h-full flex items-center justify-center space-x-8">
          <button
            onClick={go("/")}
            aria-label="Home"
            role="tab"
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
              isActive("/")
                ? "text-[var(--ock-accent)] bg-[var(--ock-bg-alternate)]"
                : "text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]"
            }`}
          >
            <Icon name="star" size="sm" />
            <span className="text-xs font-medium">Home</span>
          </button>
          <button
            onClick={go("/wishlist")}
            aria-label="Wishlist"
            role="tab"
            className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
              isActive("/wishlist")
                ? "text-[var(--ock-accent)] bg-[var(--ock-bg-alternate)]"
                : "text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]"
            }`}
          >
            <Icon name="heart" size="sm" />
            <span className="text-xs font-medium">Wishlist</span>
          </button>
          <button
            onClick={go("/cart")}
            aria-label="Cart"
            role="tab"
            className={`relative flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${
              isActive("/cart")
                ? "text-[var(--ock-accent)] bg-[var(--ock-bg-alternate)]"
                : "text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]"
            }`}
          >
            <ShoppingCartIcon />
            {cartItems.length > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--ock-accent)] text-white text-[10px] leading-[18px] text-center">
                {cartItems.reduce((sum, i) => sum + i.quantity, 0)}
              </span>
            )}
            <span className="text-xs font-medium">Cart</span>
          </button>
        </div>
      </nav>
    </div>
  );
}


