// the due date picker and Borrow button

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import apiRequest from "../api/Services/Api.js";
import { useAuth } from "../auth/AuthContext.jsx";
import Errors from "./Errors.jsx";

export default function BorrowForm({ toolId }) {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    // the server rejects a due date that isn't in the future, so don't let them pick one
    // toISOString gives 2026-09-22T00:00:00Z, slice keeps just the date part

    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10);

    const tryBorrow = async (formData) => {
        setError(null);
        const dueAt = formData.get("dueAt");

    try {
        await apiRequest(`/tools/${toolId}/borrows`, token, {
            method: "POST",
            body: JSON.stringify({ dueAt }),
        });

        // it worked, so send them to see what they have out
        navigate("/my-borrows");
    } catch (e) {
        // this is where a 409 shows up if someone else grabbed it first
        setError(e.message);
    }
};

    return (
        <form action={tryBorrow}>
            <label>
                Due back
                <input type="date" name="dueAt" min={tomorrow} required />
            </label>
            <button>Borrow</button>
            <Errors message={error} />
        </form>
    );
}