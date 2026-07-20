export interface Community {
  id: string;
  name: string;
  description: string;
  createdBy: string; // wallet pubkey (base58) of the creator
  memberWallets: string[];
  inviteCode: string; // opaque code issued by the backend
  proposalAddresses: string[]; // on-chain Proposal account addresses
  createdAt: number;
}