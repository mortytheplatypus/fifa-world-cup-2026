import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import { SettingsProvider } from './context/SettingsContext';
import { TimezoneProvider } from './context/TimezoneContext';
import HomePage from './pages/HomePage';
import FixturesPage from './pages/FixturesPage';
import PointsTablesPage from './pages/PointsTablesPage';
import GroupFixturesPage from './pages/GroupFixturesPage';
import GroupPage from './pages/GroupPage';
import GroupsPage from './pages/GroupsPage';

function App() {
  return (
    <TimezoneProvider>
      <SettingsProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              <Route index element={<HomePage />} />
              <Route path="groups" element={<GroupsPage />} />
              <Route path="fixtures" element={<FixturesPage />} />
              <Route path="points" element={<PointsTablesPage />} />
              <Route path="groups/:groupId" element={<GroupPage />} />
              <Route
                path="groups/:groupId/fixtures"
                element={<Navigate to="upcoming" replace />}
              />
              <Route
                path="groups/:groupId/fixtures/:view"
                element={<GroupFixturesPage />}
              />
            </Route>
          </Routes>
        </BrowserRouter>
      </SettingsProvider>
    </TimezoneProvider>
  );
}

export default App;
