// the log in form, same shape as register with two fields instead of four

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Errors from "../components/Errors.jsx";

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [error, setError] = useState(null);

    const tryLogin = async (formData) => {
        setError(null);

    const email = formData.get("email");
    const password = formData.get("password");

    try {
        await login({ email, password });
        navigate("/browse");
    } catch (e) {
        setError(e.message);
    }
};

    return (
        <>
            <h1>Log in</h1>
            <form action={tryLogin}>
                <label>
                    Email
                <input type="email" name="email" required />
            </label>
            <label>
                Password
                <input type="password" name="password" required />
            </label>
            <button>Log in</button>
            <Errors message={error} />
        </form>
        <Link to="/register">Need an account? Register</Link>
        </>
    );
}