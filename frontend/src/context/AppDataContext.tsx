import { createContext, type FC, type ReactNode, useCallback, useContext, useState } from "react";
import { type Community } from "../types";
import { type SignedAuthPayload } from "../utils/walletAuth";
import * as api from "../services/communityApi";

interface AppDataContextValue {
  communities: Community[];
  loading: boolean;
  error: string | null;
  refresh: (wallet: string) => Promise<void>;
  createCommunity: (name: string, description: string, auth: SignedAuthPayload) => Promise<Community>;
  joinCommunity: (inviteCode: string, auth: SignedAuthPayload) => Promise<Community>;
  addProposalToCommunity: (
    communityId: string,
    proposalAddress: string,
    auth: SignedAuthPayload
  ) => Promise<Community>;
}

const AppDataContext = createContext<AppDataContextValue | null>(null);

export const AppDataProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (wallet: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getJoinedCommunities(wallet);
      setCommunities(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load communities.");
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommunity = useCallback(async (name: string, description: string, auth: SignedAuthPayload) => {
    const community = await api.createCommunity(name, description, auth);
    setCommunities((prev) => [...prev, community]);
    return community;
  }, []);

  const joinCommunity = useCallback(async (inviteCode: string, auth: SignedAuthPayload) => {
    const community = await api.joinCommunity(inviteCode, auth);
    setCommunities((prev) => {
      const exists = prev.some((c) => c._id === community._id);
      return exists ? prev.map((c) => (c._id === community._id ? community : c)) : [...prev, community];
    });
    return community;
  }, []);

  const addProposalToCommunity = useCallback(
    async (communityId: string, proposalAddress: string, auth: SignedAuthPayload) => {
      const community = await api.addProposalToCommunity(communityId, proposalAddress, auth);
      setCommunities((prev) => prev.map((c) => (c._id === communityId ? community : c)));
      return community;
    },
    []
  );

  return (
    <AppDataContext.Provider
      value={{ communities, loading, error, refresh, createCommunity, joinCommunity, addProposalToCommunity }}
    >
      {children}
    </AppDataContext.Provider>
  );
};

export function useAppData(): AppDataContextValue {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}