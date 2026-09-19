// everything I've borrowed. still out at the top with Return buttons, returned ones below

import { useEffect, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import apiRequest from "../api/Services/Api.js";
import BorrowRow from "../components/BorrowRow.jsx";
import Errors from "../components/Errors.jsx";

export default function MyBorrows() {
    const { token } = useAuth();
    const [borrows, setBorrows] = useState([]);
    const [status, setStatus] = useState("loading");
    const [error, setError] = useState(null);

  // this has a name so the Return button can call it again afterwards
    async function syncBorrows() {
        try {
            const data = await apiRequest("/borrows/mine", token);
            setBorrows(data.borrows);
            setStatus("ready");
        }catch (e) {
            setError(e.message);
            setStatus("error");
        }
    }

    useEffect(() => {
        syncBorrows();
    }, [token]);

    async function handleReturn(id) {
        setError(null);
        try {
            await apiRequest(`/borrows/${id}/return`, token, { method: "PATCH" });

            // the list just changed, so go get the new one
            await syncBorrows();
        } catch (e) {
            setError(e.message);
        }
    }

    if (status === "loading") return <p>Loading your borrows…</p>;
    if (status === "error") return <p>Something went wrong: {error}</p>;

    // the server already sorted these, we just split them into two piles
    const active = borrows.filter(borrow => !borrow.returnedAt);
    const past = borrows.filter(borrow => borrow.returnedAt);

    return (
        <div>
            <h1>My Borrows</h1>
            <Errors message={error} />

            <h2>Still out</h2>
            {active.length === 0 ? (
                <p>You don't have anything borrowed right now.</p>
            ) : (
                <ul>
                    {active.map(borrow => (
                        <BorrowRow key={borrow.id} borrow={borrow} side="mine">
                            <button onClick={() => handleReturn(borrow.id)}>Return</button>
                        </BorrowRow>
                    ))}
                </ul>
            )}

            <h2>Returned</h2>
            {past.length === 0 ? (
                <p>Nothing here yet.</p>
            ) : (
                <ul>
                    {past.map(borrow => (
                        <BorrowRow key={borrow.id} borrow={borrow} side="mine" />
                    ))}
                </ul>
            )}
        </div>
    );
}