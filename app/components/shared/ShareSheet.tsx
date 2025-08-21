"use client";

import { useEffect, useState } from "react";

type PrimaryKind = "gift" | "copyLink";

export interface ShareSheetProps {
  isOpen: boolean;
  onClose: () => void;
  // Choose the primary action and labels
  primary: { kind: PrimaryKind; label: string };
  secondary: { kind: "pay"; label: string };
  // Connection gating
  isConnected?: boolean;
  onRequireConnect?: () => void;
  // Actions
  onGiftSubmit?: (email: string, note?: string) => Promise<void> | void;
  onCreateCopyLink?: () => Promise<string>;
  onCreatePayLink?: (note?: string) => Promise<string>;
  // Optional selectable list (e.g., wishlist products)
  selectableItems?: Array<{ id: number; label: string; checked: boolean }>;
  onToggleItem?: (id: number, checked: boolean) => void;
  // Summary
  summary?: { items: number; total?: number };
  // Notes
  copyNote?: string;
  payNote?: string;
}

export function ShareSheet(props: ShareSheetProps) {
  const {
    isOpen,
    onClose,
    primary,
    secondary,
    isConnected,
    onRequireConnect,
    onGiftSubmit,
    onCreateCopyLink,
    onCreatePayLink,
    selectableItems,
    onToggleItem,
    summary,
    copyNote,
  } = props;

  const [mode, setMode] = useState<"menu" | "gift" | "payForm" | "linkProgress" | "linkReady">("menu");
  const [friendEmail, setFriendEmail] = useState("");
  const [link, setLink] = useState("");
  const [note, setNote] = useState<string | undefined>(undefined);
  const [payNoteState, setPayNoteState] = useState<string | undefined>(undefined);

  
  // Reset internal state whenever the sheet closes or opens fresh
  useEffect(() => {
    if (!isOpen) {
      setMode("menu");
      setFriendEmail("");
      setLink("");
      setNote(undefined);
      setPayNoteState(undefined);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const startCopyFlow = async () => {
    setMode("linkProgress");
    setNote(copyNote);
    try {
      const created = (await onCreateCopyLink?.()) || "";
      if (!created) {
        try { const { toast } = await import('sonner'); toast.error('Failed to create link'); } catch {}
        setMode("menu");
        return;
      }
      setLink(created);
      setMode("linkReady");
    } catch {
      try { const { toast } = await import('sonner'); toast.error('Failed to create link'); } catch {}
      setLink("");
      setMode("menu");
    }
  };

  const startPayFlow = async () => {
    setMode("linkProgress");
    setNote(payNoteState);
    try {
      const created = (await onCreatePayLink?.(payNoteState)) || "";
      if (!created) {
        try { const { toast } = await import('sonner'); toast.error('Failed to create link'); } catch {}
        setMode("menu");
        return;
      }
      setLink(created);
      setMode("linkReady");
    } catch {
      try { const { toast } = await import('sonner'); toast.error('Failed to create link'); } catch {}
      setLink("");
      setMode("menu");
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9991] flex items-end justify-center bg-black/40"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-md bg-[var(--ock-bg-default)] rounded-t-2xl p-4 space-y-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-1 w-12 bg-[var(--ock-border)] rounded mx-auto" />

        {mode === "menu" && (
          <>
            <h3 className="text-lg font-semibold text-[var(--ock-text-foreground)] text-center">Share</h3>
            {Array.isArray(selectableItems) && selectableItems.length > 0 && (
              <div className="space-y-2 max-h-56 overflow-y-auto border border-[var(--ock-border)] rounded-md p-2">
                <div className="text-xs font-medium text-[var(--ock-text-foreground-muted)] px-1">Select items (optional)</div>
                {selectableItems.map((it) => (
                  <label key={it.id} className="flex items-center space-x-3 p-2 rounded hover:bg-[var(--ock-bg-alternate)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={it.checked}
                      onChange={(e) => onToggleItem?.(it.id, e.target.checked)}
                    />
                    <span className="flex-1 text-sm text-[var(--ock-text-foreground)] truncate">{it.label}</span>
                  </label>
                ))}
              </div>
            )}
            <div className="space-y-2">
              <button
                className="w-full py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)]"
                onClick={() => {
                  if (primary.kind === "gift") {
                    if (isConnected === false) {
                      onRequireConnect?.();
                      return;
                    }
                    setMode("gift");
                  } else {
                    void startCopyFlow();
                  }
                }}
              >
                {primary.label}
              </button>
              <button
                className="w-full py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)]"
                onClick={() => {
                  if (isConnected === false) {
                    onRequireConnect?.();
                    return;
                  }
                  setMode("payForm");
                }}
              >
                {secondary.label}
              </button>
            </div>
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-[var(--ock-accent)] text-[var(--ock-bg-default)]">Close</button>
          </>
        )}

        {mode === "gift" && (
          <>
            <h3 className="text-lg font-semibold text-[var(--ock-text-foreground)] text-center">Gift a Friend</h3>
            <p className="text-sm text-[var(--ock-text-foreground-muted)]">
              Gift a friend allows you to pay for this and send your friend a link to complete checkout and receive the items.
            </p>
            <div className="space-y-2">
              <label className="block text-sm text-[var(--ock-text-foreground)]">Friend&apos;s Email</label>
              <input
                type="email"
                value={friendEmail}
                onChange={(e) => setFriendEmail(e.target.value)}
                placeholder="friend@example.com"
                className="w-full rounded-md border border-[var(--ock-border)] px-3 py-2 bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)]"
              />
              <label className="block text-sm text-[var(--ock-text-foreground)]">Note (optional)</label>
              <textarea
                value={note || ""}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a message for your friend"
                className="w-full rounded-md border border-[var(--ock-border)] px-3 py-2 bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)]"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("menu")}
                className="py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const valid = /[^\s@]+@[^\s@]+\.[^\s@]+/.test(friendEmail);
                  if (!valid) {
                    try { const { toast } = await import('sonner'); toast.error('Please enter a valid email'); } catch {}
                    return;
                  }
                  try {
                    await onGiftSubmit?.(friendEmail, note);
                    onClose();
                  } catch {
                    try { const { toast } = await import('sonner'); toast.error('Failed to process gift'); } catch {}
                  }
                }}
                className="py-3 rounded-lg bg-green-600 text-white"
              >
                Pay now
              </button>
            </div>
          </>
        )}

        {mode === "payForm" && (
          <>
            <h3 className="text-lg font-semibold text-[var(--ock-text-foreground)] text-center">Pay for Me</h3>
            <div className="space-y-2">
              <label className="block text-sm text-[var(--ock-text-foreground)]">Note (optional)</label>
              <textarea
                value={payNoteState || ""}
                onChange={(e) => setPayNoteState(e.target.value)}
                placeholder="Add a note for friends"
                className="w-full rounded-md border border-[var(--ock-border)] px-3 py-2 bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)]"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setMode("menu")}
                className="py-3 rounded-lg border border-[var(--ock-border)] text-[var(--ock-text-foreground)]"
              >
                Cancel
              </button>
              <button
                onClick={() => void startPayFlow()}
                className="py-3 rounded-lg bg-[var(--ock-accent)] text-[var(--ock-bg-default)]"
              >
                Create link
              </button>
            </div>
          </>
        )}

        {mode === "linkProgress" && (
          <div className="space-y-2 text-center">
            <div className="mx-auto w-8 h-8 rounded-full border-2 border-[var(--ock-border)] border-t-[var(--ock-accent)] animate-spin" />
            <p className="text-sm text-[var(--ock-text-foreground-muted)]">Creating link...</p>
          </div>
        )}

        {mode === "linkReady" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <div className="text-sm text-[var(--ock-text-foreground-muted)]">Link</div>
              <div className="flex items-center space-x-2">
                <input readOnly value={link} className="flex-1 px-3 py-2 rounded-md border border-[var(--ock-border)] bg-[var(--ock-bg-default)] text-[var(--ock-text-foreground)]" />
                <button
                  onClick={() => navigator.clipboard.writeText(link)}
                  className="px-3 py-2 rounded-md border border-[var(--ock-border)]"
                >
                  Copy link
                </button>
              </div>
            </div>
            {summary && (
              <div className="space-y-1">
                <div className="text-sm text-[var(--ock-text-foreground-muted)]">Summary</div>
                <div className="text-sm text-[var(--ock-text-foreground)]">
                  Items: {summary.items}
                  {typeof summary.total === "number" ? ` · Total: $${summary.total.toFixed(2)}` : ""}
                </div>
              </div>
            )}
            {note && (
              <p className="text-xs text-[var(--ock-text-foreground-muted)]">{note}</p>
            )}
            <button onClick={onClose} className="w-full py-3 rounded-lg bg-[var(--ock-accent)] text-[var(--ock-bg-default)]">Close</button>
          </div>
        )}
      </div>
    </div>
  );
}


