import { useState } from 'react';
import { getTeamById } from '../utils/data';

export function useGroupTeamFilters(teams, favoriteTeamId) {
  const [selectedGroup, setSelectedGroup] = useState('all');
  const [teamFilter, setTeamFilter] = useState('all');

  const favoriteTeam = favoriteTeamId
    ? getTeamById(teams, favoriteTeamId)
    : null;
  const favoriteTeamName = favoriteTeam?.name ?? null;
  const favoriteTeamGroup = favoriteTeam?.group ?? null;

  function handleGroupChange(event) {
    const nextGroup = event.target.value;
    setSelectedGroup(nextGroup);

    if (teamFilter === 'favorite' && nextGroup !== favoriteTeamGroup) {
      setTeamFilter('all');
    }
  }

  function handleTeamFilterChange(event) {
    const nextTeamFilter = event.target.value;
    setTeamFilter(nextTeamFilter);

    if (nextTeamFilter === 'favorite' && favoriteTeamGroup) {
      setSelectedGroup(favoriteTeamGroup);
    }
  }

  return {
    selectedGroup,
    teamFilter,
    favoriteTeamName,
    handleGroupChange,
    handleTeamFilterChange,
  };
}
