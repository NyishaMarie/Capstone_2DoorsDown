// this file client/src/app.jsx is the entry point for the React application. It sets up the main App component and renders it to the DOM. Routes and providers.

import { Routes, Route } from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext.jsx';
import { ApiProvider } from './api/ApiContext.jsx';
import Layout from './layout/Layout.jsx';
import Browse from './pages/Browse.jsx';

// Stands in for pages that aren't written yet.
function Soon({ name, owner, ticket }) {
  return <p>{name} — {owner}, {ticket}</p>;
}

export default function App() {
  return (
    <AuthProvider>
      <ApiProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Soon name="Landing" owner="Priscilla" ticket="P-16" />} />
            <Route path="browse" element={<Browse />} />
            <Route path="tools/new" element={<Soon name="New tool" owner="Priscilla" ticket="P-10" />} /> 
            <Route path="tools/:id" element={<Soon name="Tool detail" owner="Priscilla" ticket="P-07" />} />
            <Route path="tools/:id/edit" element={<Soon name="Edit tool" owner="Priscilla" ticket="P-11" />} />
            <Route path="users/:id" element={<Soon name="Profile" owner="Priscilla" ticket="P-15" />} />
            <Route path="login" element={<Soon name="Login" owner="Nyisha" ticket="N-07" />} />
            <Route path="register" element={<Soon name="Register" owner="Nyisha" ticket="N-07" />} />
            <Route path="my-toolshed" element={<Soon name="My Toolshed" owner="Priscilla" ticket="P-12" />} />
            <Route path="my-borrows" element={<Soon name="My Borrows" owner="Nyisha" ticket="N-17" />} />
            <Route path="account" element={<Soon name="Account" owner="Nyisha" ticket="N-19" />} />
            <Route path="*" element={<Soon name="Not found" owner="either" ticket="T-10" />} />
          </Route>
        </Routes>
      </ApiProvider>
    </AuthProvider>
  );
}