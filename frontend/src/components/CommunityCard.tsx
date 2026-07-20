import { type FC } from "react";
import { type Community } from "../types";
import { Users, ChevronRight } from "lucide-react";

interface Props {
  community: Community;
  onClick: () => void;
}

export const CommunityCard: FC<Props> = ({ community, onClick }) => (
  <button
    onClick={onClick}
    className="w-full text-left bg-white border border-black/5 rounded-2xl p-5 shadow-soft hover:-translate-y-0.5 hover:shadow-lg transition flex items-center justify-between"
  >
    <div>
      <h3 className="font-semibold text-brand-900">{community.name}</h3>
      {community.description && (
        <p className="text-sm text-slate-500 mt-1 line-clamp-1">{community.description}</p>
      )}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-400">
        <Users size={14} />
        {community.memberWallets.length} member
        {community.memberWallets.length !== 1 ? "s" : ""}
      </div>
    </div>
    <ChevronRight className="text-slate-300" />
  </button>
);