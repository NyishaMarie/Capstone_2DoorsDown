// the sign up form, makes the account and logs them straight in

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import Errors from "../components/Errors.jsx";

export default function Register() {

    // register comes from AuthContext, it does the fetch and saves the token
    const { register } = useAuth();

    // navigate is how you move to another page from inside a function
    const navigate = useNavigate();

    const [error, setError] = useState(null);

    const tryRegister = async (formData) => {

        // wipe the old message so a second try doesn't show a stale error
        setError(null);

        // formData grabs each value by the name attribute on the input
        const email = formData.get("email");
        const password = formData.get("password");
        const fullName = formData.get("fullName");
        const neighborhood = formData.get("neighborhood");

        try {
            await register({ email, password, fullName, neighborhood });
            navigate("/browse");
        } catch (e) {
            // apiRequest throws with the server's own sentence, so this is the real reason
            setError(e.message);
        }
    };

    return (
        <>
            <h1>Create your account</h1>
            <form action={tryRegister}>
                <label>
                    Full name
                    <input type="text" name="fullName" required />
                </label>
                <label>
                    Email
                    <input type="email" name="email" required />
                </label>
                <label>
                    Password
                    <input type="password" name="password" minLength={8} required />
                </label>
                <label>
                    Neighborhood
                    <input type="text" name="neighborhood" required />
                </label>
                <button>Register</button>
                <Errors message={error} />
            </form>
            <Link to="/login">Already have an account? Log in</Link>
        </>
    );
}