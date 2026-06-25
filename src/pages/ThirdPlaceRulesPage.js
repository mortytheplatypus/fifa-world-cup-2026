import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';
import { useGroupsData } from '../hooks/useGroupsData';
import { GROUP_LETTERS, getTeamDisplayName } from '../utils/data';
import { computeGroupStandings, computeConductScore } from '../utils/standings';
import { rankThirdPlaceTeams } from '../utils/thirdPlaceRanking';
import {
  CONDUCT_SCORE_RULES,
  GROUP_TIEBREAKER_RULES,
  THIRD_PLACE_QUALIFICATION_RULES,
} from '../utils/thirdPlaceRules';

function getGoalDifferenceClass(goalDifference) {
  if (goalDifference > 0) return 'standings-positive';
  if (goalDifference < 0) return 'standings-negative';
  return undefined;
}

function ThirdPlaceRulesPage() {
  const [activeTab, setActiveTab] = useState('ranking');
  const { groupedTeams, fixtures, loading, error } = useGroupsData();

  const standingsByGroup = useMemo(
    () =>
      GROUP_LETTERS.reduce((acc, letter) => {
        acc[letter] = computeGroupStandings(
          groupedTeams[letter] ?? [],
          fixtures[letter] ?? []
        );
        return acc;
      }, {}),
    [groupedTeams, fixtures]
  );

  const thirdPlaceRanking = useMemo(
    () => rankThirdPlaceTeams(standingsByGroup),
    [standingsByGroup]
  );

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <p className="status-message error">{error}</p>;
  }

  return (
    <section className="page third-place-rules-page">
      <nav className="breadcrumb">
        <Link to="/knockout">Knockout</Link>
        <span aria-hidden="true">/</span>
        <span>Third-place Standings</span>
      </nav>

      <header className="third-place-rules-header">
        <h1>Third-place standings and rules</h1>
        <p className="page-subtitle">
          How ties are broken and the eight best third-placed teams are ranked
        </p>
      </header>

      <div
        className="third-place-rules-tabs home-fixtures-tabs"
        role="tablist"
        aria-label="Third-place content"
      >
        <button
          type="button"
          role="tab"
          id="third-place-tab-ranking"
          className={`home-fixtures-tab${activeTab === 'ranking' ? ' active' : ''}`}
          aria-selected={activeTab === 'ranking'}
          aria-controls="third-place-panel-ranking"
          onClick={() => setActiveTab('ranking')}
        >
          Ranking
        </button>
        <button
          type="button"
          role="tab"
          id="third-place-tab-rules"
          className={`home-fixtures-tab${activeTab === 'rules' ? ' active' : ''}`}
          aria-selected={activeTab === 'rules'}
          aria-controls="third-place-panel-rules"
          onClick={() => setActiveTab('rules')}
        >
          Rules
        </button>
      </div>

      <div
        role="tabpanel"
        id="third-place-panel-ranking"
        className="third-place-rules-panel"
        aria-labelledby="third-place-tab-ranking"
        hidden={activeTab !== 'ranking'}
      >
        <section className="rules-section" aria-labelledby="third-place-ranking-heading">
          <h2 id="third-place-ranking-heading">Current third-place ranking</h2>
          <div className="standings-table-wrap">
            <table className="standings-table third-place-ranking-table">
              <thead>
                <tr>
                  <th scope="col" className="standings-col-pos">#</th>
                  <th scope="col" className="standings-col-team">Team</th>
                  <th scope="col">Grp</th>
                  <th scope="col">P</th>
                  <th scope="col">W</th>
                  <th scope="col">D</th>
                  <th scope="col">L</th>
                  <th scope="col">GF</th>
                  <th scope="col">GA</th>
                  <th scope="col">GD</th>
                  <th scope="col" className="standings-col-pts">Pts</th>
                  <th
                    scope="col"
                    className="standings-col-conduct"
                    title="Fair play conduct score (tie-breaker)"
                  >
                    Conduct
                  </th>
                </tr>
              </thead>
              <tbody>
                {thirdPlaceRanking.map((row) => {
                  const conductScore = computeConductScore(
                    row.team.id,
                    fixtures[row.group] ?? []
                  );

                  return (
                  <tr
                    key={row.team.id}
                    className={
                      row.qualifies
                        ? 'standings-row--qualified'
                        : 'standings-row--third'
                    }
                  >
                    <td className="standings-col-pos">{row.rank}</td>
                    <td className="standings-col-team">
                      <div className="standings-team">
                        <img
                          className="standings-team-flag"
                          src={`https://flagcdn.com/w40/${row.team.flagCode}.png`}
                          alt=""
                          width={24}
                          height={18}
                        />
                        <span className="standings-team-name">
                          {getTeamDisplayName(row.team.name)}
                        </span>
                      </div>
                    </td>
                    <td>{row.group}</td>
                    <td>{row.played}</td>
                    <td>{row.won}</td>
                    <td>{row.drawn}</td>
                    <td>{row.lost}</td>
                    <td>{row.goalsFor}</td>
                    <td>{row.goalsAgainst}</td>
                    <td className={getGoalDifferenceClass(row.goalDifference)}>
                      {row.goalDifference > 0
                        ? `+${row.goalDifference}`
                        : row.goalDifference}
                    </td>
                    <td className="standings-col-pts">{row.points}</td>
                    <td
                      className={
                        conductScore < 0
                          ? 'standings-col-conduct standings-negative'
                          : 'standings-col-conduct'
                      }
                    >
                      {conductScore}
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      <div
        role="tabpanel"
        id="third-place-panel-rules"
        className="third-place-rules-panel"
        aria-labelledby="third-place-tab-rules"
        hidden={activeTab !== 'rules'}
      >
        <section className="rules-section" aria-labelledby="third-place-qual-heading">
        <h2 id="third-place-qual-heading">{THIRD_PLACE_QUALIFICATION_RULES.title}</h2>
        <p className="rules-section-intro">{THIRD_PLACE_QUALIFICATION_RULES.intro}</p>
        <ol className="rules-list">
          {THIRD_PLACE_QUALIFICATION_RULES.criteria.map((criterion) => (
            <li key={criterion}>{criterion}</li>
          ))}
        </ol>
      </section>

      <section className="rules-section" aria-labelledby="group-tiebreak-heading">
        <h2 id="group-tiebreak-heading">{GROUP_TIEBREAKER_RULES.title}</h2>
        <p className="rules-section-intro">{GROUP_TIEBREAKER_RULES.intro}</p>
        {GROUP_TIEBREAKER_RULES.steps.map((step) => (
          <div key={step.title} className="rules-subsection">
            <h3>{step.title}</h3>
            <ol className="rules-list">
              {step.criteria.map((criterion) => (
                <li key={criterion}>{criterion}</li>
              ))}
            </ol>
          </div>
        ))}
      </section>

      <section className="rules-section" aria-labelledby="conduct-score-heading">
        <h2 id="conduct-score-heading">{CONDUCT_SCORE_RULES.title}</h2>
        <p className="rules-section-intro">{CONDUCT_SCORE_RULES.intro}</p>
        <ul className="rules-conduct-list">
          {CONDUCT_SCORE_RULES.deductions.map((item) => (
            <li key={item.card}>
              <span>{item.card}</span>
              <span>{item.points}</span>
            </li>
          ))}
        </ul>
        <p className="rules-section-note">{CONDUCT_SCORE_RULES.note}</p>
      </section>
      </div>
    </section>
  );
}

export default ThirdPlaceRulesPage;
