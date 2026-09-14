// This component decides what small "badge" label to show for a tool, whether 
// it's currently available to borrow or not.
// isAvailable and dueAt are both props passed in from whatever page renders this like ToolDetail.jsx or ToolCard.jsx.
export default function AvailabilityBadge({ isAvailable, dueAt }) {
// If the tool IS available, we don't need dueAt at all. Nothing below this line runs
  // in that case, since `return` stops the function.
  if (isAvailable) {
    return <span className="badge badge-available">Available</span>;
  }

  //the backend sends the date as text, but text isn't very useful for displaying nicely 
  // so this line does two jobs, one after the other: new Date(dueAt) turns the text into an actual date, 
  // and .toLocaleDateString() turns that date into something readable on screen.
  const dueDate = new Date(dueAt).toLocaleDateString();

  // Show the "unavailable" badge, including the formatted due-back date.
  // {dueDate} inserts the actual formatted date 
  return (
    <span className="badge badge-unavailable">
      Out — due back {dueDate}
    </span>
  );
}