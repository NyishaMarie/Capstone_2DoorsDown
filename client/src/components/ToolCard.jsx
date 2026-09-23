import AvailabilityBadge from './AvailabilityBadge';
import { Link } from 'react-router-dom';

export default function ToolCard({ tool }) {
  const {id, name, category, condition, photoUrl, ownerName, isAvailable, dueAt} = tool;

  return (
    <Link to={`/tools/${id}`} className="tool-card__link">
      <div className={`tool-card ${isAvailable ? '' : 'tool-card--dimmed'}`}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className="tool-card__photo" />
        ) : (
          <div className="tool-card__photo tool-card__photo--empty" aria-hidden="true" />
        )}
        <h3>{name}</h3>
        <span className="tag">{category}</span>
        <p>Owner: {ownerName}</p>
        <p>Condition: {condition}</p>
        <AvailabilityBadge isAvailable={isAvailable} dueAt={dueAt} />
      </div>
    </Link>
  );
}