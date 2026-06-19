import { useLayoutEffect, useRef, useState } from 'react';
import { QUALIFICATION_DETAILS } from '../utils/qualification';

function InfoIcon() {
  return (
    <svg
      className="qualification-info-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="16"
      height="16"
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

function QualificationInfo() {
  const [isOpen, setIsOpen] = useState(false);
  const rootRef = useRef(null);
  const panelRef = useRef(null);

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

  return (
    <div
      ref={rootRef}
      className={`qualification-info${isOpen ? ' is-open' : ''}`}
    >
      <button
        type="button"
        className="qualification-info-trigger"
        aria-label="Qualification rules"
        aria-expanded={isOpen}
        aria-controls="qualification-info-panel"
        onClick={() => setIsOpen((open) => !open)}
      >
        <InfoIcon />
      </button>
      <div
        ref={panelRef}
        id="qualification-info-panel"
        role="tooltip"
        className="qualification-info-panel"
      >
        <ul className="qualification-info-list">
          {QUALIFICATION_DETAILS.map((detail) => (
            <li key={detail}>{detail}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default QualificationInfo;
