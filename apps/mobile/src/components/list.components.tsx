import type { FC, PropsWithChildren } from 'react'
import { StyleSheet, View, type ViewProps } from 'react-native'
import { colors } from './colors'

type ListProps = PropsWithChildren<ViewProps>

export const List: FC<ListProps> = ({ children, style, ...rest }) => {
  return (
    <View style={[Styles.container, style]} {...rest}>
      {children}
    </View>
  )
}

const Styles = StyleSheet.create({
  container: {
    borderRadius: 28,
    overflow: 'hidden',
    backgroundColor: colors.groupedBackground.secondary,
  },
})
