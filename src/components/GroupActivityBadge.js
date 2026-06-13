import PropTypes from 'prop-types';

const activityShape = PropTypes.shape({
  variant: PropTypes.oneOf(['upcoming', 'results', 'live']).isRequired,
  label: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
});

function GroupActivityBadge({ activity, compact = false }) {
  if (!activity) return null;

  const { variant, label, title } = activity;

  return (
    <span
      className={`group-activity-badge group-activity-badge--${variant}${
        compact ? ' group-activity-badge--compact' : ''
      }`}
      title={title}
    >
      <span className="group-activity-badge-dot" aria-hidden="true" />
      {label}
    </span>
  );
}

GroupActivityBadge.propTypes = {
  activity: activityShape,
  compact: PropTypes.bool,
};

export function getPrimaryActivityVariant(activities = []) {
  if (activities.some((activity) => activity.variant === 'live')) return 'live';
  if (activities.some((activity) => activity.variant === 'upcoming')) {
    return 'upcoming';
  }

  return activities[0]?.variant ?? null;
}

export function GroupActivityBadges({ activities = [], compact = false }) {
  if (activities.length === 0) return null;

  return (
    <span
      className={`group-activity-badges${
        compact ? ' group-activity-badges--compact' : ''
      }`}
    >
      {activities.map((activity) => (
        <GroupActivityBadge
          key={activity.variant}
          activity={activity}
          compact={compact}
        />
      ))}
    </span>
  );
}

GroupActivityBadges.propTypes = {
  activities: PropTypes.arrayOf(activityShape),
  compact: PropTypes.bool,
};

export default GroupActivityBadge;
