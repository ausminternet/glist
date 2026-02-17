import type { FC } from 'react'
import {
  type StyleProp,
  StyleSheet,
  Text,
  View,
  type ViewStyle,
} from 'react-native'

export interface ListEmptyComponentProps {
  title: string
  message: string
  style?: StyleProp<ViewStyle>
}
export const ListEmptyComponent: FC<ListEmptyComponentProps> = ({
  title,
  message,
  style,
}) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: '50%',
  },
  title: { fontSize: 24, color: '#6B7280', textAlign: 'center' },
  message: {
    fontSize: 20,
    color: '#9CA3AF',
    textAlign: 'center',
    marginTop: 8,
  },
})
