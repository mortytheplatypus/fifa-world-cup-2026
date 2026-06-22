import PropTypes from 'prop-types';
import { getWcStageLabel } from '../utils/data';

const STAGE_CLASS = {
  champion: 'wc-stage-badge--champion',
  runnerUp: 'wc-stage-badge--runner-up',
  thirdPlace: 'wc-stage-badge--third',
  semifinal: 'wc-stage-badge--semifinal',
  quarterfinal: 'wc-stage-badge--quarterfinal',
  roundOf16: 'wc-stage-badge--round-of-16',
  group: 'wc-stage-badge--group',
};

function WcStageBadge({ stage, label }) {
  const text = label ?? getWcStageLabel(stage);

  return (
    <span className={`wc-stage-badge ${STAGE_CLASS[stage] ?? ''}`}>
      {text}
    </span>
  );
}

WcStageBadge.propTypes = {
  stage: PropTypes.string.isRequired,
  label: PropTypes.string,
};

export default WcStageBadge;
