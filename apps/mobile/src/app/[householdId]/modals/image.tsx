import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { Image, View } from 'react-native'

export default function ImageModal() {
  const { imageUrl, inventoryItemId, shoppingListItemId } =
    useLocalSearchParams<{
      imageUrl: string
      inventoryItemId?: string
      shoppingListItemId?: string
    }>()

  const router = useRouter()

  if (!imageUrl) {
    router.back()
  }

  return (
    <>
      <Stack.Screen
        options={{
          headerShown: true,
          headerTransparent: true,
          title: '',
          headerBackButtonDisplayMode: 'minimal',
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: 'Schließen',
              icon: {
                type: 'sfSymbol',
                name: 'multiply',
              },
              onPress: () => router.back(),
            },
          ],
        }}
      />
      <View
        style={{
          flex: 1,
          // backgroundColor: 'black',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <Image
          source={{ uri: imageUrl }}
          style={{ width: '100%', height: '100%', resizeMode: 'contain' }}
        />
      </View>
    </>
  )
}
