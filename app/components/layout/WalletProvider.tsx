"use client";

import React from "react";
import { useAccount } from "wagmi";
import ConnectWalletDialog from "@/app/components/layout/ConnectWalletDialog";

interface WalletDialogContextValue {
  showConnectWallet: boolean;
  openWalletDialog: () => void;
  closeWalletDialog: () => void;
}

const WalletDialogContext = React.createContext<WalletDialogContextValue | undefined>(undefined);

export function WalletDialogProvider({ children }: { children: React.ReactNode }) {
  const [showConnectWallet, setShowConnectWallet] = React.useState(false);
  const { isConnected } = useAccount();

  const openWalletDialog = React.useCallback(() => setShowConnectWallet(true), []);
  const closeWalletDialog = React.useCallback(() => setShowConnectWallet(false), []);

  React.useEffect(() => {
    if (isConnected && showConnectWallet) setShowConnectWallet(false);
  }, [isConnected, showConnectWallet]);

  const value = React.useMemo(
    () => ({ showConnectWallet, openWalletDialog, closeWalletDialog }),
    [showConnectWallet, openWalletDialog, closeWalletDialog]
  );

  return (
    <WalletDialogContext.Provider value={value}>
      {children}
      <ConnectWalletDialog isOpen={showConnectWallet} onClose={closeWalletDialog} />
    </WalletDialogContext.Provider>
  );
}

export function useWalletDialog(): WalletDialogContextValue {
  const ctx = React.useContext(WalletDialogContext);
  if (!ctx) throw new Error("useWalletDialog must be used within WalletDialogProvider");
  return ctx;
}


