import { useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import SettingsModal from './SettingsModal';

function GearIcon() {
  return (
    <svg
      className="settings-button-icon"
      xmlns="http://www.w3.org/2000/svg"
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function SettingsButton() {
  const { isModalOpen, openModal, closeModal } = useSettings();
  const buttonRef = useRef(null);

  const handleToggle = (event) => {
    event.stopPropagation();

    if (isModalOpen) {
      closeModal();
      buttonRef.current?.blur();
    } else {
      openModal();
    }
  };

  return (
    <div className="settings-dropdown">
      <button
        ref={buttonRef}
        type="button"
        className="settings-button"
        onClick={handleToggle}
        aria-label="Open settings"
        aria-expanded={isModalOpen}
        aria-haspopup="dialog"
      >
        <GearIcon />
      </button>
      <SettingsModal onClose={closeModal} buttonRef={buttonRef} />
    </div>
  );
}

export default SettingsButton;
