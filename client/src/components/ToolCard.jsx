import AvailabilityBadge from './AvailabilityBadge';

export default function ToolCard({ tool }) {
  const { name, category, condition, photoUrl, ownerName, isAvailable, dueAt } = tool;

  return (
    <div className={`tool-card ${isAvailable ? '' : 'tool-card--dimmed'}`}>
      <img src={photoUrl} alt={name} className="tool-card__photo" />
      <h3>{name}</h3>
      <span className="tag">{category}</span>
      <p>Owner: {ownerName}</p>
      <p>Condition: {condition}</p>
      <AvailabilityBadge isAvailable={isAvailable} dueAt={dueAt} />
    </div>
  );
}