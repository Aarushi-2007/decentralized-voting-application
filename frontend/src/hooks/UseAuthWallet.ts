// Thin convenience hook: gives components the connected wallet's base58
// address (or null), plus a guard for "must be signed in" routes.
import { useWallet } from "@solana/wallet-adapter-react";
import { useMemo } from "react";

export function useAuthWallet() {
  const { publicKey, connected, connecting, disconnect } = useWallet();

  const address = useMemo(() => publicKey?.toBase58() ?? null, [publicKey]);

  return { address, connected, connecting, disconnect };
}