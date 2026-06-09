import { useState } from 'react';
import { GROUP_LETTERS } from '../utils/data';
import { useGroupsData } from '../hooks/useGroupsData';
import GroupAccordionItem from '../components/GroupAccordionItem';

function GroupsPage() {
  const { groupedTeams, loading, error } = useGroupsData();
  const [expandedGroup, setExpandedGroup] = useState(null);

  if (loading) {
    return <p className="status-message">Loading groups…</p>;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  function handleToggle(groupId) {
    setExpandedGroup((current) => (current === groupId ? null : groupId));
  }

  return (
    <section className="page groups-page">
      <h1>Groups</h1>
      <p className="page-subtitle">
        Click a group to see its four teams
      </p>

      <div className="group-accordion">
        {GROUP_LETTERS.map((letter) => (
          <GroupAccordionItem
            key={letter}
            groupId={letter}
            teams={groupedTeams[letter]}
            isExpanded={expandedGroup === letter}
            onToggle={() => handleToggle(letter)}
          />
        ))}
      </div>
    </section>
  );
}

export default GroupsPage;
