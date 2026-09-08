// client/src/pages/Browse.jsx
import { useEffect, useState } from 'react';
import { useApi } from '../api/ApiContext';
import ToolCard from '../components/ToolCard';
import CategoryFilter from '../components/CategoryFilter';

export default function Browse() {
  const { request, tagVersions } = useApi();
  const [tools, setTools] = useState([]);
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'error'
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus('loading');

    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (availableOnly) params.set('available', 'true');

    request(`/tools?${params.toString()}`)
      .then(data => {
        setTools(data);
        setStatus('ready');
      })
      .catch(err => {
        setError(err.message);
        setStatus('error');
      });
  }, [category, availableOnly, tagVersions.tools]);

  return (
    <div>
      <CategoryFilter
        category={category}
        onCategoryChange={setCategory}
        availableOnly={availableOnly}
        onAvailableOnlyChange={setAvailableOnly}
      />

      {status === 'loading' && <p>Loading tools…</p>}

      {status === 'error' && <p>Something went wrong: {error}</p>}

      {status === 'ready' && tools.length === 0 && (
        <p>No tools match those filters.</p>
      )}

      {status === 'ready' && tools.length > 0 && (
        <div className="tool-grid">
          {tools.map(tool => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      )}
    </div>
  );
}