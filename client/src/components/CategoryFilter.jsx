const CATEGORIES = ['power', 'hand', 'garden', 'automotive', 'ladder', 'outdoor', 'other'];

export default function CategoryFilter({ category, onCategoryChange, availableOnly, onAvailableOnlyChange }) {
  return (
    <div className="category-filter">
      <select
        value={category}
        onChange={e => onCategoryChange(e.target.value)}
      >
        <option value="">All categories</option>
        {CATEGORIES.map(c => (
          <option key={c} value={c}>{c}</option>
        ))}
      </select>

      <label>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={e => onAvailableOnlyChange(e.target.checked)}
        />
        Available only
      </label>
    </div>
  );
}