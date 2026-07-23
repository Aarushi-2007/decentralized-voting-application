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
    className="w-full text-left bg-white/[0.04] backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-soft hover:-translate-y-0.5 hover:bg-white/[0.07] hover:border-white/20 transition flex items-center justify-between"
  >
    <div className="min-w-0">
      <h3 className="font-display font-semibold text-white truncate">{community.name}</h3>
      {community.description && (
        <p className="text-sm text-slate-400 mt-1 line-clamp-1">{community.description}</p>
      )}
      <div className="flex items-center gap-1.5 mt-3 text-xs text-slate-500">
        <Users size={14} />
        {community.members.length} member
        {community.members.length !== 1 ? "s" : ""}
      </div>
    </div>
    <ChevronRight size={20} className="text-slate-500 shrink-0 ml-2" />
  </button>
);