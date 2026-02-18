import { PlatformColor } from 'react-native'

export const colors = {
  label: {
    primary: PlatformColor('label'),
    secondary: PlatformColor('secondaryLabel'),
    tertiary: PlatformColor('tertiaryLabel'),
    quaternary: PlatformColor('quaternaryLabel'),
    placeholder: PlatformColor('placeholderText'),
    link: PlatformColor('link'),
    dark: PlatformColor('darkText'),
    light: PlatformColor('lightText'),
  },

  fill: {
    primary: PlatformColor('systemFill'),
    secondary: PlatformColor('secondarySystemFill'),
    tertiary: PlatformColor('tertiarySystemFill'),
    quaternary: PlatformColor('quaternarySystemFill'),
  },

  background: {
    primary: PlatformColor('systemBackground'),
    secondary: PlatformColor('secondarySystemBackground'),
    tertiary: PlatformColor('tertiarySystemBackground'),
  },

  groupedBackground: {
    primary: PlatformColor('systemGroupedBackground'),
    secondary: PlatformColor('secondarySystemGroupedBackground'),
    tertiary: PlatformColor('tertiarySystemGroupedBackground'),
  },

  separator: {
    default: PlatformColor('separator'),
    opaque: PlatformColor('opaqueSeparator'),
  },

  system: {
    blue: PlatformColor('systemBlue'),
    brown: PlatformColor('systemBrown'),
    cyan: PlatformColor('systemCyan'),
    green: PlatformColor('systemGreen'),
    indigo: PlatformColor('systemIndigo'),
    mint: PlatformColor('systemMint'),
    orange: PlatformColor('systemOrange'),
    pink: PlatformColor('systemPink'),
    purple: PlatformColor('systemPurple'),
    red: PlatformColor('systemRed'),
    teal: PlatformColor('systemTeal'),
    yellow: PlatformColor('systemYellow'),
  },

  gray: {
    gray1: PlatformColor('systemGray'),
    gray2: PlatformColor('systemGray2'),
    gray3: PlatformColor('systemGray3'),
    gray4: PlatformColor('systemGray4'),
    gray5: PlatformColor('systemGray5'),
    gray6: PlatformColor('systemGray6'),
  },
} as const
