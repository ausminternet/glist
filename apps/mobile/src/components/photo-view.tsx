import { useRouter } from 'expo-router'
import { SymbolView } from 'expo-symbols'
import { Image, Pressable } from 'react-native'
import { useHouseholdId } from '@/hooks/use-household-id'

export interface PhotoViewProps {
  url: string
  width?: number
  height?: number
  onDelete?: () => void
}

export function PhotoView({
  url,
  width = 50,
  height = 50,
  onDelete,
}: PhotoViewProps) {
  const router = useRouter()
  const householdId = useHouseholdId()
  return (
    <Pressable
      style={{ position: 'relative' }}
      onPress={() =>
        router.push(
          `/${householdId}/modals/image?imageUrl=${encodeURIComponent(url)}`,
        )
      }
    >
      {onDelete && (
        <Pressable
          onPress={(e) => {
            e.stopPropagation()
            onDelete()
          }}
          style={{
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 10,
            padding: 4,
          }}
        >
          <SymbolView
            name="multiply.circle.fill"
            colors={['black', 'white']}
            type="palette"
          />
        </Pressable>
      )}

      <Image
        source={{ uri: url }}
        style={{
          width,
          height,
          resizeMode: 'cover',
          borderRadius: 8,
        }}
      />
    </Pressable>
  )
}
