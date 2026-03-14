import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { HiOutlineBell, HiOutlineSearch, HiOutlineMenu } from 'react-icons/hi';
import './Layout.css';

export default function Navbar({ onToggleSidebar }) {
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/history?search=${encodeURIComponent(searchQuery.trim())}`);
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
        <button className="navbar-icon-btn">
          <HiOutlineBell />
          <span className="navbar-notification-dot" />
        </button>
        <div className="navbar-divider" />
        <div className="navbar-user">
          <div className="navbar-avatar">
            <span>JK</span>
          </div>
          <div className="navbar-user-info">
            <span className="navbar-user-name">JKLU Student</span>
            <span className="navbar-user-role">Evaluator</span>
          </div>
        </div>
      </div>
    </header>
  );
}
