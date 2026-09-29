import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import Explore from './pages/Explore';
import ProjectDetails from './pages/ProjectDetails';
import Community from './pages/Community';
import AdminLogin from './pages/Admin/AdminLogin';
import AdminDashboard from './pages/Admin/AdminDashboard';
import ProjectForm from './pages/Admin/ProjectForm';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="project/:slug" element={<ProjectDetails />} />
          <Route path="community" element={<Community />} />
          <Route path="admin" element={<AdminLogin />} />
          <Route path="admin/dashboard" element={<AdminDashboard />} />
          <Route path="admin/project/:id" element={<ProjectForm />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
