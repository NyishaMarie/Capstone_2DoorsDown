import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Layout from './layout/Layout.jsx';
import Browse from './pages/Browse.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyBorrows from './pages/MyBorrows.jsx';
import ToolDetail from './pages/ToolDetail.jsx';
import NewTool from './pages/NewTool.jsx';
import EditTool from './pages/EditTool.jsx';

// Stands in for pages that aren't written yet.
function Soon({ name, owner, ticket }) {
  return <p>{name} — {owner}, {ticket}</p>;
}

export default function App() {
  return (
    <AuthProvider>
        <Routes>
          <Route element={<Layout />}>

            {/* public, anyone can see these */}
            <Route index element={<Soon name="Landing" owner="Priscilla" ticket="P-16" />} />
            <Route path="browse" element={<Browse />} />
            <Route path="tools/:id" element={<ToolDetail />} />
            <Route path="users/:id" element={<Soon name="Profile" owner="Priscilla" ticket="P-15" />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* everything in here needs a login, ProtectedRoute bounces you to /login without one */}
            <Route element={<ProtectedRoute />}>
              <Route path="tools/new" element={<NewTool />} />
              <Route path="tools/:id/edit" element={<EditTool />} />
              <Route path="my-toolshed" element={<Soon name="My Toolshed" owner="Priscilla" ticket="P-12" />} />
              <Route path="my-borrows" element={<MyBorrows />} />
              <Route path="account" element={<Soon name="Account" owner="Nyisha" ticket="N-19" />} />
            </Route>

            {/* catch-all, has to stay last */}
            <Route path="*" element={<Soon name="Not found" owner="either" ticket="T-10" />} />
            
          </Route>
        </Routes>
    </AuthProvider>
  );
}