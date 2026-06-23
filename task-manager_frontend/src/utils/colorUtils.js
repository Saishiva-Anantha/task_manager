// Convert hex to rgb
export function hexToRgb(hex) {
    let r = 0, g = 0, b = 0;
    if (hex.length === 4) {
      r = parseInt(hex[1] + hex[1], 16);
      g = parseInt(hex[2] + hex[2], 16);
      b = parseInt(hex[3] + hex[3], 16);
    } else if (hex.length === 7) {
      r = parseInt(hex.substring(1, 3), 16);
      g = parseInt(hex.substring(3, 5), 16);
      b = parseInt(hex.substring(5, 7), 16);
    }
    return { r, g, b };
}

// Convert rgb to hex
export function rgbToHex(r, g, b) {
    return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
}

// Darken or lighten color
export function adjustBrightness(hex, percent) {
    const { r, g, b } = hexToRgb(hex);
    const adjust = (c) => Math.max(0, Math.min(255, c + Math.round(255 * (percent / 100))));
    return rgbToHex(adjust(r), adjust(g), adjust(b));
}

// Mix two colors
export function mixColors(hex1, hex2, weight) {
    const c1 = hexToRgb(hex1);
    const c2 = hexToRgb(hex2);
    const w = weight / 100;
    const mix = (c1, c2) => Math.round(c1 * w + c2 * (1 - w));
    return rgbToHex(mix(c1.r, c2.r), mix(c1.g, c2.g), mix(c1.b, c2.b));
}

// Calculate luminance to decide text color (black or white)
export function getContrastTextColor(hex) {
    const { r, g, b } = hexToRgb(hex);
    // Relative luminance formula
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// Generate full theme palette from a single hex color
export function generateCustomTheme(hex, gradientType = 'diagonal') {
    const primaryHover = adjustBrightness(hex, -15);
    const primaryLight = adjustBrightness(hex, 15);
    const { r, g, b } = hexToRgb(hex);
    
    let gradient;
    switch (gradientType) {
        case 'top-bottom': gradient = `linear-gradient(to bottom, ${primaryLight}, ${hex})`; break;
        case 'left-right': gradient = `linear-gradient(to right, ${hex}, ${primaryHover})`; break;
        case 'radial':     gradient = `radial-gradient(circle, ${primaryLight}, ${hex})`; break;
        case 'diagonal':
        default:           gradient = `linear-gradient(135deg, ${primaryHover}, ${primaryLight})`; break;
    }

    return {
        id: 'custom',
        name: 'Custom',
        emoji: '🎨',
        primary: hex,
        primaryHover: primaryHover,
        gradient: gradient,
        glow: `rgba(${r},${g},${b},0.35)`,
        textContrast: getContrastTextColor(hex),
        dark: {
            bg: mixColors(hex, '#080808', 5), // Tint pure dark with 5% of primary color
            bgSecondary: mixColors(hex, '#111111', 8),
            cardBg: `rgba(${r},${g},${b}, 0.05)`, // Very transparent primary on cards
            cardBorder: `rgba(${r},${g},${b}, 0.2)`,
            blob1: `rgba(${r},${g},${b}, 0.15)`,
            blob2: `rgba(${Math.min(255, r+40)},${Math.max(0, g-20)},${b}, 0.1)`,
        },
        light: {
            bg: mixColors(hex, '#ffffff', 5), // Tint pure white with 5% primary
            bgSecondary: mixColors(hex, '#f5f5f5', 8),
            cardBg: `rgba(255,255,255, 0.8)`,
            cardBorder: `rgba(${r},${g},${b}, 0.3)`,
            blob1: `rgba(${r},${g},${b}, 0.15)`,
            blob2: `rgba(${Math.min(255, r+40)},${Math.max(0, g-20)},${b}, 0.1)`,
        }
    };
}
