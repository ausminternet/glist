import type { FC } from 'react'
import { PlatformColor, View } from 'react-native'

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
        backgroundColor: PlatformColor('separator'),
      }}
    />
  )
}
