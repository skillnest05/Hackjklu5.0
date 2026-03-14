import './Common.css';

export default function LoadingSpinner({ size = 40, text = 'Analyzing...' }) {
  return (
    <div className="loading-spinner-container">
      <div className="loading-spinner" style={{ width: size, height: size }}>
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-ring" />
        <div className="spinner-dot" />
      </div>
      {text && <p className="loading-text">{text}</p>}
    </div>
  );
}
