// what people see when they type a URL that doesn't exist

import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div>
            <h1>We couldn't find that page</h1>
            <p>It may have moved, or the link might be wrong.</p>
            <Link to="/browse">Back to Browse</Link>
        </div>
    );
}