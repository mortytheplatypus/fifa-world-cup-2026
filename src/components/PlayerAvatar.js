import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { playerShape, teamShape } from '../propTypes';
import { fetchPlayerPhoto, getPlayerInitials } from '../utils/playerImage';

function PlayerAvatar({ player, team, size = 'large', showNumber = true }) {
  const [photoUrl, setPhotoUrl] = useState(player.imageUrl ?? null);
  const [imageFailed, setImageFailed] = useState(false);
  const [loadingPhoto, setLoadingPhoto] = useState(!player.imageUrl);

  useEffect(() => {
    if (player.imageUrl) {
      setPhotoUrl(player.imageUrl);
      setImageFailed(false);
      setLoadingPhoto(false);
      return undefined;
    }

    let cancelled = false;
    setLoadingPhoto(true);
    setImageFailed(false);

    fetchPlayerPhoto(player.name).then((url) => {
      if (cancelled) {
        return;
      }

      if (url) {
        setPhotoUrl(url);
      }
      setLoadingPhoto(false);
    });

    return () => {
      cancelled = true;
    };
  }, [player.name, player.imageUrl]);

  const showPhoto = Boolean(photoUrl) && !imageFailed;
  const accent = team?.colors?.[0] ?? '#3a4656';
  const highlight = team?.colors?.[1] ?? '#c8ad72';

  return (
    <div className={`player-avatar player-avatar--${size}`}>
      {loadingPhoto && !showPhoto && (
        <div className="player-avatar-loading" aria-hidden="true" />
      )}

      {showPhoto ? (
        <img
          className="player-avatar-image"
          src={photoUrl}
          alt=""
          width={size === 'large' ? 200 : size === 'card' ? 72 : 48}
          height={size === 'large' ? 200 : size === 'card' ? 72 : 48}
          onError={() => setImageFailed(true)}
        />
      ) : (
        !loadingPhoto && (
          <div
            className="player-avatar-fallback"
            style={{
              background: `linear-gradient(145deg, ${accent} 0%, color-mix(in srgb, ${accent} 65%, #000) 100%)`,
              color: highlight,
            }}
            aria-hidden="true"
          >
            <span className="player-avatar-initials">{getPlayerInitials(player.name)}</span>
            {team && (
              <img
                className="player-avatar-flag"
                src={`https://flagcdn.com/w40/${team.flagCode}.png`}
                alt=""
                width={28}
                height={21}
              />
            )}
          </div>
        )
      )}

      {showNumber && player.shirtNumber != null && (
        <span className="player-avatar-number" aria-label={`Shirt number ${player.shirtNumber}`}>
          {player.shirtNumber}
        </span>
      )}
    </div>
  );
}

PlayerAvatar.propTypes = {
  player: playerShape.isRequired,
  team: teamShape,
  size: PropTypes.oneOf(['large', 'card', 'small']),
  showNumber: PropTypes.bool,
};

export default PlayerAvatar;
