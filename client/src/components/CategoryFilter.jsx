
export default function CategoryFilter(props) {
  // Pulling props out
  const category = props.category;
  const onCategoryChange = props.onCategoryChange;
  const availableOnly = props.availableOnly;
  const onAvailableOnlyChange = props.onAvailableOnlyChange;

  // A function that runs whenever the dropdown's selected value changes.
  function handleCategoryChange(event) {
    const newValue = event.target.value;
    onCategoryChange(newValue);
  }

  // Same idea, for the checkbox on availability.
  function handleAvailableOnlyChange(event) {
    const isChecked = event.target.checked;
    onAvailableOnlyChange(isChecked);
  }

  return (
    <div className="category-filter">
      <select value={category} onChange={handleCategoryChange}> {/*  whenever the user picks a different option, call this function.*/}
      <option value="">All categories</option>
        <option value="power">power</option>
        <option value="hand">hand</option>
        <option value="garden">garden</option>
        <option value="automotive">automotive</option>
        <option value="ladder">ladder</option>
        <option value="outdoor">outdoor</option>
        <option value="other">other</option>
      </select>

      <label>
        <input
          type="checkbox"
          checked={availableOnly}
          onChange={handleAvailableOnlyChange}
        />
        Available only
      </label>
    </div>
  );
}