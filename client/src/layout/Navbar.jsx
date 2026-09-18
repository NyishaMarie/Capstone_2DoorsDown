// the nav bar, it changes depending on whether someone is logged in

import { NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";

export default function Navbar() {
  // token tells us logged in or not, user is for the greeting, logout clears both
  const { token, user, logout } = useAuth();

  return (
    <header>
      <NavLink to="/">Toolshed</NavLink>

      <nav>
        {/* everyone sees this one */}
        <NavLink to="/browse">Browse</NavLink>

        {/* token exists means logged in, so show the member links */}
        {token ? (
          <>
            <NavLink to="/my-toolshed">My Toolshed</NavLink>
            <NavLink to="/my-borrows">My Borrows</NavLink>
            <NavLink to="/account">Account</NavLink>

            {/* user comes from the /auth/me network, so it shows up a moment after the token */}
            {user && <span>Hi, {user.full_name}</span>}

            {/* a button not a link, because it doesn't go anywhere */}
            <button onClick={logout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}

