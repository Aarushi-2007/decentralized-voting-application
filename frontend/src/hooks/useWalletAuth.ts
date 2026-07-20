import { useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { signAuthPayload, type SignedAuthPayload } from "../utils/walletAuth";

// sign("create_community") -> pops Phantom's signature prompt, resolves with
// the {wallet, message, signature} triple to send to the backend.
export function useWalletAuth() {
  const { publicKey, signMessage } = useWallet();

  const sign = useCallback(
    async (action: string): Promise<SignedAuthPayload> => {
      if (!publicKey) throw new Error("Wallet not connected.");
      if (!signMessage) throw new Error("This wallet doesn't support message signing.");
      return signAuthPayload(publicKey, action, signMessage);
    },
    [publicKey, signMessage]
  );

  return { sign };
}