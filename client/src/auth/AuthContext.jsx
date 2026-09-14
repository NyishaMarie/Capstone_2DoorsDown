// N-06: this file remembers who is logged in so every page can ask about it

import { createContext, useContext, useState, useEffect } from "react";
import apiRequest from "../api/Services/Api.js";

// an empty box, the provider below is what actually fills it

const AuthContext = createContext();

// this wraps the whole app, so anything inside it can see what we share

export function AuthProvider({ children }) {

  // check the browser's storage for a saved token
  // found one means still logged in, nothing there means logged out
  // this is the line that keeps you logged in after a refresh

  const [token, setToken] = useState(localStorage.getItem("token"));

  // the person's info, empty at first because we haven't asked the server yet

  const [user, setUser] = useState(null);

  // logging out erases all three places we kept things
  // miss one and the app gets confused about whether you're logged in

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
  };

  // runs when the app opens, and again any time the token changes

  useEffect(() => {

    // no token means nobody is logged in, so there's nothing to look up

    if (!token) return;

    // we have a token but don't know whose it is yet, so ask the server

    apiRequest("/auth/me", token)

      // server answered, save the person it sent back

      .then(setUser)

      // server said no, the token is old or fake so throw it out

      .catch(logout);
  }, [token]);

  // makes the account and logs them straight in
  // null for the token because we don't have one yet, that's the whole point

  const register = async (credentials) => {
    const result = await apiRequest("/auth/register", null, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    // save the token by itself, exactly how the server sent it
    // NOT JSON.stringify, that adds real quote marks to the text

    localStorage.setItem("token", result.token);

    setToken(result.token);
    setUser(result.user);
  };

  // same four steps as register, just a different address
  // both send back { token, user }

  const login = async (credentials) => {
    const result = await apiRequest("/auth/login", null, {
      method: "POST",
      body: JSON.stringify(credentials),
    });

    localStorage.setItem("token", result.token);
    setToken(result.token);
    setUser(result.user);
  };

  // everything we're handing out to the rest of the app

  const value = { token, user, register, login, logout };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// the shortcut every page uses, const { token, user } = useAuth()
// the error is a safety net, if someone calls this outside the provider it tells
// them what they did instead of crashing with something vague

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw Error("useAuth must be used within AuthProvider");
  return context;
}