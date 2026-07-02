import { useState, useEffect } from 'react'
import { THEMES } from './themes'
import { ThemeContext } from './ThemeContextValue'
import { generateCustomTheme } from '../utils/colorUtils'

function applyTheme(themeId, mode, customColorHex, customGradientType) {
  let theme;
  if (themeId === 'custom' && customColorHex) {
      theme = generateCustomTheme(customColorHex, customGradientType);
  } else {
      theme = THEMES.find(t => t.id === themeId) || THEMES[0];
  }

  const colors = mode === 'dark' ? theme.dark : theme.light
  const root = document.documentElement

  root.setAttribute('data-theme', mode)

  // Accent
  root.style.setProperty('--primary', theme.primary)
  root.style.setProperty('--primary-hover', theme.primaryHover)
  root.style.setProperty('--primary-gradient', theme.gradient)
  root.style.setProperty('--primary-glow', theme.glow)
  
  // Smart text color for buttons
  const textContrast = theme.textContrast || '#ffffff'
  root.style.setProperty('--primary-text', textContrast)

  // Full background palette
  root.style.setProperty('--bg-color', colors.bg)
  root.style.setProperty('--bg-secondary', colors.bgSecondary)
  
  // Adjust card opacity if an image is present
  const hasBgImage = !!localStorage.getItem('theme-bg-image')
  if (hasBgImage) {
      // Increase opacity of cards when a background image is present for readability
      const isDark = mode === 'dark';
      root.style.setProperty('--card-bg', isDark ? 'rgba(10, 12, 20, 0.85)' : 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--card-border', isDark ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)');
  } else {
      root.style.setProperty('--card-bg', colors.cardBg)
      root.style.setProperty('--card-border', colors.cardBorder)
  }

  root.style.setProperty('--blob1', colors.blob1)
  root.style.setProperty('--blob2', colors.blob2)

  // Text
  const textColor = mode === 'dark' ? '#f1f5f9' : '#0f172a'
  const textMuted = mode === 'dark' ? '#94a3b8' : '#64748b'
  root.style.setProperty('--text-color', textColor)
  root.style.setProperty('--text-muted', textMuted)
  
  // Close button filter (so btn-close is visible in both modes)
  root.style.setProperty('--btn-close-filter', mode === 'dark' ? 'invert(1)' : 'none')
}

function ThemeProvider({ children }) {
  const [mode, setMode]     = useState(localStorage.getItem('theme-mode')   || 'dark')
  const [accent, setAccent] = useState(localStorage.getItem('theme-accent') || 'indigo')
  
  // Custom theme states
  const [customColor, setCustomColor] = useState(localStorage.getItem('theme-custom-color') || '#ff0055')
  const [customGradient, setCustomGradient] = useState(localStorage.getItem('theme-custom-gradient') || 'diagonal')

  // Background Image state
  const [bgImage, setBgImage] = useState(localStorage.getItem('theme-bg-image') || '')

  useEffect(() => {
    applyTheme(accent, mode, customColor, customGradient)
    
    // Apply background image to body
    if (bgImage) {
        document.body.style.backgroundImage = `linear-gradient(to bottom, rgba(0,0,0,${mode==='dark'?0.8:0.2}), rgba(0,0,0,${mode==='dark'?0.9:0.4})), url(${bgImage})`
        document.body.style.backgroundSize = 'cover'
        document.body.style.backgroundPosition = 'center'
        document.body.style.backgroundAttachment = 'fixed'
    } else {
        document.body.style.backgroundImage = 'none'
    }
  }, [mode, accent, customColor, customGradient, bgImage])

  const setThemeMode = (newMode) => {
    setMode(newMode)
    localStorage.setItem('theme-mode', newMode)
  }

  const setThemeAccent = (newAccent) => {
    setAccent(newAccent)
    localStorage.setItem('theme-accent', newAccent)
  }

  const setCustomThemeDetails = (hex, gradient) => {
    setCustomColor(hex)
    setCustomGradient(gradient)
    localStorage.setItem('theme-custom-color', hex)
    localStorage.setItem('theme-custom-gradient', gradient)
    if (accent !== 'custom') {
        setThemeAccent('custom')
    }
  }

  const setBackgroundImage = (url) => {
      setBgImage(url)
      if (url) {
          localStorage.setItem('theme-bg-image', url)
      } else {
          localStorage.removeItem('theme-bg-image')
      }
  }

  return (
    <ThemeContext.Provider value={{ 
        mode, accent, setThemeMode, setThemeAccent, themes: THEMES,
        customColor, customGradient, setCustomThemeDetails,
        bgImage, setBackgroundImage
    }}>
      {children}
    </ThemeContext.Provider>
  )
}

export default ThemeProvider
