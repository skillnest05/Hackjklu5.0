import './Common.css';

const variants = {
  success: 'badge-success',
  warning: 'badge-warning',
  danger: 'badge-danger',
  info: 'badge-info',
};

export default function Badge({ children, variant = 'info', score }) {
  const getVariant = () => {
    if (score !== undefined) {
      if (score >= 80) return 'success';
      if (score >= 60) return 'warning';
      return 'danger';
    }
    return variant;
  };

  return (
    <span className={`badge ${variants[getVariant()]}`}>
      {children}
    </span>
  );
}
