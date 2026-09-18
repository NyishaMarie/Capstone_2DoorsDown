
import { useState } from 'react';
import Errors from './Errors';

// These match the CHECK constraints on the tools table exactly
// (server/db/schema.sql) 
const CATEGORIES = ['power', 'hand', 'garden', 'automotive', 'ladder', 'outdoor', 'other'];
const CONDITIONS = ['like_new', 'good', 'fair', 'well_loved'];

export default function ToolForm({ defaultValues = {}, onSubmit, submitLabel = 'Save' }) {
  // Need to update photo URL with actual photo paths for the future. 
  // Everything else is read straight off FormData when the form submits,
  // same as Register.jsx does.
  const [photoUrl, setPhotoUrl] = useState(defaultValues.photoUrl || '');
  const [error, setError] = useState(null);

  const trySubmit = async (formData) => {
    setError(null);

    const name = formData.get('name');
    const description = formData.get('description');
    const category = formData.get('category');
    const condition = formData.get('condition');

    // required on the inputs blocks empty submission already, but that
    // only catches truly empty fields — this also catches "just spaces".
    if (!name.trim() || !description.trim()) {
      setError('Name and description are both required.');
      return;
    }

    try {
      await onSubmit({ name, description, category, condition, photoUrl });
    } catch (e) {
      // apiRequest throws with the server's own error text
      setError(e.message);
    }
  };

  return (
    <form action={trySubmit} className="tool-form">
      <label>
        Name
        <input type="text" name="name" defaultValue={defaultValues.name} required />
      </label>

      <label>
        Category
        <select name="category" defaultValue={defaultValues.category || CATEGORIES[0]}>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Condition
        <select name="condition" defaultValue={defaultValues.condition || CONDITIONS[0]}>
          {CONDITIONS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </label>

      <label>
        Description
        <textarea name="description" defaultValue={defaultValues.description} required />
      </label>

      <label>
        Photo URL
        <input
          type="url"
          name="photoUrl"
          value={photoUrl}
          onChange={(e) => setPhotoUrl(e.target.value)}
          placeholder="https://…"
        />
      </label>

      {/* Live preview — only shows once there's actually a URL typed in */}
      {photoUrl && (
        <img src={photoUrl} alt="Preview" className="tool-form__preview" />
      )}

      <button>{submitLabel}</button>
      <Errors message={error} />
    </form>
  );
}