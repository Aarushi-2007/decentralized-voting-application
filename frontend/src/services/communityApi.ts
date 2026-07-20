// Thin REST client for your community/invite-link backend. Mutating calls
// require a SignedAuthPayload (see useWalletAuth) — the backend should
// verify the signature against `wallet` before trusting the request.
import { type Community } from "../types";
import { type SignedAuthPayload } from "../utils/walletAuth";

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new Error(body?.error ?? `Request failed (${res.status})`);
  }
  return res.json();
}

// GET /api/communities?wallet=<pubkey> -> Community[]  (read-only, unauthenticated)
export function listCommunities(wallet: string): Promise<Community[]> {
  return request<Community[]>(`/api/communities?wallet=${encodeURIComponent(wallet)}`);
}

// POST /api/communities { name, description, wallet, message, signature } -> Community
export function createCommunity(name: string, description: string, auth: SignedAuthPayload): Promise<Community> {
  return request<Community>(`/api/communities`, {
    method: "POST",
    body: JSON.stringify({ name, description, ...auth }),
  });
}

// POST /api/communities/join { inviteCode, wallet, message, signature } -> Community
export function joinCommunity(inviteCode: string, auth: SignedAuthPayload): Promise<Community> {
  return request<Community>(`/api/communities/join`, {
    method: "POST",
    body: JSON.stringify({ inviteCode, ...auth }),
  });
}

// GET /api/communities/:id -> Community (read-only, unauthenticated)
export function getCommunity(id: string): Promise<Community> {
  return request<Community>(`/api/communities/${id}`);
}

// POST /api/communities/:id/proposals { proposalAddress, wallet, message, signature } -> Community
export function addProposalToCommunity(
  communityId: string,
  proposalAddress: string,
  auth: SignedAuthPayload
): Promise<Community> {
  return request<Community>(`/api/communities/${communityId}/proposals`, {
    method: "POST",
    body: JSON.stringify({ proposalAddress, ...auth }),
  });
}

// GET /api/communities/preview/:inviteCode -> { name, description } (read-only)
export function getCommunityPreview(inviteCode: string): Promise<{ name: string; description: string }> {
  return request(`/api/communities/preview/${encodeURIComponent(inviteCode)}`);
}

export function buildInviteLink(community: Community): string {
  return `${window.location.origin}/join/${community.inviteCode}`;
}