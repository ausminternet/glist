import * as Haptics from 'expo-haptics'
import { type Href, useRouter } from 'expo-router'
import { type SFSymbol, SymbolView } from 'expo-symbols'
import {
  type FC,
  type PropsWithChildren,
  type ReactNode,
  useState,
} from 'react'
import { type ColorValue, Text, View } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import { colors } from './colors'
import { ListItemDivider } from './list-item-divider.component'

type BaseListItemProps = {
  afterTitle?: ReactNode
  subtitle?: string | ReactNode
  onPress?: () => void
  href?: Href
  icon?: SFSymbol
  right?: ReactNode
  iconTintColor?: ColorValue
  iconSize?: number
  chevron?: boolean
  compact?: boolean
  children?: string
}

type WithCheckbox = BaseListItemProps & {
  onToggleCheckbox: (newValue: boolean) => void
  checked: boolean
  left?: never
}

type WithLeft = BaseListItemProps & {
  left?: ReactNode
  onToggleCheckbox?: never
  checked?: never
}

export type ListItemProps = WithCheckbox | WithLeft

export const ListItem: FC<PropsWithChildren<ListItemProps>> = ({
  afterTitle,
  subtitle,
  onPress,
  href,
  right,
  left,
  icon,
  iconTintColor = colors.label.secondary,
  iconSize = 32,
  chevron = true,
  onToggleCheckbox,
  checked,
  compact,
  children,
}) => {
  const router = useRouter()
  const [pressed, setPressed] = useState(false)

  const handleOnPress = () => {
    if (onPress) {
      onPress()
    } else if (href) {
      router.push(href)
    }
  }

  const shouldIndicatePress = !!onPress || !!href
  const insetSeparator = !!left || !!icon || !!onToggleCheckbox

  return (
    <Pressable
      style={{
        backgroundColor:
          pressed && shouldIndicatePress ? colors.gray.gray4 : 'transparent',
        paddingInline: 16,
        paddingBlockStart: 1,
        marginBlockEnd: -1,
        zIndex: pressed ? 1 : 0,
      }}
      onPress={handleOnPress}
      onPressIn={() => setPressed(true)}
      onPressOut={() => setPressed(false)}
    >
      <View
        style={{
          justifyContent: 'space-between',
          alignItems: 'center',
          flexDirection: 'row',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: onToggleCheckbox ? 0 : 12,
          }}
        >
          {!!onToggleCheckbox && (
            <Pressable
              onPress={() => {
                onToggleCheckbox(!checked)
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
              }}
              style={{
                width: 52,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                paddingInlineEnd: 8,
                marginInlineStart: -8,
              }}
            >
              <SymbolView
                name={checked ? 'checkmark.circle.fill' : 'circle'}
                size={32}
                tintColor={checked ? colors.system.blue : colors.label.tertiary}
              />
            </Pressable>
          )}

          {(left || icon) && !onToggleCheckbox && (
            <View
              style={{
                minWidth: 32,
                width: iconSize,
                paddingBlock: iconSize * 0.25,
              }}
            >
              {icon ? (
                <SymbolView
                  name={icon}
                  size={iconSize}
                  tintColor={iconTintColor}
                />
              ) : (
                left
              )}
            </View>
          )}
          <View
            style={{
              justifyContent: 'center',
              gap: 6,
              paddingBlock: 14,
            }}
          >
            <View
              style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}
            >
              <Text
                style={{
                  fontSize: compact ? 15 : 17,
                  fontWeight: compact ? '600' : 'normal',
                  textDecorationLine: checked ? 'line-through' : undefined,
                  color: checked ? colors.label.tertiary : colors.label.primary,
                }}
              >
                {children}
              </Text>
              {afterTitle}
            </View>

            {subtitle && typeof subtitle === 'string' ? (
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 15,
                  maxWidth: 200,
                  color: colors.label.secondary,
                }}
              >
                {subtitle}
              </Text>
            ) : (
              subtitle
            )}
          </View>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 8,
            paddingBlock: 14,
          }}
        >
          {typeof right === 'string' || typeof right === 'number' ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 17,
                color: colors.label.secondary,
                maxWidth: 170,
              }}
            >
              {right}
            </Text>
          ) : (
            right
          )}

          {href && chevron && (
            <SymbolView
              name="chevron.right"
              size={12}
              weight="bold"
              tintColor={colors.label.tertiary}
            />
          )}
        </View>
      </View>
      <ListItemDivider
        inset={insetSeparator}
        pressed={pressed && shouldIndicatePress}
      />
    </Pressable>
  )
}
