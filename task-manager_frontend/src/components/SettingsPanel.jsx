import { useState } from 'react'
import { useTheme, THEMES } from '../context/themes'

// 20 beautiful curated backgrounds from Unsplash
const BACKGROUNDS = [
  'https://images.unsplash.com/photo-1506744626753-eba7bc815416?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1531604250646-2f0e818c4f06?auto=format&fit=crop&w=1200&q=80',
  
  'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1483728642387-6c3ba6c6b871?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1465146344425-f00d5f5c8f07?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=1200&q=80',
  
  'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1477346611705-65d1883cee1e?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1498429089284-41f8cf3ffd39?auto=format&fit=crop&w=1200&q=80',
  
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1557682250-33bd709cbe85?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1557683316-973673baf926?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560015534-cee980ba7e13?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?auto=format&fit=crop&w=1200&q=80',
]

function SettingsPanel({ onClose }) {
  const { mode, accent, setThemeMode, setThemeAccent, customColor, customGradient, setCustomThemeDetails, bgImage, setBackgroundImage } = useTheme()
  const [activeTab, setActiveTab] = useState('appearance')

  return (
    <div
      style={{
        position: 'fixed', inset: 0,
        backgroundColor: 'rgba(0,0,0,0.6)',
        backdropFilter: 'blur(4px)',
        zIndex: 2000,
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="glass-card"
        style={{ width: '100%', maxWidth: '650px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center p-4 border-bottom border-secondary border-opacity-25">
          <div>
            <h4 className="fw-bold mb-0">⚙️ Settings</h4>
            <p className="text-muted small mb-0">Customize your Anantha Task Manager experience</p>
          </div>
          <button className="btn-close" onClick={onClose}></button>
        </div>

        {/* Tabs */}
        <div className="d-flex gap-2 px-4 pt-3 border-bottom border-secondary border-opacity-25 pb-3">
          {[
              { id: 'appearance', icon: '🎨', label: 'Appearance' },
              { id: 'backgrounds', icon: '🖼️', label: 'Backgrounds' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="btn rounded-pill px-4"
              style={{
                background: activeTab === tab.id ? 'var(--primary)' : 'transparent',
                color: activeTab === tab.id ? 'var(--primary-text)' : 'var(--text-color)',
                border: `1px solid ${activeTab === tab.id ? 'var(--primary)' : 'var(--card-border)'}`,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* Body */}
        <div className="p-4" style={{ overflowY: 'auto' }}>

          {activeTab === 'appearance' && (
             <>
                {/* Mode Section */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Theme Mode</h6>
                  <div className="d-flex gap-3">
                    {[
                      { id: 'light', label: '☀️ Light', desc: 'Clean and bright' },
                      { id: 'dark', label: '🌙 Dark', desc: 'Easy on the eyes' },
                    ].map(m => (
                      <button
                        key={m.id}
                        onClick={() => setThemeMode(m.id)}
                        className="flex-grow-1 p-3 text-start rounded-3 border"
                        style={{
                          background: mode === m.id ? 'var(--primary-glow)' : 'transparent',
                          border: mode === m.id ? '2px solid var(--primary) !important' : '1px solid var(--card-border)',
                          borderColor: mode === m.id ? 'var(--primary)' : 'var(--card-border)',
                          borderWidth: mode === m.id ? '2px' : '1px',
                          color: 'var(--text-color)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease'
                        }}
                      >
                        <div className="fw-bold">{m.label}</div>
                        <div className="text-muted small">{m.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Accent Color Section */}
                <div className="mb-4">
                  <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Accent Color</h6>
                  <div className="row g-3 mb-4">
                    {THEMES.map(theme => {
                      const isActive = accent === theme.id
                      return (
                        <div className="col-6 col-md-4" key={theme.id}>
                          <button
                            onClick={() => setThemeAccent(theme.id)}
                            className="w-100 p-2 rounded-3 d-flex align-items-center gap-2"
                            style={{
                              background: isActive ? `${theme.primary}22` : 'transparent',
                              border: `${isActive ? 2 : 1}px solid ${isActive ? theme.primary : 'var(--card-border)'}`,
                              color: 'var(--text-color)',
                              cursor: 'pointer',
                              transition: 'all 0.2s ease',
                              position: 'relative'
                            }}
                          >
                            <div style={{
                              width: 28, height: 28, borderRadius: '50%',
                              background: theme.gradient,
                              flexShrink: 0,
                              boxShadow: isActive ? `0 0 8px ${theme.glow}` : 'none',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '12px'
                            }}>
                              {isActive ? '✓' : ''}
                            </div>
                            <div className="text-start">
                              <div className="fw-semibold" style={{ fontSize: '0.8rem' }}>{theme.name}</div>
                            </div>
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Custom Color Section */}
                  <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>🎨 Build Your Own Custom Theme</h6>
                  <div className="glass-card p-3 mb-3" style={{ border: accent === 'custom' ? '2px solid var(--primary)' : '1px solid var(--card-border)'}}>
                     <div className="d-flex align-items-center gap-3 mb-3">
                         <input 
                            type="color" 
                            value={customColor} 
                            onChange={(e) => setCustomThemeDetails(e.target.value, customGradient)}
                            style={{ width: 50, height: 50, padding: 0, border: 'none', borderRadius: '12px', cursor: 'pointer', background: 'transparent' }}
                         />
                         <div>
                             <div className="fw-bold">Pick any color</div>
                             <div className="text-muted small">Choose your exact brand or favorite color</div>
                         </div>
                     </div>

                     <h6 className="fw-bold mb-2 text-muted" style={{ fontSize: '0.75rem' }}>Gradient Style</h6>
                     <div className="d-flex gap-2 flex-wrap">
                         {[
                             { id: 'diagonal', label: 'Diagonal' },
                             { id: 'top-bottom', label: 'Vertical' },
                             { id: 'left-right', label: 'Horizontal' },
                             { id: 'radial', label: 'Radial' }
                         ].map(g => (
                             <button
                                 key={g.id}
                                 onClick={() => setCustomThemeDetails(customColor, g.id)}
                                 className="btn btn-sm rounded-pill"
                                 style={{
                                     border: customGradient === g.id && accent === 'custom' ? '2px solid var(--primary)' : '1px solid var(--card-border)',
                                     background: customGradient === g.id && accent === 'custom' ? 'var(--primary-glow)' : 'transparent',
                                     color: 'var(--text-color)',
                                     fontWeight: 500
                                 }}
                             >
                                 {g.label}
                             </button>
                         ))}
                     </div>
                  </div>
                </div>
             </>
          )}

          {activeTab === 'backgrounds' && (
              <div>
                  <h6 className="fw-bold mb-3 text-muted text-uppercase" style={{ fontSize: '0.7rem', letterSpacing: '1px' }}>Background Image</h6>
                  <button 
                      className="btn btn-outline-danger w-100 mb-4"
                      onClick={() => setBackgroundImage('')}
                      style={{ borderStyle: 'dashed' }}
                  >
                      ✖ Remove Background Image
                  </button>

                  <div className="row g-2">
                      {BACKGROUNDS.map((url, i) => {
                          const isSelected = bgImage === url;
                          return (
                              <div className="col-4" key={i}>
                                  <div 
                                      onClick={() => setBackgroundImage(url)}
                                      style={{
                                          width: '100%',
                                          paddingTop: '60%', // Aspect ratio
                                          backgroundImage: `url(${url})`,
                                          backgroundSize: 'cover',
                                          backgroundPosition: 'center',
                                          borderRadius: '8px',
                                          cursor: 'pointer',
                                          border: isSelected ? '3px solid var(--primary)' : '2px solid transparent',
                                          boxShadow: isSelected ? '0 0 15px var(--primary-glow)' : 'none',
                                          transition: 'all 0.2s'
                                      }}
                                  >
                                      {isSelected && (
                                          <div style={{ position: 'absolute', top: 4, right: 4, background: 'var(--primary)', color: 'white', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12 }}>✓</div>
                                      )}
                                  </div>
                              </div>
                          )
                      })}
                  </div>
              </div>
          )}

        </div>

        {/* Footer */}
        <div className="p-4 border-top border-secondary border-opacity-25 d-flex justify-content-end">
          <button className="btn btn-primary px-4" onClick={onClose}>Done</button>
        </div>
      </div>
    </div>
  )
}

export default SettingsPanel
