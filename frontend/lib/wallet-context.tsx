"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import {
  connectWallet as stellarConnectWallet,
  getPublicKey,
  getNativeBalance,
} from "@/lib/stellar";
import { toXlm } from "@/lib/format";

interface WalletContextType {
  wallet: string | null;
  connectWallet: () => Promise<void>;
  disconnectWallet: () => void;
}

type WalletDisplayMode = "short" | "full";

const WalletContext = createContext<WalletContextType>({
  wallet: null,
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  connectWallet: async () => {},
  // eslint-disable-next-line @typescript-eslint/no-empty-function
  disconnectWallet: () => {},
});

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<string | null>(null);
  const connectPromiseRef = useRef<Promise<string> | null>(null);

  useEffect(() => {
    getPublicKey().then((key) => {
      if (key) setWallet(key);
    });
  }, []);

  const connectWallet = useCallback(async () => {
    if (wallet) {
      return;
    }

    if (!connectPromiseRef.current) {
      connectPromiseRef.current = stellarConnectWallet().finally(() => {
        connectPromiseRef.current = null;
      });
    }

    const key = await connectPromiseRef.current;
    setWallet(key);
  }, [wallet]);

  const disconnectWallet = useCallback(() => {
    setWallet(null);
  }, []);

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, disconnectWallet }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  return useContext(WalletContext);
}

export function WalletButton() {
  const { wallet, connectWallet, disconnectWallet } = useWallet();
  const [connecting, setConnecting] = useState(false);
  const [displayMode, setDisplayMode] = useState<WalletDisplayMode>("short");
  const [balance, setBalance] = useState<string | null>(null);
  const [fetchingBalance, setFetchingBalance] = useState(false);

  const fetchBalance = useCallback(async () => {
    if (!wallet) return;
    setFetchingBalance(true);
    try {
      const bal = await getNativeBalance(wallet);
      setBalance(toXlm(bal));
    } catch {
      setBalance("0.00");
    } finally {
      setFetchingBalance(false);
    }
  }, [wallet]);

  useEffect(() => {
    const stored = sessionStorage.getItem("wallet-display-mode");
    if (stored === "short" || stored === "full") {
      setDisplayMode(stored);
    }
  }, []);

  useEffect(() => {
    if (!wallet) {
      setDisplayMode("short");
      setBalance(null);
    } else {
      fetchBalance();
    }
  }, [wallet, fetchBalance]);

  const toggleDisplayMode = useCallback(() => {
    setDisplayMode((current) => {
      const next: WalletDisplayMode = current === "short" ? "full" : "short";
      sessionStorage.setItem("wallet-display-mode", next);
      return next;
    });
  }, []);

  if (wallet) {
    const visibleAddress =
      displayMode === "full" ? wallet : `${wallet.slice(0, 6)}...${wallet.slice(-4)}`;

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-2 rounded-md bg-slate-100 px-3 py-1.5 text-xs text-slate-700">
          {fetchingBalance ? (
            <span className="h-4 w-12 animate-pulse rounded bg-slate-200" />
          ) : (
            <span className="font-semibold">{balance} XLM</span>
          )}
          <button
            onClick={fetchBalance}
            className="text-slate-400 hover:text-slate-600 focus:outline-none"
            aria-label="Refresh balance"
            disabled={fetchingBalance}
          >
            <svg className={`h-3 w-3 ${fetchingBalance ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
          <span className="text-slate-300">|</span>
          <span className="font-mono">{visibleAddress}</span>
        </div>
        <button
          type="button"
          onClick={toggleDisplayMode}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
          aria-label={
            displayMode === "short"
              ? "Show full wallet address"
              : "Show shortened wallet address"
          }
        >
          {displayMode === "short" ? "Show full" : "Show short"}
        </button>
        <button
          type="button"
          onClick={disconnectWallet}
          className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-50"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={async () => {
        setConnecting(true);
        try {
          await connectWallet();
        } catch {
          /* user cancelled or Freighter unavailable */
        } finally {
          setConnecting(false);
        }
      }}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60"
      disabled={connecting}
      aria-busy={connecting}
    >
      {connecting ? "Connecting..." : "Connect Wallet"}
    </button>
  );
}
