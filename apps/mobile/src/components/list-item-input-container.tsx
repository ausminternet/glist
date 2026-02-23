import { type SFSymbol, SymbolView } from 'expo-symbols'
import type { FC, PropsWithChildren } from 'react'
import { type ColorValue, View } from 'react-native'
import { colors } from './colors'
import { ListItemDivider } from './list-item-divider.component'

export interface ListItemInputContainerProps {
  icon?: SFSymbol
  iconTintColor?: ColorValue
  iconSize?: number
}

export const ListItemInputContainer: FC<
  PropsWithChildren<ListItemInputContainerProps>
> = ({
  children,
  icon,
  iconTintColor = colors.label.secondary,
  iconSize = 32,
}) => {
  return (
    <View
      style={{
        paddingInline: 16,
        paddingBlockStart: 1,
        marginBlockEnd: -1,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          minHeight: 52,
        }}
      >
        {icon && (
          <View style={{ width: 32 }}>
            <SymbolView name={icon} size={iconSize} tintColor={iconTintColor} />
          </View>
        )}
        {children}
      </View>
      <ListItemDivider />
    </View>
  )
}
