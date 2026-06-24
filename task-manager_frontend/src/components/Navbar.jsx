import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../context/themes';
import SettingsPanel from './SettingsPanel';
import AvatarMenu from './AvatarMenu';

function Navbar({ username }) {
  const [showSettings, setShowSettings] = useState(false);
  useTheme();

  return (
    <>
      <nav className="navbar glass-nav navbar-expand-lg py-3 mb-4">
        <div className="container">
          <div className="d-flex align-items-center">
            <Link
              className="navbar-brand fw-bold fs-3 mb-0"
              to="/dashboard"
              style={{ background: 'var(--primary-gradient)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
            >
              Anantha Task Manager
            </Link>
            <span className="badge rounded-pill bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 ms-2 d-none d-sm-inline-block" style={{ fontSize: '0.7rem', padding: '5px 10px' }}>
              🚀 by Sai Shiva Anantha
            </span>
          </div>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse justify-content-end" id="navbarNav">
            <ul className="navbar-nav align-items-center gap-3">

              {/* Dashboard label */}
              <li className="nav-item">
                <span className="nav-link fw-semibold" style={{ color: 'var(--text-color)' }}>Dashboard</span>
              </li>

              {/* Theme Button */}
              <li className="nav-item">
                <button
                  onClick={() => setShowSettings(true)}
                  className="btn btn-sm rounded-pill px-3"
                  style={{
                    background: 'var(--primary-glow)',
                    border: '1px solid var(--primary)',
                    color: 'var(--primary)',
                    fontWeight: 600,
                  }}
                >
                  🎨 Theme
                </button>
              </li>

              {/* Avatar / User Menu */}
              <li className="nav-item">
                <AvatarMenu username={username} />
              </li>

            </ul>
          </div>
        </div>
      </nav>

      {showSettings && <SettingsPanel onClose={() => setShowSettings(false)} />}
    </>
  );
}

export default Navbar;
