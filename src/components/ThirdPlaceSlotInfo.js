import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { formatThirdPlaceSelectionMessage } from '../utils/thirdPlaceAssignment';

function InfoIcon() {
  return (
    <svg
      className="qualification-info-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

function ThirdPlaceSlotInfo({ candidateGroups }) {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const message = formatThirdPlaceSelectionMessage(candidateGroups);

  useLayoutEffect(() => {
    const panel = panelRef.current;
    const root = rootRef.current;

    if (!panel || !root) {
      return undefined;
    }

    function positionPanel() {
      if (!window.matchMedia('(max-width: 768px)').matches || !isOpen) {
        panel.style.removeProperty('--panel-offset-x');
        return;
      }

      const trigger = root.getBoundingClientRect();
      const margin = 16;
      const panelWidth = panel.offsetWidth;
      let offsetX = 0;

      if (trigger.left + panelWidth > window.innerWidth - margin) {
        offsetX = window.innerWidth - margin - panelWidth - trigger.left;
      }

      if (trigger.left + offsetX < margin) {
        offsetX = margin - trigger.left;
      }

      panel.style.setProperty('--panel-offset-x', `${offsetX}px`);
    }

    positionPanel();
    window.addEventListener('resize', positionPanel);

    return () => {
      window.removeEventListener('resize', positionPanel);
      panel.style.removeProperty('--panel-offset-x');
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    function handlePointerDown(event) {
      if (rootRef.current && !rootRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handlePointerDown);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
    };
  }, [isOpen]);

  return (
    <div
      ref={rootRef}
      className={`qualification-info knockout-third-place-info${
        isOpen ? ' is-open' : ''
      }`}
    >
      <button
        type="button"
        className="qualification-info-trigger knockout-third-place-info-trigger"
        aria-label="Third-place selection details"
        aria-expanded={isOpen}
        aria-controls="knockout-third-place-info-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <InfoIcon />
      </button>
      <div
        ref={panelRef}
        id="knockout-third-place-info-panel"
        role="tooltip"
        className="qualification-info-panel knockout-third-place-info-panel"
      >
        <p className="qualification-info-summary">{message}</p>
      </div>
    </div>
  );
}

ThirdPlaceSlotInfo.propTypes = {
  candidateGroups: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default ThirdPlaceSlotInfo;
