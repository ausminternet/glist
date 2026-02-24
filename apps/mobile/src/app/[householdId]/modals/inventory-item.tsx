import {
  Stack,
  useLocalSearchParams,
  useNavigation,
  useRouter,
} from 'expo-router'
import { useEffect, useState } from 'react'
import { ScrollView, Text, TextInput, View } from 'react-native'
import { useCategories } from '@/api/categories'
import { useInventoryItem } from '@/api/inventory-items'
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
  const navigation = useNavigation()

  const [preventModalRemove, setPreventModalRemove] = useState(false)

  const router = useRouter()
  const householdId = useHouseholdId()

  const { itemId } = useLocalSearchParams<{ itemId: string }>()
  const { shops } = useShops()
  const { categories } = useCategories()

  const inventoryItem = useInventoryItem(itemId)

  const { submit, isSubmitting } = useSubmitInventoryItemForm({
    setPreventRemove: setPreventModalRemove,
  })

  const { reset, setValue, values, isValid, isDirty, setInventoryItem } =
    useInventoryItemForm()

  const resetFormAndGoBack = () => {
    reset()
    router.back()
  }

  useEffect(() => {
    const sub = navigation.addListener('beforeRemove', () => {
      reset()
    })

    return sub
  }, [navigation, reset])

  useEffect(() => {
    if (inventoryItem) {
      setInventoryItem(inventoryItem)
    }
  }, [inventoryItem, setInventoryItem])

  const canSubmit = !isSubmitting && isValid && isDirty

  useEffect(() => {
    setPreventModalRemove(isDirty)
  }, [isDirty])

  return (
    <>
      <Stack.Screen
        options={{
          title: inventoryItem ? 'Bearbeiten' : 'Neuer Vorrat',
          headerTransparent: true,
          headerLeft: () => (
            <NavbarCancelButton
              onCancel={() => resetFormAndGoBack()}
              preventRemove={preventModalRemove}
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
              disabled: !canSubmit,
              onPress: () => {
                submit(values, inventoryItem?.id, resetFormAndGoBack)
              },
            },
          ],
        }}
      />

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
                setValue('name', text.trim())
              }}
              value={values.name}
              autoCorrect={false}
              autoCapitalize="none"
              autoFocus
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
      </ScrollView>
    </>
  )
}
