import * as Haptics from 'expo-haptics'
import { type Href, useRouter } from 'expo-router'
import { type SFSymbol, SymbolView } from 'expo-symbols'
import { type FC, type ReactNode, useState } from 'react'
import { type ColorValue, PlatformColor, Text, View } from 'react-native'
import { Pressable } from 'react-native-gesture-handler'
import { ListItemDivider } from './list-item-divider.component'

export interface ListItemProps {
  title: string
  afterTitle?: ReactNode
  subtitle?: string | ReactNode
  onPress?: () => void
  href?: Href
  left?: ReactNode
  icon?: SFSymbol
  right?: ReactNode
  iconTintColor?: ColorValue
  iconSize?: number
  chevron?: boolean
  checkbox?: boolean
  onToggleCheckbox?: (newValue: boolean) => void
  checked?: boolean
  compact?: boolean
}

export const ListItem: FC<ListItemProps> = ({
  title,
  afterTitle,
  subtitle,
  onPress,
  href,
  right,
  left,
  icon,
  iconTintColor = PlatformColor('secondaryLabel'),
  iconSize = 32,
  chevron = true,
  onToggleCheckbox,
  checked,
  compact,
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
      style={({ pressed }) => ({
        backgroundColor:
          pressed && shouldIndicatePress
            ? PlatformColor('systemGray5')
            : 'transparent',
        paddingHorizontal: 16,
        paddingBlockStart: 1,
        marginBottom: -1,
        zIndex: pressed ? 1 : 0,
      })}
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
                tintColor={
                  checked
                    ? PlatformColor('systemBlue')
                    : PlatformColor('tertiaryLabelColor')
                }
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
              paddingVertical: 14,
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
                  color: checked
                    ? PlatformColor('tertiaryLabelColor')
                    : PlatformColor('labelColor'),
                }}
              >
                {title}
              </Text>
              {afterTitle}
            </View>

            {subtitle && typeof subtitle === 'string' ? (
              <Text
                numberOfLines={2}
                style={{
                  fontSize: 15,
                  maxWidth: 200,
                  color: PlatformColor('secondaryLabelColor'),
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
            paddingVertical: 14,
          }}
        >
          {(right && typeof right === 'string') || typeof right === 'number' ? (
            <Text
              numberOfLines={1}
              style={{
                fontSize: 17,
                color: PlatformColor('secondaryLabelColor'),
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
              tintColor={PlatformColor('tertiaryLabelColor')}
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
