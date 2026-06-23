import { useContext } from 'react'
import { ThemeContext } from './ThemeContextValue'

export const THEMES = [
  {
    id: 'indigo', name: 'Indigo', emoji: '💜',
    primary: '#818cf8', primaryHover: '#6366f1',
    gradient: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
    glow: 'rgba(99,102,241,0.3)',
    dark:  { bg: '#0d0e1a', bgSecondary: '#12142b', cardBg: 'rgba(20,22,58,0.75)',  cardBorder: 'rgba(99,102,241,0.18)', blob1: 'rgba(99,102,241,0.18)', blob2: 'rgba(139,92,246,0.12)' },
    light: { bg: '#eef0ff', bgSecondary: '#e0e3ff', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(99,102,241,0.2)',  blob1: 'rgba(99,102,241,0.12)', blob2: 'rgba(139,92,246,0.08)' },
  },
  {
    id: 'ocean', name: 'Ocean', emoji: '🌊',
    primary: '#38bdf8', primaryHover: '#0ea5e9',
    gradient: 'linear-gradient(135deg, #0ea5e9, #06b6d4)',
    glow: 'rgba(14,165,233,0.3)',
    dark:  { bg: '#060f1a', bgSecondary: '#0a1a2e', cardBg: 'rgba(8,25,55,0.8)',    cardBorder: 'rgba(14,165,233,0.18)', blob1: 'rgba(14,165,233,0.18)', blob2: 'rgba(6,182,212,0.12)'  },
    light: { bg: '#e0f7ff', bgSecondary: '#bff0ff', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(14,165,233,0.2)',  blob1: 'rgba(14,165,233,0.12)', blob2: 'rgba(6,182,212,0.08)'  },
  },
  {
    id: 'forest', name: 'Forest', emoji: '🌲',
    primary: '#34d399', primaryHover: '#10b981',
    gradient: 'linear-gradient(135deg, #10b981, #34d399)',
    glow: 'rgba(16,185,129,0.3)',
    dark:  { bg: '#030f0a', bgSecondary: '#061a0f', cardBg: 'rgba(5,25,15,0.8)',    cardBorder: 'rgba(16,185,129,0.18)', blob1: 'rgba(16,185,129,0.18)', blob2: 'rgba(52,211,153,0.1)'  },
    light: { bg: '#e0fff4', bgSecondary: '#c0ffe6', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(16,185,129,0.2)',  blob1: 'rgba(16,185,129,0.12)', blob2: 'rgba(52,211,153,0.08)' },
  },
  {
    id: 'sunset', name: 'Sunset', emoji: '🌅',
    primary: '#fb923c', primaryHover: '#f97316',
    gradient: 'linear-gradient(135deg, #f97316, #fb923c)',
    glow: 'rgba(249,115,22,0.3)',
    dark:  { bg: '#160800', bgSecondary: '#261200', cardBg: 'rgba(38,18,0,0.8)',    cardBorder: 'rgba(249,115,22,0.18)', blob1: 'rgba(249,115,22,0.18)', blob2: 'rgba(251,146,60,0.1)'  },
    light: { bg: '#fff3e0', bgSecondary: '#ffe0c0', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(249,115,22,0.2)',  blob1: 'rgba(249,115,22,0.12)', blob2: 'rgba(251,146,60,0.08)' },
  },
  {
    id: 'rose', name: 'Rose', emoji: '🌸',
    primary: '#fb7185', primaryHover: '#f43f5e',
    gradient: 'linear-gradient(135deg, #f43f5e, #fb7185)',
    glow: 'rgba(244,63,94,0.3)',
    dark:  { bg: '#160009', bgSecondary: '#250010', cardBg: 'rgba(35,0,15,0.8)',    cardBorder: 'rgba(244,63,94,0.18)', blob1: 'rgba(244,63,94,0.18)', blob2: 'rgba(251,113,133,0.1)' },
    light: { bg: '#fff0f3', bgSecondary: '#ffd6df', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(244,63,94,0.2)',  blob1: 'rgba(244,63,94,0.12)', blob2: 'rgba(251,113,133,0.08)'},
  },
  {
    id: 'amber', name: 'Amber', emoji: '✨',
    primary: '#fbbf24', primaryHover: '#f59e0b',
    gradient: 'linear-gradient(135deg, #f59e0b, #fbbf24)',
    glow: 'rgba(245,158,11,0.3)',
    dark:  { bg: '#130c00', bgSecondary: '#221500', cardBg: 'rgba(35,22,0,0.8)',    cardBorder: 'rgba(245,158,11,0.18)', blob1: 'rgba(245,158,11,0.18)', blob2: 'rgba(251,191,36,0.1)' },
    light: { bg: '#fffbea', bgSecondary: '#fff3c0', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(245,158,11,0.2)',  blob1: 'rgba(245,158,11,0.12)', blob2: 'rgba(251,191,36,0.08)'},
  },
  {
    id: 'violet', name: 'Violet', emoji: '🔮',
    primary: '#c084fc', primaryHover: '#a855f7',
    gradient: 'linear-gradient(135deg, #a855f7, #c084fc)',
    glow: 'rgba(168,85,247,0.3)',
    dark:  { bg: '#0f0318', bgSecondary: '#1a0828', cardBg: 'rgba(22,5,40,0.8)',    cardBorder: 'rgba(168,85,247,0.18)', blob1: 'rgba(168,85,247,0.18)', blob2: 'rgba(192,132,252,0.1)' },
    light: { bg: '#f5eeff', bgSecondary: '#e9d8ff', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(168,85,247,0.2)',  blob1: 'rgba(168,85,247,0.12)', blob2: 'rgba(192,132,252,0.08)'},
  },
  {
    id: 'crimson', name: 'Crimson', emoji: '🔥',
    primary: '#f87171', primaryHover: '#dc2626',
    gradient: 'linear-gradient(135deg, #dc2626, #ef4444)',
    glow: 'rgba(220,38,38,0.3)',
    dark:  { bg: '#150000', bgSecondary: '#240000', cardBg: 'rgba(40,0,0,0.8)',     cardBorder: 'rgba(220,38,38,0.18)', blob1: 'rgba(220,38,38,0.2)',  blob2: 'rgba(239,68,68,0.1)'  },
    light: { bg: '#fff0f0', bgSecondary: '#ffd4d4', cardBg: 'rgba(255,255,255,0.8)', cardBorder: 'rgba(220,38,38,0.2)',  blob1: 'rgba(220,38,38,0.12)', blob2: 'rgba(239,68,68,0.08)' },
  },
]

export function useTheme() {
  return useContext(ThemeContext)
}
