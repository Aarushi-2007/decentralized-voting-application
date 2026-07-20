// Builds the message a wallet signs to prove ownership to the backend, and
// packages it with the signature for the API layer to send along.
import { PublicKey } from "@solana/web3.js";
import bs58 from "bs58";

export interface SignedAuthPayload {
  wallet: string;
  message: string;
  signature: string; // base58-encoded
}

type SignMessageFn = (message: Uint8Array) => Promise<Uint8Array>;

export async function signAuthPayload(
  walletPubkey: PublicKey,
  action: string,
  signMessage: SignMessageFn
): Promise<SignedAuthPayload> {
  const nonceBytes = crypto.getRandomValues(new Uint8Array(16));
  const nonce = Array.from(nonceBytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  const timestamp = new Date().toISOString();

  // Keep this exact format in sync with whatever your backend parses/verifies.
  const message = [
    "Vota wants you to verify this wallet.",
    "",
    `Action: ${action}`,
    `Wallet: ${walletPubkey.toBase58()}`,
    `Timestamp: ${timestamp}`,
    `Nonce: ${nonce}`,
  ].join("\n");

  const signatureBytes = await signMessage(new TextEncoder().encode(message));

  return {
    wallet: walletPubkey.toBase58(),
    message,
    signature: bs58.encode(signatureBytes),
  };
}