import { useMemo } from "react";
import { useConnection, useAnchorWallet } from "@solana/wallet-adapter-react";
import { AnchorProvider, Program, type Idl } from "@coral-xyz/anchor";
import idl from "./idl.json";

// Returns a ready-to-use Program bound to the connected Phantom wallet, or
// null until a wallet is connected (guarded pages already redirect if not).
export function useProgram(): Program | null {
  const { connection } = useConnection();
  const wallet = useAnchorWallet();

  return useMemo(() => {
    if (!wallet) return null;
    const provider = new AnchorProvider(connection, wallet, { commitment: "confirmed" });
    return new Program(idl as Idl, provider);
  }, [connection, wallet]);
}