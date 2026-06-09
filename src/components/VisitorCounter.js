const DEMO_VISITOR_COUNT = 12847;

function VisitorCounter() {
  return (
    <div className="visitor-counter" aria-label={`${DEMO_VISITOR_COUNT} visitors`}>
      <span className="visitor-count">
        {DEMO_VISITOR_COUNT.toLocaleString()}
      </span>
      <span className="visitor-label">visitors</span>
    </div>
  );
}

export default VisitorCounter;
