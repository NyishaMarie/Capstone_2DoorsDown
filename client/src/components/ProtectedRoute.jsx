// N-08: a gate, it sits in front of routes that need a login

import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';

export default function ProtectedRoute() {

    // the only thing we care about is whether a token exists
    // we don't check if it's valid, the server does that on every request

    const { token } = useAuth();

    // no token, send them to log in
    // replace swaps this page in the history instead of stacking on top
    // without it, the back button walks you into a redirect loop

    if (!token) return <Navigate to="/login" replace />;

    // logged in, so render whatever route was actually asked for

    return <Outlet />;
}