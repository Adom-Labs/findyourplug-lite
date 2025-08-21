"use client";

import React, { useMemo, useCallback } from "react";
import { Logo } from "@/app/components/Logo";
import { Button, Icon } from "@/app/components/DemoComponents";
import { useMiniKit, useAddFrame } from "@coinbase/onchainkit/minikit";

interface MobileHeaderProps {
  saveFrameButton?: React.ReactNode;
  className?: string;
}

export function MobileHeader({ saveFrameButton, className = "" }: MobileHeaderProps) {
  const { setFrameReady, isFrameReady, context } = useMiniKit();
  const addFrame = useAddFrame();

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
        <div className="flex items-center space-x-1 text-sm font-medium text-[#0052FF] animate-fade-out">
          <Icon name="check" size="sm" className="text-[#0052FF]" />
          <span>Saved</span>
        </div>
      );
    }

    return null;
  }, [context, frameAdded, handleAddFrame]);

  return (
    <div className="fixed top-0 inset-x-0 z-50 pt-safe">
      <div className={`max-w-md mx-auto h-14 bg-white/95 backdrop-blur-md border-b border-gray-200 px-4 flex items-center justify-between ${className}`}>
        <div className="flex items-center space-x-3">
          <Logo className="block" />
        </div>
        <div>{saveFrameButton ?? defaultSaveFrameButton}</div>
      </div>
    </div>
  );
}

export default MobileHeader;


