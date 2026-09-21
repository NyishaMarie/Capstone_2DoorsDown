import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import apiRequest from '../api/Services/Api';
import { useAuth } from '../auth/AuthContext';
import ToolCard from '../components/ToolCard';

export default function UserProfile() {
  // :id comes from the route path "users/:id" in App.jsx.
  const { id } = useParams();

  // Public page — token isn't required, but apiRequest just skips the
  // Authorization header when it's null, same as ToolDetail.jsx does.
  const { token } = useAuth();

  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus('loading');

    apiRequest(`/users/${id}`, token)
      .then(data => {
        setProfile(data);
        setStatus('ready');
      })
      .catch(err => {
        setError(err.message);
        setStatus('error');
      });

    // Re-fetch if the URL's :id changes (clicking from one profile
    // straight to another).
  }, [id, token]);

  if (status === 'loading') {
    return <p>Loading profile…</p>;
  }

  if (status === 'error') {
    return <p>Something went wrong: {error}</p>;
  }

  return (
    <div className="user-profile">
      <h1>{profile.fullName}</h1>
      <p className="tag">{profile.neighborhood}</p>
      {profile.bio && <p>{profile.bio}</p>}

      <h2>Tools</h2>
      {profile.tools.length === 0 ? (
        <p>{profile.fullName} hasn't listed any tools yet.</p>
      ) : (
        <div className="tool-grid">
          {profile.tools.map(tool => (
            <Link key={tool.id} to={`/tools/${tool.id}`}>
              <ToolCard tool={tool} />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}