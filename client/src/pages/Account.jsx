// your own details, your bio, and the log out button

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import apiRequest from "../api/Services/Api.js";
import Errors from "../components/Errors.jsx";

export default function Account() {
    const { token, user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);
    const [saved, setSaved] = useState(false);

    // user comes from /auth/me so it's null for a moment after a refresh
    if (!user) return <p>Loading your account…</p>;

    const trySaveBio = async (formData) => {
        setError(null);
        setSaved(false);

        try {
            const updated = await apiRequest("/users/me", token, {
                method: "PATCH",
                body: JSON.stringify({ bio: formData.get("bio") }),
            });

            // update the one user object the whole app reads from
            setUser(updated);
            setSaved(true);
        } catch (e) {
            setError(e.message);
        }
    };

    function handleLogout() {
        logout();
        // straight to the landing page instead of getting bounced to /login
        navigate("/");
    }

    return (
        <div>
            <h1>Account</h1>
            <p><strong>Name:</strong> {user.full_name}</p>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Neighborhood:</strong> {user.neighborhood}</p>

            <form action={trySaveBio}>
                <label>
                    Bio
                    <textarea name="bio" defaultValue={user.bio || ""} />
                </label>
                <button>Save</button>
                {saved && <p>Saved.</p>}
                <Errors message={error} />
            </form>

            <button onClick={handleLogout}>Log out</button>
        </div>
    );
}