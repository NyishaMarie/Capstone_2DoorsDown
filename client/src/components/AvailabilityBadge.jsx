export default function AvailabilityBadge({ isAvailable, dueAt }) {
  if (isAvailable) {
    return <span className="badge badge-available">Available</span>;
  }

  const dueDate = new Date(dueAt).toLocaleDateString();
  return (
    <span className="badge badge-unavailable">
      Out — due back {dueDate}
    </span>
  );
}