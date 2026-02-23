import { type ComponentProps, useEffect, useRef, useState } from 'react'
import { TextInput } from 'react-native'
import { DefaultInputStyles } from './list-item-input'

export interface DecimalInputProps
  extends Omit<ComponentProps<typeof TextInput>, 'onChange' | 'value'> {
  value: number | undefined
  onChange: (value: number | undefined) => void
}

export const DecimalInput: React.FC<DecimalInputProps> = ({
  value,
  onChange,
  style,
  ...rest
}) => {
  const [text, setText] = useState(value?.toString().replace('.', ',') || '')
  const inputRef = useRef<TextInput>(null)

  useEffect(() => {
    setText(value?.toString().replace('.', ',') || '')
  }, [value])

  const handleOnChange = (input: string) => {
    const regex = /^\d*([.,]\d{0,2})?$/
    if (!regex.test(input)) return

    setText(input)

    const parsed = parseFloat(input.replace(',', '.'))
    onChange(Number.isNaN(parsed) ? undefined : parsed)
  }

  return (
    <TextInput
      ref={inputRef}
      value={text}
      onChangeText={handleOnChange}
      placeholder="0,00"
      keyboardType="decimal-pad"
      returnKeyType="done"
      maxLength={20}
      selectTextOnFocus
      style={[DefaultInputStyles.input, style]}
      {...rest}
    />
  )
}
