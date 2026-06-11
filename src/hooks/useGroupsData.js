import { useEffect, useState } from 'react';
import { fetchFixtures, fetchResults, fetchTeams, groupTeamsByLetter } from '../utils/data';
import { applyMatchResults } from '../utils/results';

export function useGroupsData() {
  const [teams, setTeams] = useState([]);
  const [fixtures, setFixtures] = useState({});
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [teamsData, fixturesData, resultsData] = await Promise.all([
          fetchTeams(),
          fetchFixtures(),
          fetchResults(),
        ]);
        if (!cancelled) {
          setTeams(teamsData);
          setResults(resultsData);
          setFixtures(applyMatchResults(fixturesData, resultsData));
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message);
          setLoading(false);
        }
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const groupedTeams = groupTeamsByLetter(teams);

  return { teams, fixtures, results, groupedTeams, loading, error };
}
