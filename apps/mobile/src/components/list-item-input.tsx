import type { FC } from 'react'
import { PlatformColor, StyleSheet, TextInput } from 'react-native'
import { colors } from './colors'
import {
  ListItemInputContainer,
  type ListItemInputContainerProps,
} from './list-item-input-container'

export interface ListItemInputProps extends ListItemInputContainerProps {
  inputProps: React.ComponentProps<typeof TextInput>
}

export const ListItemInput: FC<ListItemInputProps> = ({
  inputProps,
  ...rest
}) => {
  const { style, ...restInputProps } = inputProps
  return (
    <ListItemInputContainer {...rest}>
      <TextInput
        style={[DefaultInputStyles.input, style]}
        placeholderTextColor={PlatformColor('placeholderText')}
        {...restInputProps}
      />
    </ListItemInputContainer>
  )
}

export const DefaultInputStyles = StyleSheet.create({
  input: {
    fontSize: 17,
    flexGrow: 1,
    paddingVertical: 12,
    color: colors.label.primary,
  },
})
