import { useMemo } from 'react';
import { useGroupsData } from './useGroupsData';
import { useKnockoutResults } from './useKnockoutResults';
import {
  buildKnockoutFixtures,
  buildStandingsByGroup,
} from '../utils/knockoutFixtures';
import { isKnockoutScheduleMode } from '../utils/knockoutConfig';

export function useMatchSchedule() {
  const groupsData = useGroupsData();
  const knockoutResultsData = useKnockoutResults();
  const knockoutMode = isKnockoutScheduleMode();

  const standingsByGroup = useMemo(
    () => buildStandingsByGroup(groupsData.groupedTeams, groupsData.fixtures),
    [groupsData.groupedTeams, groupsData.fixtures]
  );

  const knockoutFixtures = useMemo(() => {
    if (!knockoutMode) {
      return null;
    }

    return buildKnockoutFixtures(
      standingsByGroup,
      knockoutResultsData.knockoutResults
    );
  }, [knockoutMode, standingsByGroup, knockoutResultsData.knockoutResults]);

  const loading = knockoutMode
    ? groupsData.loading || knockoutResultsData.loading
    : groupsData.loading;

  const error = knockoutMode
    ? groupsData.error ?? knockoutResultsData.error
    : groupsData.error;

  const fixtures = knockoutMode ? knockoutFixtures : groupsData.fixtures;

  return {
    teams: groupsData.teams,
    fixtures,
    groupFixtures: groupsData.fixtures,
    results: groupsData.results,
    groupedTeams: groupsData.groupedTeams,
    standingsByGroup,
    knockoutResults: knockoutResultsData.knockoutResults,
    mode: knockoutMode ? 'knockout' : 'groups',
    loading,
    error,
  };
}
