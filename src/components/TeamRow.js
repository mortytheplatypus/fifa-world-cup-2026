function TeamRow({ team }) {
  return (
    <div className="team-row">
      <img
        className="team-flag"
        src={`https://flagcdn.com/w40/${team.flagCode}.png`}
        alt=""
        width={28}
        height={20}
      />
      <span className="team-name">{team.name}</span>
      <span className="team-code">{team.id}</span>
    </div>
  );
}

export default TeamRow;
