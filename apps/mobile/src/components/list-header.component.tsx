import type { FC, PropsWithChildren } from 'react'
import { Text } from 'react-native'
import { colors } from './colors'

export const ListHeader: FC<PropsWithChildren> = ({ children }) => {
  return (
    <Text
      style={{
        fontSize: 18,
        marginBlockStart: 8,
        marginBlockEnd: 16,
        paddingLeft: 20,
        fontWeight: 'bold',
        color: colors.label.primary,
      }}
    >
      {children}
    </Text>
  )
}
