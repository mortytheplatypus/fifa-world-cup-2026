import { Link } from 'react-router-dom';
import TeamRow from './TeamRow';

function GroupAccordionItem({ groupId, teams, isExpanded, onToggle }) {
  return (
    <div className={`group-accordion-item${isExpanded ? ' expanded' : ''}`}>
      <button
        type="button"
        className="group-accordion-header"
        onClick={onToggle}
        aria-expanded={isExpanded}
      >
        <span className="group-letter">Group {groupId}</span>
        <span className="group-team-count">{teams.length} teams</span>
        <span className="group-chevron" aria-hidden="true">
          {isExpanded ? '−' : '+'}
        </span>
      </button>

      {isExpanded && (
        <div className="group-accordion-body">
          <div className="team-list">
            {teams.map((team) => (
              <TeamRow key={team.id} team={team} />
            ))}
          </div>
          <div className="group-accordion-actions">
            <Link to={`/groups/${groupId}`} className="link-button">
              View group
            </Link>
            <Link to={`/groups/${groupId}/fixtures`} className="link-button secondary">
              Fixtures
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default GroupAccordionItem;
