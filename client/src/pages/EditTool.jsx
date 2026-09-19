import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import apiRequest from '../api/Services/Api';
import { useAuth } from '../auth/AuthContext';
import ToolForm from '../components/ToolForm';

export default function EditTool() {
  const { id } = useParams();
  const { token } = useAuth();

  // Lets us redirect the user in code (e.g. after a successful save),
  // instead of them clicking a link.
  const navigate = useNavigate();
  const [tool, setTool] = useState(null);

  // Tracks which phase of loading we're in, same pattern as ToolDetail.jsx
  // and Browse.jsx: 'loading' while fetching, 'ready' once we have data,
  // 'error' if the fetch failed.
  const [status, setStatus] = useState('loading');

  const [error, setError] = useState(null);

  // Runs once when the page loads (and again if :id or token changes) —
  // fetches the current tool data from the backend so the form isn't blank.
  useEffect(() => {
    apiRequest(`/tools/${id}`, token)
      .then(data => {
        setTool(data);
        setStatus('ready');
      })
      .catch(err => {
        // apiRequest throws an Error with the server's message if the
        // request failed 
        setError(err.message);
        setStatus('error');
      });
  }, [id, token]);

  // Passed into ToolForm as onSubmit. ToolForm collects and validates
  // the field values, then calls this with the finished object.
  // Same shape as createTool in NewTool.jsx, but this sends a PATCH to
  // this specific tool's id instead of a POST to create a new one.
  const editTool = async (values) => {
    const updated = await apiRequest(`/tools/${id}`, token, {
      method: 'PATCH',
      body: JSON.stringify(values),
    });

    // Once saved, send the user back to the tool's detail page so they
    // can see their changes.
    navigate(`/tools/${updated.id}`);
  };

  if (status === 'loading') return <p>Loading tool…</p>;
  if (status === 'error') return <p>Something went wrong: {error}</p>;

  return (
    <>
      <h1>Edit tool</h1>
      {/* defaultValues pre-fills every input with the tool's current
          data, so the user edits existing values instead of starting
          from a blank form. onSubmit wires the form's "Save" button to
          editTool above. */}
      <ToolForm
        defaultValues={tool}
        onSubmit={editTool}
        submitLabel="Save changes"
      />
    </>
  );
}