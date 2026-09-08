// client/src/pages/ToolDetail.jsx
import { Link } from 'react-router-dom';

export default function ToolDetail({ tool, currentUserId }) {
  const isOwner = tool.ownerId === currentUserId;

  return (
    <div className="tool-detail">
      <img src={tool.photoUrl} alt={tool.name} />
      <h1>{tool.name}</h1>
      <span className="tag">{tool.category}</span>
      <p>{tool.description}</p>
      <p>Condition: {tool.condition}</p>

      <div className="owner-card">
        <Link to={`/users/${tool.ownerId}`}>{tool.ownerName}</Link>
      </div>

      {isOwner && (
        <div className="tool-detail__branch tool-detail__branch--owner">
          <p>This is your tool.</p>
          {/* edit/delete actions land here in P-11 */}
        </div>
      )}

      {!isOwner && tool.isAvailable && (
        <div className="tool-detail__branch tool-detail__branch--available">
          <p>Available to borrow.</p>
          {/* borrow action lands here, N-16 */}
        </div>
      )}

      {!isOwner && !tool.isAvailable && (
        <div className="tool-detail__branch tool-detail__branch--unavailable">
          <p>Currently out — due back {new Date(tool.dueAt).toLocaleDateString()}.</p>
        </div>
      )}
    </div>
  );
}cd