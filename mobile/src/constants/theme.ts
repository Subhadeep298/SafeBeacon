// Black & Green Theme Colors
// Professional Green & Black Theme
export const COLORS = {
    // Primary Colors
    black: '#000000',
    darkGray: '#121212',
    mediumGray: '#1E1E1E',
    lightGray: '#2D2D2D',
    surface: '#1E1E1E',

    // Green Accent Colors (Emerald/Forest)
    neonGreen: '#10B981', // Emerald 500 - Main accent
    brightGreen: '#34D399', // Emerald 400 - Lighter accent
    limeGreen: '#059669', // Emerald 600 - Darker accent
    darkGreen: '#065F46', // Emerald 800 - Deep background accent

    // Text Colors
    white: '#FFFFFF',
    lightText: '#E5E7EB', // Gray 200
    mutedText: '#9CA3AF', // Gray 400

    // Status Colors
    success: '#10B981',
    danger: '#EF4444',
    warning: '#F59E0B',

    // Transparent
    transparent: 'transparent',
    overlay: 'rgba(0, 0, 0, 0.7)',
} as const;

export const SIZES = {
    // Font Sizes
    h1: 32,
    h2: 24,
    h3: 20,
    h4: 18,
    body: 16,
    small: 14,
    tiny: 12,

    // Spacing
    padding: 16,
    margin: 16,
    radius: 12,

    // Button
    buttonHeight: 56,
    iconSize: 24,
} as const;

export const FONTS = {
    regular: 'System',
    medium: 'System',
    bold: 'System',
    semiBold: 'System',
} as const;

export const SHADOWS = {
    small: {
        shadowColor: COLORS.neonGreen,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    medium: {
        shadowColor: COLORS.neonGreen,
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.30,
        shadowRadius: 4.65,
        elevation: 8,
    },
    large: {
        shadowColor: COLORS.neonGreen,
        shadowOffset: {
            width: 0,
            height: 6,
        },
        shadowOpacity: 0.37,
        shadowRadius: 7.49,
        elevation: 12,
    },
} as const;
