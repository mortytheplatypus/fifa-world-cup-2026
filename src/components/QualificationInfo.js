import { useState } from 'react';
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

  return (
    <div className={`qualification-info${isOpen ? ' is-open' : ''}`}>
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
