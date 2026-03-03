import { Stack, useLocalSearchParams, useRouter } from 'expo-router'
import { useEffect, useState } from 'react'
import {
  Alert,
  Button,
  KeyboardAvoidingView,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native'
import { useCategories } from '@/api/categories'
import { useDeleteInventoryItem } from '@/api/inventory-items'
import { useShops } from '@/api/shops'
import { colors } from '@/components/colors'
import { DecimalInput } from '@/components/decimal-input'
import { List } from '@/components/list.components'
import { ListItem } from '@/components/list-item.component'
import { DefaultInputStyles, ListItemInput } from '@/components/list-item-input'
import { ListItemInputContainer } from '@/components/list-item-input-container'
import { NavbarCancelButton } from '@/components/navbar-cancel-button'
import { UnitSelector } from '@/components/unit-selector'
import { useHouseholdId } from '@/hooks/use-household-id'
import { useInventoryItemForm } from '@/hooks/use-inventory-item-form'
import { useSubmitInventoryItemForm } from '@/hooks/use-submit-inventory-item-form-submit'
import { centsToEuro, euroToCents } from '@/utils/currency'

export default function InventoryItemModal() {
  const [shouldClose, setShouldClose] = useState(false)

  const router = useRouter()
  const householdId = useHouseholdId()

  const { itemId } = useLocalSearchParams<{ itemId: string }>()
  const { shops } = useShops()
  const { categories } = useCategories()

  const {
    deleteInventoryItem,
    isPending: isDeletePending,
    isError: isDeleteError,
  } = useDeleteInventoryItem()

  const { submit, isSubmitting } = useSubmitInventoryItemForm()

  const { setValue, values, canSubmit, commit, isDirty, inventoryItem } =
    useInventoryItemForm(itemId)

  useEffect(() => {
    if (!isDeleteError) return
    Alert.alert('Fehler', 'Der Eintrag konnte nicht gelöscht werden.')
  }, [isDeleteError])

  const preventSubmit = isSubmitting || !canSubmit || isDeletePending
  const preventRemove = isDirty || isSubmitting || isDeletePending

  const handleDelete = () => {
    Alert.alert(
      'Eintrag löschen',
      'Möchtest du diesen Eintrag wirklich löschen?',
      [
        { text: 'Abbrechen', style: 'cancel' },
        {
          text: 'Löschen',
          style: 'destructive',
          onPress: () => {
            if (!inventoryItem) return
            deleteInventoryItem(inventoryItem.id)
            setShouldClose(true)
          },
        },
      ],
    )
  }

  const handleSubmit = async () => {
    const result = await submit(values, inventoryItem?.id)

    if (!result.ok) {
      Alert.alert(
        'Fehler',
        result.error?.type === 'add'
          ? 'Der Vorrat konnte nicht erstellt werden.'
          : 'Der Vorrat konnte nicht aktualisiert werden.',
      )
      return
    }

    commit()
    setShouldClose(true)
  }

  useEffect(() => {
    if (!shouldClose) return
    if (preventRemove) return

    router.back()
  }, [shouldClose, preventRemove, router.back])

  return (
    <>
      <Stack.Screen
        options={{
          title: inventoryItem ? 'Bearbeiten' : 'Neuer Vorrat',
          headerTransparent: true,
          headerLeft: () => (
            <NavbarCancelButton
              disabled={isSubmitting || isDeletePending}
              onCancel={() => router.back()}
              preventRemove={preventRemove}
            />
          ),
          unstable_headerRightItems: () => [
            {
              type: 'button',
              label: inventoryItem ? 'Speichern' : 'Erstellen',
              icon: {
                type: 'sfSymbol',
                name: 'checkmark',
              },
              variant: 'prominent',
              tintColor: colors.system.mint,
              disabled: preventSubmit,
              onPress: handleSubmit,
            },
          ],
        }}
      />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior="padding"
        keyboardVerticalOffset={64}
      >
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={{ flex: 1 }}
          contentContainerStyle={{
            gap: 24,
            flexDirection: 'column',
          }}
        >
          <List>
            <ListItemInputContainer>
              <TextInput
                placeholder="Milch"
                onChangeText={(text) => {
                  setValue('name', text)
                }}
                value={values.name}
                autoCorrect={false}
                autoCapitalize="none"
                autoFocus={!inventoryItem}
                style={[
                  DefaultInputStyles.input,
                  {
                    fontSize: 23,
                    fontWeight: 'bold',
                    color: colors.label.primary,
                  },
                ]}
              />
            </ListItemInputContainer>

            <ListItemInput
              inputProps={{
                placeholder: 'Notizen',
                onChangeText: (text) => setValue('description', text),
                value: values.description,
                multiline: true,
              }}
            />
          </List>

          <List>
            <ListItemInputContainer icon="plusminus" iconSize={24}>
              <Text
                style={{
                  fontSize: 17,
                  color: colors.label.primary,
                  flexGrow: 1,
                }}
              >
                Sollmenge
              </Text>

              <DecimalInput
                placeholder="3"
                keyboardType="decimal-pad"
                value={values.targetStock}
                onChange={(value) => setValue('targetStock', value)}
                style={{
                  marginInlineStart: 'auto',
                  flexGrow: 0,
                  minWidth: 60,
                  backgroundColor: colors.groupedBackground.primary,
                  borderWidth: 1,
                  borderColor: colors.separator.default,
                  borderRadius: 8,
                  paddingHorizontal: 8,
                  paddingVertical: 6,
                  textAlign: 'center',
                  fontSize: 17,
                  color: colors.label.primary,
                }}
              />

              <UnitSelector
                value={values.targetStockUnit}
                onChange={(value) => setValue('targetStockUnit', value)}
                label="singular"
              />
            </ListItemInputContainer>
            <ListItemInputContainer icon="eurosign" iconSize={24}>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexGrow: 1,
                }}
              >
                <Text
                  style={{
                    fontSize: 17,
                    color: colors.label.primary,
                  }}
                >
                  Grundpreis
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                  }}
                >
                  <DecimalInput
                    placeholder="1,79"
                    keyboardType="decimal-pad"
                    normalize
                    value={centsToEuro(values.basePriceCents)}
                    onChange={(value) => {
                      setValue('basePriceCents', euroToCents(value))
                    }}
                    style={{
                      marginInlineStart: 'auto',
                      flexGrow: 0,
                      minWidth: 60,
                      backgroundColor: colors.groupedBackground.primary,
                      borderWidth: 1,
                      borderColor: colors.separator.default,
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 6,
                      textAlign: 'center',
                      fontSize: 17,
                      color: colors.label.primary,
                    }}
                  />

                  <Text
                    style={{
                      fontSize: 17,
                      marginInline: 6,
                      color: colors.label.secondary,
                    }}
                  >
                    /
                  </Text>

                  <UnitSelector
                    value={values.basePriceUnit}
                    onChange={(value) => setValue('basePriceUnit', value)}
                    label="singular"
                  />
                </View>
              </View>
            </ListItemInputContainer>
          </List>

          <List>
            <ListItem
              icon="square.grid.2x2"
              iconSize={24}
              href={`/${householdId}/modals/select-category`}
              right={
                values.categoryId
                  ? categories.find((c) => c.id === values.categoryId)?.name
                  : 'Ohne'
              }
            >
              Kategorie
            </ListItem>
            <ListItem
              icon="storefront"
              iconSize={24}
              href={`/${householdId}/modals/select-shops`}
              right={
                values.shopIds && values.shopIds.length > 0
                  ? values.shopIds
                      .map((id) => shops.find((s) => s.id === id)?.name)
                      .filter(Boolean)
                      .join(', ')
                  : 'Ohne'
              }
            >
              Geschäfte
            </ListItem>
          </List>

          {inventoryItem && (
            <Button
              title="Eintrag löschen"
              color="red"
              onPress={handleDelete}
            />
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </>
  )
}
