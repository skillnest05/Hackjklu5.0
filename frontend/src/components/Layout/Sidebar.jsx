import { NavLink, useLocation } from 'react-router-dom';
import { 
  HiOutlineHome, 
  HiOutlinePencilAlt, 
  HiOutlineChartBar, 
  HiOutlineClock, 
  HiOutlineCog,
  HiOutlineAcademicCap 
} from 'react-icons/hi';
import './Layout.css';

const navItems = [
  { path: '/', icon: HiOutlineHome, label: 'Dashboard' },
  { path: '/submit', icon: HiOutlinePencilAlt, label: 'Submit Essay' },
  { path: '/results', icon: HiOutlineChartBar, label: 'Results' },
  { path: '/history', icon: HiOutlineClock, label: 'History' },
  { path: '/settings', icon: HiOutlineCog, label: 'Settings' },
];

export default function Sidebar() {
  const location = useLocation();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <HiOutlineAcademicCap />
        </div>
        <div className="sidebar-logo-text">
          <span className="sidebar-logo-title gradient-text">EssayAI</span>
          <span className="sidebar-logo-subtitle">Semantic Evaluator</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        <div className="sidebar-nav-label">MENU</div>
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => 
              `sidebar-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon className="sidebar-nav-icon" />
            <span>{item.label}</span>
            {location.pathname === item.path && (
              <div className="sidebar-active-indicator" />
            )}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-footer-card glass">
          <div className="sidebar-footer-card-icon">🚀</div>
          <p className="sidebar-footer-card-text">AI-Powered Multi-Aspect Essay Analysis</p>
          <div className="sidebar-footer-stats">
            <span>v2.0</span>
            <span className="badge badge-success">Active</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
