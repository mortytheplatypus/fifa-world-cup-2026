import PropTypes from 'prop-types';

function ChampionshipStars({ count, maxVisible = 5 }) {
  const stars = Math.min(count ?? 0, maxVisible);
  const extra = (count ?? 0) > maxVisible ? count - maxVisible : 0;

  if (!count) {
    return <span className="championship-stars championship-stars--none">No titles</span>;
  }

  return (
    <span className="championship-stars" aria-label={`${count} World Cup title${count === 1 ? '' : 's'}`}>
      {Array.from({ length: stars }, (_, index) => (
        <span key={index} className="championship-star" aria-hidden="true">
          ★
        </span>
      ))}
      {extra > 0 && <span className="championship-stars-extra">+{extra}</span>}
    </span>
  );
}

ChampionshipStars.propTypes = {
  count: PropTypes.number,
  maxVisible: PropTypes.number,
};

export default ChampionshipStars;
