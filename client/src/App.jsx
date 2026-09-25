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
import MyToolshed from './pages/MyToolshed.jsx';
import UserProfile from './pages/Profile.jsx';
import Landing from './pages/Landing.jsx';
import Account from './pages/Account.jsx';
import NotFound from './pages/NotFound.jsx';

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
            <Route index element={<Landing />} />
            <Route path="browse" element={<Browse />} />
            <Route path="tools/:id" element={<ToolDetail />} />
            <Route path="users/:id" element={<UserProfile />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />

            {/* everything in here needs a login, ProtectedRoute bounces you to /login without one */}
            <Route element={<ProtectedRoute />}>
              <Route path="tools/new" element={<NewTool />} />
              <Route path="tools/:id/edit" element={<EditTool />} />
              <Route path="my-toolshed" element={<MyToolshed />} />
              <Route path="my-borrows" element={<MyBorrows />} />
              <Route path="account" element={<Account />} />
            </Route>

            {/* catch-all, has to stay last */}
            <Route path="*" element={<NotFound />} />
            
          </Route>
        </Routes>
    </AuthProvider>
  );
}