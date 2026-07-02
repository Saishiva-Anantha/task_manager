import { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

function AvatarMenu({ username }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [avatarSrc, setAvatarSrc] = useState(localStorage.getItem('avatar_img') || null)
  const fileRef = useRef()
  const menuRef = useRef()

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = reader.result
      localStorage.setItem('avatar_img', base64)
      setAvatarSrc(base64)
    }
    reader.readAsDataURL(file)
    setOpen(false)
  }

  const handleRemovePhoto = () => {
    localStorage.removeItem('avatar_img')
    setAvatarSrc(null)
    setOpen(false)
  }

  const handleLogout = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('username')
    localStorage.removeItem('avatar_img')
    navigate('/login')
  }

  const firstLetter = username ? username[0].toUpperCase() : '?'

  return (
    <div ref={menuRef} style={{ position: 'relative' }}>
      {/* Avatar Circle Button */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          width: 42, height: 42,
          borderRadius: '50%',
          border: '2px solid var(--primary)',
          background: avatarSrc ? 'transparent' : 'var(--primary-gradient)',
          padding: 0,
          cursor: 'pointer',
          overflow: 'hidden',
          boxShadow: '0 0 0 3px var(--primary-glow)',
          transition: 'box-shadow 0.2s',
          flexShrink: 0,
        }}
        title={username}
      >
        {avatarSrc ? (
          <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <span style={{ color: '#fff', fontWeight: 700, fontSize: '1.1rem', lineHeight: 1 }}>
            {firstLetter}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      {open && (
        <div style={{
          position: 'absolute', top: '110%', right: 0,
          background: 'var(--card-bg)',
          backdropFilter: 'blur(20px)',
          border: '1px solid var(--card-border)',
          borderRadius: '14px',
          padding: '8px',
          minWidth: '200px',
          boxShadow: '0 12px 40px rgba(0,0,0,0.25)',
          zIndex: 3000,
          animation: 'fadeInUp 0.2s ease forwards'
        }}>
          {/* User Info */}
          <div style={{ padding: '10px 12px 8px', borderBottom: '1px solid var(--card-border)', marginBottom: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: '50%',
                background: 'var(--primary-gradient)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden', flexShrink: 0
              }}>
                {avatarSrc
                  ? <img src={avatarSrc} alt="avatar" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : <span style={{ color: '#fff', fontWeight: 700 }}>{firstLetter}</span>
                }
              </div>
              <div>
                <div style={{ fontWeight: 700, color: 'var(--text-color)', fontSize: '0.9rem' }}>{username}</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>Logged in</div>
              </div>
            </div>
          </div>

          {/* Menu Items */}
          <MenuItem icon="📷" label="Upload Photo" onClick={() => fileRef.current.click()} />
          {avatarSrc && <MenuItem icon="🗑️" label="Remove Photo" onClick={handleRemovePhoto} danger />}
          <div style={{ borderTop: '1px solid var(--card-border)', margin: '6px 0' }} />
          <MenuItem icon="🚪" label="Logout" onClick={handleLogout} danger />
        </div>
      )}

      {/* Hidden file input */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleImageUpload}
      />
    </div>
  )
}

function MenuItem({ icon, label, onClick, danger }) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        width: '100%', textAlign: 'left',
        padding: '9px 12px',
        borderRadius: '9px',
        border: 'none',
        cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
        background: hover ? (danger ? 'rgba(239,68,68,0.1)' : 'var(--primary-glow)') : 'transparent',
        color: danger ? '#ef4444' : 'var(--text-color)',
        fontSize: '0.875rem',
        fontWeight: 500,
        transition: 'background 0.15s',
      }}
    >
      <span>{icon}</span>
      {label}
    </button>
  )
}

export default AvatarMenu
