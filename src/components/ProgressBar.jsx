export default function ProgressBar({ progress }) {
  if (progress <= 0) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, zIndex: 999, height: 2, pointerEvents: 'none' }}>
      <div className="progress-bar" style={{ width: `${progress}%` }} />
    </div>
  );
}
