import { type ComponentProps, useEffect, useState } from 'react'
import { type BlurEvent, TextInput } from 'react-native'
import { DefaultInputStyles } from './list-item-input'

export interface DecimalInputProps
  extends Omit<ComponentProps<typeof TextInput>, 'onChange' | 'value'> {
  value: number | undefined
  onChange: (value: number | undefined) => void
  normalize?: boolean
}

const format = (value: number | undefined, normalize: boolean) => {
  if (value == null || Number.isNaN(value)) return ''
  return normalize
    ? value.toFixed(2).replace('.', ',')
    : value.toString().replace('.', ',')
}

export const DecimalInput: React.FC<DecimalInputProps> = ({
  value,
  onChange,
  style,
  onBlur,
  onFocus,
  normalize = false,
  ...rest
}) => {
  const [text, setText] = useState(value?.toString().replace('.', ',') || '')
  const [isFocused, setIsFocused] = useState(false)

  useEffect(() => {
    if (isFocused) return
    setText(format(value, normalize))
  }, [value, normalize, isFocused])

  const handleOnChange = (input: string) => {
    const regex = /^\d*([.,]\d{0,2})?$/
    if (!regex.test(input)) return

    setText(input)

    const parsed = parseFloat(input.replace(',', '.'))
    onChange(Number.isNaN(parsed) ? undefined : parsed)
  }

  const handleOnBlur = (e: BlurEvent) => {
    setIsFocused(false)

    if (!text) {
      onBlur?.(e)
      return
    }

    const parsed = parseFloat(text.replace(',', '.'))

    if (Number.isNaN(parsed)) {
      setText('')
      onChange(undefined)
      onBlur?.(e)
      return
    }

    if (!normalize) {
      onBlur?.(e)
      return
    }

    const normalized = format(parsed, true)

    setText(normalized)
    onBlur?.(e)
  }

  return (
    <TextInput
      value={text}
      onChangeText={handleOnChange}
      onBlur={handleOnBlur}
      onFocus={(e) => {
        setIsFocused(true)
        onFocus?.(e)
      }}
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
