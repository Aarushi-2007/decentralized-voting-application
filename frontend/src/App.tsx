import { type FC } from "react";
import { Routes, Route } from "react-router-dom";
import { Landing } from "./pages/Landing";
import { Dashboard } from "./pages/Dashboard";
import { CommunityDetail } from "./pages/CommunityDetail";
import { JoinByLink } from "./pages/JoinByLink";

const App: FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/community/:communityId" element={<CommunityDetail />} />
      <Route path="/join/:inviteCode" element={<JoinByLink />} />
    </Routes>
  );
};

export default App;