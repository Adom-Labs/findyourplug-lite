"use client";

import React, { useMemo, useCallback } from "react";
import { Logo } from "@/app/components/Logo";
import { Button, Icon } from "@/app/components/DemoComponents";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";
import { useAccount } from "wagmi";
import { useWalletDialog } from "@/app/components/layout/WalletProvider";
import { WalletIcon } from "@/app/components/home/_components/icons";

interface MobileHeaderProps {
  saveFrameButton?: React.ReactNode;
  className?: string;
}

export function MobileHeader({ saveFrameButton, className = "" }: MobileHeaderProps) {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const addFrame = useAddFrame();
  const { isConnected, address } = useAccount();
  const { openWalletDialog } = useWalletDialog();

  const [frameAdded, setFrameAdded] = React.useState(false);

  React.useEffect(() => {
    if (!isFrameReady) setFrameReady();
  }, [isFrameReady, setFrameReady]);

  const handleAddFrame = useCallback(async () => {
    const added = await addFrame();
    setFrameAdded(Boolean(added));
  }, [addFrame]);

  const defaultSaveFrameButton = useMemo(() => {
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
        <div className="flex items-center space-x-1 text-sm font-medium text-green-700 animate-fade-out">
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  const connectWalletButton = !isConnected ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => {
        try { openWalletDialog(); } catch { /* no-op if unavailable */ }
      }}
      className="text-[var(--app-accent)] px-3 py-2"
      icon={<WalletIcon className="w-4 h-4" />}
    >
      Connect
    </Button>
  ) : null;

  const addressBadge = isConnected && address ? (
    <div className="px-2 py-1 rounded-md bg-[var(--ock-bg-alternate)] text-[var(--ock-text-foreground)] text-xs font-medium">
      {address.slice(0, 6)}…{address.slice(-4)}
    </div>
  ) : null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-safe">
      <div className={`max-w-md mx-auto h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-3">
          <Logo className="block" />
        </div>
        <div className="flex items-center space-x-2">
          {addressBadge}
          {connectWalletButton}
          {saveFrameButton ?? defaultSaveFrameButton}
        </div>
      </div>
    </div>
  );
}

export default MobileHeader;


