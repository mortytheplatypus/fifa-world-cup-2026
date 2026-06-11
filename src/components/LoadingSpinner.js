import { useId } from 'react';

function LoadingSpinner() {
  const gradientId = useId();

  return (
    <div className="page-loading" role="status" aria-label="Loading">
      <svg
        className="loading-spinner"
        xmlns="http://www.w3.org/2000/svg"
        width="48"
        height="48"
        viewBox="0 0 48 48"
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" className="loading-spinner-gradient-start" />
            <stop offset="100%" className="loading-spinner-gradient-end" />
          </linearGradient>
        </defs>
        <circle
          className="loading-spinner-track"
          cx="24"
          cy="24"
          r="20"
          strokeWidth="4"
        />
        <circle
          className="loading-spinner-arc"
          cx="24"
          cy="24"
          r="20"
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray="62 63"
          stroke={`url(#${gradientId})`}
        />
      </svg>
    </div>
  );
}

export default LoadingSpinner;
