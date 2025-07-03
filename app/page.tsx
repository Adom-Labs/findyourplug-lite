"use client";

import {
  useMiniKit,
  useAddFrame,
  useOpenUrl,
} from "@coinbase/onchainkit/minikit";
import {
  Name,
  Identity,
  Address,
  Avatar,
  EthBalance,
} from "@coinbase/onchainkit/identity";
import {
  ConnectWallet,
  Wallet,
  WalletDropdown,
  WalletDropdownDisconnect,
} from "@coinbase/onchainkit/wallet";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "./components/DemoComponents";
import { Icon } from "./components/DemoComponents";
import Home from "./components/home";
import { Features } from "./components/DemoComponents";
import WishlistPage from "./wishlist/page";

export default function App() {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const [frameAdded, setFrameAdded] = useState(false);
  const [activeTab, setActiveTab] = useState("home");

  const addFrame = useAddFrame();
  const openUrl = useOpenUrl();

  console.table([
    {
      isFrameReady,
      context,
      frameAdded,
    },
  ]);

  useEffect(() => {
    if (!isFrameReady) {
      setFrameReady();
    }
  }, [setFrameReady, isFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const frameAdded = await addFrame();
    setFrameAdded(Boolean(frameAdded));
  }, [addFrame]);

  const saveFrameButton = useMemo(() => {
    if (context && !context.client.added) {
      return (
        <Button
          variant="ghost"
          size="sm"
          onClick={handleAddFrame}
          className="text-[var(--app-accent)] p-4"
          icon={<Icon name="plus" size="sm" />}
        >
          Save Frame
        </Button>
      );
    }

    if (frameAdded) {
      return (
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="flex flex-col min-h-screen font-sans text-[var(--app-foreground)] mini-app-theme from-[var(--app-background)] to-[var(--app-gray)]">
      <div className="w-full max-w-md mx-auto px-4 py-3">
        <header className="flex justify-between items-center mb-3 h-11">
          <div>
            <div className="flex items-center space-x-2">
              <Wallet className="z-10">
                <ConnectWallet>
                  <Name className="text-inherit" />
                </ConnectWallet>
                <WalletDropdown>
                  <Identity className="px-4 pt-3 pb-2" hasCopyAddressOnClick>
                    <Avatar />
                    <Name />
                    <Address />
                    <EthBalance />
                  </Identity>
                  <WalletDropdownDisconnect />
                </WalletDropdown>
              </Wallet>
            </div>
          </div>
          <div>{saveFrameButton}</div>
        </header>

        <main className="flex-1">
          {activeTab === "home" && <Home />}
          {activeTab === "wishlist" && <WishlistPage />}
          {activeTab === "features" && <Features setActiveTab={setActiveTab} />}
        </main>

        {/* Bottom Navigation */}
        <nav className="mt-4 pt-2 border-t border-[var(--ock-border)]">
          <div className="flex justify-center space-x-8">
            <button
              onClick={() => setActiveTab("home")}
              className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${activeTab === "home"
                ? "text-[var(--ock-accent)] bg-[var(--ock-bg-alternate)]"
                : "text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]"
                }`}
            >
              <Icon name="star" size="sm" />
              <span className="text-xs font-medium">Home</span>
            </button>

            <button
              onClick={() => setActiveTab("wishlist")}
              className={`flex flex-col items-center space-y-1 py-2 px-4 rounded-lg transition-colors ${activeTab === "wishlist"
                ? "text-[var(--ock-accent)] bg-[var(--ock-bg-alternate)]"
                : "text-[var(--ock-text-foreground-muted)] hover:text-[var(--ock-text-foreground)]"
                }`}
            >
              <Icon name="heart" size="sm" />
              <span className="text-xs font-medium">Wishlist</span>
            </button>
          </div>
        </nav>

        <footer className="mt-2 pt-4 flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            className="text-[var(--ock-text-foreground-muted)] text-xs"
            onClick={() => openUrl("https://base.org/builders/minikit")}
          >
            Built on Base with MiniKit
          </Button>
        </footer>
      </div>
    </div>
  );
}
