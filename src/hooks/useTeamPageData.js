import { useEffect, useState } from 'react';
import {
  fetchPlayers,
  fetchSquads,
  fetchTeams,
  fetchWcHistory,
  getTeamByFlagCode,
  resolvePlayers,
} from '../utils/data';

export function useTeamPageData(flagCode) {
  const [state, setState] = useState({
    team: null,
    squad: null,
    squadPlayers: [],
    wcHistory: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [teams, squads, playersMap, wcHistoryMap] = await Promise.all([
          fetchTeams(),
          fetchSquads(),
          fetchPlayers(),
          fetchWcHistory(),
        ]);

        if (cancelled) return;

        const team = getTeamByFlagCode(teams, flagCode);

        if (!team) {
          setState({
            team: null,
            squad: null,
            squadPlayers: [],
            wcHistory: null,
            loading: false,
            error: null,
          });
          return;
        }

        const squad = squads[team.id] ?? null;
        const squadPlayers = resolvePlayers(squad?.playerIds, playersMap);
        const wcHistory = wcHistoryMap[team.id] ?? null;

        setState({
          team,
          squad,
          squadPlayers,
          wcHistory,
          playersMap,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message ?? 'Failed to load team data',
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [flagCode]);

  return state;
}

export function usePlayerPageData(playerId) {
  const [state, setState] = useState({
    player: null,
    team: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setState((prev) => ({ ...prev, loading: true, error: null }));

      try {
        const [teams, playersMap] = await Promise.all([fetchTeams(), fetchPlayers()]);

        if (cancelled) return;

        const player = playersMap[playerId] ?? null;
        const team = player ? teams.find((entry) => entry.id === player.teamId) ?? null : null;

        setState({
          player,
          team,
          loading: false,
          error: null,
        });
      } catch (error) {
        if (!cancelled) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: error.message ?? 'Failed to load player data',
          }));
        }
      }
    }

    load();

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  return state;
}
