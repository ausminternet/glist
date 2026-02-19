import type { FC, PropsWithChildren } from 'react'
import { type ColorValue, View, type ViewProps } from 'react-native'
import { colors } from './colors'

export interface ListProps extends PropsWithChildren<ViewProps> {
  type?: 'inset' | 'plain'
  backgroundColor?: ColorValue
}

export const List: FC<ListProps> = ({
  children,
  style,
  type = 'inset',
  backgroundColor = colors.groupedBackground.secondary,
  ...rest
}) => {
  return (
    <View
      style={[
        style,
        {
          marginInline: type === 'inset' ? 16 : 0,
          borderRadius: type === 'inset' ? 28 : 0,
          backgroundColor,
          overflow: 'hidden',
        },
      ]}
      {...rest}
    >
      {children}
    </View>
  )
}
