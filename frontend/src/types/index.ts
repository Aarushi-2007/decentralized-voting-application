export interface Community {
  _id: string;
  name: string;
  description: string;
  createdBy: string; // wallet pubkey (base58) of the creator
  members: string[];
  invite_code: string; // opaque code issued by the backend
  proposals: string[]; // on-chain Proposal account addresses
  createdAt: number;
}