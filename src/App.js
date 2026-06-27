import { Analytics } from '@vercel/analytics/react';
import { BrowserRouter, Navigate, Route, Routes, useParams } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import { TimezoneProvider } from './context/TimezoneContext';
import { useVisitTracker } from './hooks/useVisitTracker';
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import PointsTablesPage from './pages/PointsTablesPage';
import GroupPage from './pages/GroupPage';
import GroupsLayout from './pages/GroupsLayout';
import GroupsPage from './pages/GroupsPage';
import KnockoutPage from './pages/KnockoutPage';
import ThirdPlaceRulesPage from './pages/ThirdPlaceRulesPage';
import TeamPage from './pages/TeamPage';
import PlayerPage from './pages/PlayerPage';

function GroupFixturesRedirect() {
  const { groupId } = useParams();
  return <Navigate to={`/groups/${groupId}`} replace />;
}

function AppRoutes() {
  useVisitTracker();

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="knockout" element={<KnockoutPage />} />
          <Route path="fixtures" element={<FixturesPage />} />
          <Route path="groups">
            <Route element={<GroupsLayout />}>
              <Route index element={<GroupsPage />} />
              <Route path="tables" element={<PointsTablesPage />} />
            </Route>
            <Route path=":groupId" element={<GroupPage />} />
            <Route path=":groupId/fixtures/*" element={<GroupFixturesRedirect />} />
          </Route>
          <Route path="tables" element={<Navigate to="/groups/tables" replace />} />
          <Route
            path="knockout/third-place-rules"
            element={<ThirdPlaceRulesPage />}
          />
          <Route path="teams/:flagCode" element={<TeamPage />} />
          <Route path="players/:playerId" element={<PlayerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

function App() {
  return (
    <TimezoneProvider>
      <SettingsProvider>
        <AppRoutes />
        <Analytics />
      </SettingsProvider>
    </TimezoneProvider>
  );
}

export default App;
