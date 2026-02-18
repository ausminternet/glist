import type { FC } from 'react'
import { View } from 'react-native'
import { colors } from './colors'

export interface ListItemDividerProps {
  inset?: boolean
  pressed?: boolean
}

export const ListItemDivider: FC<ListItemDividerProps> = ({
  inset,
  pressed,
}) => {
  return (
    <View
      style={{
        opacity: pressed ? 0 : 1,
        marginInlineStart: inset ? 44 : 0,
        height: 1,
        backgroundColor: colors.separator.default,
      }}
    />
  )
}
