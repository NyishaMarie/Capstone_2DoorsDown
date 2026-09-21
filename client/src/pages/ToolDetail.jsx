import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../api/Services/Api';
import { useAuth } from '../auth/AuthContext';
import BorrowForm from '../components/BorrowForm.jsx';

export default function ToolDetail() {
  // :id comes from the route path "tools/:id" in App.jsx.
  // useParams() reads whatever's actually in the URL right now —
  const { id } = useParams();
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);
  const [status, setStatus] = useState('loading');
  const [error, setError] = useState(null);

  // Tracks the delete request specifically, separate from the page's
  // own loading/error state above.
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    setStatus('loading');

    // Call apiRequest, then either setTool+ready
    // or setError+error. token is passed along even though this route
    // doesn't require login, since apiRequest just skips the Authorization
    // header entirely when token is null/undefined.
    apiRequest(`/tools/${id}`, token)
      .then(data => {
        setTool(data);
        setStatus('ready');
      })
      .catch(err => {
        setError(err.message);
        setStatus('error');
      });

    // Re-fetch if the URL's :id changes (clicking from one tool straight
    // to another) or if login
    }, [id, token]);

  // Runs when the owner clicks Delete. Confirms first (so a misclick
  // doesn't destroy the tool), then calls the backend. The backend
  // returns 409 with "That tool is currently borrowed." if hasActiveBorrow()
  // is true — apiRequest turns that into an Error whose .message is that text.
  const handleDelete = async () => {
    if (!window.confirm(`Delete "${tool.name}"? This can't be undone.`)) {
      return;
    }

    setDeleting(true);
    setDeleteError(null);

    try {
      await apiRequest(`/tools/${id}`, token, { method: 'DELETE' });
      navigate('/my-toolshed');
    } catch (err) {
      setDeleteError(err.message);
      setDeleting(false);
    }
  };

  if (status === 'loading') {
    return <p>Loading tool…</p>;
  }

  if (status === 'error') {
    return <p>Something went wrong: {error}</p>;
  }

  // isOwner has to wait until we actually have both `tool` and `user` —
  // user is null when nobody's logged in, and tool is only set once
  // status is 'ready', so this line only runs once both exist.
  const isOwner = tool.ownerId === user?.id;

  return (
    <div className="tool-detail">
      <img src={tool.photoUrl} alt={tool.name} />
      <h1>{tool.name}</h1>
      <span className="tag">{tool.category}</span>
      <p>{tool.description}</p>
      <p>Condition: {tool.condition}</p>

      <div className="owner-card">
        <Link to={`/users/${tool.ownerId}`}>{tool.ownerName}</Link>
      </div>

      {isOwner && (
        <div className="tool-detail__branch tool-detail__branch--owner">
          <p>This is your tool.</p>
          <Link to={`/tools/${tool.id}/edit`}>Edit</Link>
          <button onClick={handleDelete} disabled={deleting}>
            {deleting ? 'Deleting…' : 'Delete'}
          </button>
          {deleteError && (
            <p className="tool-detail__delete-error">{deleteError}</p>
          )}
        </div>
      )}

      {!isOwner && tool.isAvailable && (
        <div className="tool-detail__branch tool-detail__branch--available">
          <p>Available to borrow.</p>
            <BorrowForm toolId={id} />
        </div>
      )}

      {!isOwner && !tool.isAvailable && (
        <div className="tool-detail__branch tool-detail__branch--unavailable">
          <p>Currently out — due back {new Date(tool.dueAt).toLocaleDateString()}.</p>
        </div>
      )}
    </div>
  );
}