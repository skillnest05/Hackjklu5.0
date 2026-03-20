import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { HiOutlineBell, HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import './Layout.css';

export default function Navbar({ onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasNotification, setHasNotification] = useState(true);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleNotificationClick = () => {
    if (hasNotification) {
      setHasNotification(false);
      toast.info('You have no new notifications');
    } else {
      toast.info('You have no new notifications');
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <button className="navbar-menu-btn btn-ghost" onClick={onToggleSidebar}>
          <HiOutlineMenu />
        </button>
        <form className="navbar-search" onSubmit={handleSearch}>
          <HiOutlineSearch className="navbar-search-icon" />
          <input
            type="text"
            placeholder="Search essays, results..."
            className="navbar-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>
      </div>

      <div className="navbar-right">
        <button className="navbar-icon-btn" onClick={handleNotificationClick}>
          <HiOutlineBell />
          {hasNotification && <span className="navbar-notification-dot" />}
        </button>
        <div className="navbar-divider" />
        <div className="navbar-user">
          <div className="navbar-avatar">
            <span>SN</span>
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">Hackjklu 5.0</span>
            <span className="navbar-user-role">SKILLNEST</span>
          </div>
        </div>
      </div>
    </header>
  );
}
