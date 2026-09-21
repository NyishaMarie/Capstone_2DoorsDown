// MyToolshed will have everything the user owns, plus who currently has each thing borrowed.
// Two separate fetches: /tools/mine (all tools I own) and
// /borrows/lent (active + past borrows on tools I own).

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import apiRequest from "../api/Services/Api.js";
import ToolCard from "../components/ToolCard.jsx";
import BorrowRow from "../components/BorrowRow.jsx";
import Errors from "../components/Errors.jsx";

export default function MyToolshed() {
  const { token } = useAuth();

  const [tools, setTools] = useState([]);
  const [borrows, setBorrows] = useState([]);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // Named so the "mark returned" button can call it again afterwards,
  // same pattern as MyBorrows.jsx's syncBorrows.
  async function syncToolshed() {
    try {
      // Both requests need the same token and don't depend on each
      // other, so they fire together instead of one after the other.
      const [toolsData, borrowsData] = await Promise.all([
        apiRequest("/tools/mine", token),
        apiRequest("/borrows/lent", token),
      ]);

      setTools(toolsData);
      setBorrows(borrowsData.borrows);
      setStatus("ready");
    } catch (e) {
      setError(e.message);
      setStatus("error");
    }
  }

  useEffect(() => {
    syncToolshed();
  }, [token]);

  async function handleReturn(id) {
    setError(null);
    try {
      await apiRequest(`/borrows/${id}/return`, token, { method: "PATCH" });

      // The lent list just changed, so go get the new one.
      await syncToolshed();
    } catch (e) {
      setError(e.message);
    }
  }

  if (status === "loading") return <p>Loading your toolshed…</p>;
  if (status === "error") return <p>Something went wrong: {error}</p>;

  // Same split MyBorrows.jsx uses — active (still out) vs already returned.
  const active = borrows.filter((borrow) => !borrow.returnedAt);
  const past = borrows.filter((borrow) => borrow.returnedAt);

  return (
    <div>
      <h1>My Toolshed</h1>
      <Errors message={error} />

      <h2>Your tools</h2>
      {tools.length === 0 ? (
        <p>You haven't listed any tools yet.</p>
      ) : (
        <div className="tool-grid">
          {tools.map((tool) => (
            <Link key={tool.id} to={`/tools/${tool.id}`}>
              <ToolCard tool={tool} />
            </Link>
          ))}
        </div>
      )}

      <h2>Currently lent out</h2>
      {active.length === 0 ? (
        <p>Nothing out right now.</p>
      ) : (
        <ul>
          {active.map((borrow) => (
            <BorrowRow key={borrow.id} borrow={borrow} side="lent">
              <button onClick={() => handleReturn(borrow.id)}>
                Mark returned
              </button>
            </BorrowRow>
          ))}
        </ul>
      )}

      <h2>Past borrows</h2>
      {past.length === 0 ? (
        <p>Nothing here yet.</p>
      ) : (
        <ul>
          {past.map((borrow) => (
            <BorrowRow key={borrow.id} borrow={borrow} side="lent" />
          ))}
        </ul>
      )}
    </div>
  );
}