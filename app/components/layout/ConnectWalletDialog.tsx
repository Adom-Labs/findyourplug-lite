"use client";

import React from "react";
import { ConnectWallet } from "@coinbase/onchainkit/wallet";

interface ConnectWalletDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ConnectWalletDialog({ isOpen, onClose }: ConnectWalletDialogProps) {
  const dialogRef = React.useRef<HTMLDivElement | null>(null);
  const lastFocusedRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement;
      document.addEventListener("keydown", onKey);
      document.body.style.overflow = "hidden";
      setTimeout(() => dialogRef.current?.focus(), 0);
    } else {
      document.body.style.overflow = "";
      lastFocusedRef.current?.focus?.();
    }
    return () => document.removeEventListener("keydown", onKey);
  }, [isOpen, onClose]);

  const onBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
      aria-hidden={!isOpen}
    >
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onBackdrop}
      />
      <div className="fixed inset-0 flex items-center justify-center p-4" onClick={onBackdrop}>
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="connect-wallet-title"
          tabIndex={-1}
          ref={dialogRef}
          className={`bg-white rounded-xl shadow-xl max-w-sm w-full mx-auto transform transition-all duration-150 ${
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 id="connect-wallet-title" className="text-lg font-semibold text-[var(--ock-text-foreground)]">
                Connect Wallet
              </h2>
              <button
                aria-label="Close"
                onClick={onClose}
                className="w-8 h-8 inline-flex items-center justify-center rounded-md text-[var(--ock-text-foreground-muted)] hover:bg-[var(--ock-bg-alternate)]"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-[var(--ock-text-foreground-muted)]">
              Connect your wallet to save and manage your wishlist across devices.
            </p>
            <div className="pt-2">
              <ConnectWallet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}


