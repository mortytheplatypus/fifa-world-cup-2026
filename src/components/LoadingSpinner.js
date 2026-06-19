function LoadingSpinner() {
  return (
    <output className="page-loading" aria-live="polite" aria-label="Loading">
      <div className="loading-ball-loader" aria-hidden="true">
        <img className="loading-ball" src="/ball.png" alt="" />
        <div className="loading-ball-shadow" />
      </div>
    </output>
  );
}

export default LoadingSpinner;
