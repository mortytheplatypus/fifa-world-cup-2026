function FixtureCard({ fixture, homeTeam, awayTeam }) {
  const date = new Date(`${fixture.date}T${fixture.time}`);

  return (
    <article className="fixture-card">
      <div className="fixture-meta">
        <span className="fixture-matchday">Matchday {fixture.matchday}</span>
        <time dateTime={fixture.date}>
          {date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
          })}
          {' · '}
          {fixture.time}
        </time>
      </div>

      <div className="fixture-teams">
        <div className="fixture-team home">
          <img
            src={`https://flagcdn.com/w40/${homeTeam.flagCode}.png`}
            alt=""
            width={32}
            height={24}
          />
          <span>{homeTeam.name}</span>
        </div>
        <span className="fixture-vs">vs</span>
        <div className="fixture-team away">
          <img
            src={`https://flagcdn.com/w40/${awayTeam.flagCode}.png`}
            alt=""
            width={32}
            height={24}
          />
          <span>{awayTeam.name}</span>
        </div>
      </div>

      <div className="fixture-venue">
        {fixture.venue}, {fixture.city}
      </div>
    </article>
  );
}

export default FixtureCard;
