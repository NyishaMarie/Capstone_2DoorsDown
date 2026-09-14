import { useEffect, useState } from 'react';
import apiRequest from '../api/Services/Api';
import { useAuth } from '../auth/AuthContext';  
import ToolCard from '../components/ToolCard'; 
import CategoryFilter from '../components/CategoryFilter';

export default function Browse() {
    // Get the auth token from AuthContext 
    const {token} = useAuth ();
  const [tools, setTools] = useState([]);
  const [category, setCategory] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [status, setStatus] = useState('loading'); 
  const [error, setError] = useState(null);

  useEffect(() => {
    setStatus('loading');

    // Build the search string from whatever filters are selected,
    // e.g. category=power &available=true
    //It buiilds the URL extra filter links. If user selects no filters, then it skips params. 
    const params = new URLSearchParams();
    if (category) params.set('category', category);
    if (availableOnly) params.set('available', 'true');

    // Call the backend for tools matching the current filters.
    // apiRequest needs the token passed directly.
    request(`/tools?${params.toString()}`)
      .then(data => {
        setTools(data);
        setStatus('ready');
      })
      .catch(err => {
         // apiRequest throws an Error if the request failed — .message is that error text.
        setError(err.message);
        setStatus('error');
      });
      // Re-run this whenever the filters change, or when token changes (e.g. login/logout).
    // This refetches when category, availableOnly, or token actually change.
  }, [category, availableOnly, tagVersions.tools]);

  //Always show the filter controls. 
  // Then, depending on what state the fetch is in (loading, error, or ready), 
  // show: a loading message, an error message, a 'no results' message, or the actual grid of tool cards.
 //       {status === 'ready' && tools.length === 0 && ( means only show this if both status if fetch is ready and zero tools matched  
 //       {status === 'ready' && tools.length > 0 && ( - only show this if both status if fetch is ready and more than one tool matched  
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