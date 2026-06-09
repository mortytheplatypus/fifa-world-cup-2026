import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import Layout from './components/Layout';
import GroupFixturesPage from './pages/GroupFixturesPage';
import GroupPage from './pages/GroupPage';
import GroupsPage from './pages/GroupsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Navigate to="/groups" replace />} />
          <Route path="groups" element={<GroupsPage />} />
          <Route path="groups/:groupId" element={<GroupPage />} />
          <Route path="groups/:groupId/fixtures" element={<GroupFixturesPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
