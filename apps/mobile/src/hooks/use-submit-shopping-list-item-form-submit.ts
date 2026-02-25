import { useState } from 'react'
import { Alert } from 'react-native'
import {
  useEditShoppingListItem,
  useSaveShoppingListItem,
} from '@/api/shopping-list-items'
import {
  type ShoppingListItemFormValues,
  toAddShoppingListItemInput,
  toEditShoppingListItemInput,
} from '@/hooks/use-shopping-list-item-form'

interface UseSubmitShoppingListItemFormProps {
  setPreventRemove: (value: boolean) => void
}

export function useSubmitShoppingListItemForm({
  setPreventRemove,
}: UseSubmitShoppingListItemFormProps) {
  const { addShoppingListItem } = useSaveShoppingListItem()
  const { editShoppingListItem: updateShoppingListItem } =
    useEditShoppingListItem()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const add = (input: ShoppingListItemFormValues, onSuccess?: () => void) => {
    const payload = toAddShoppingListItemInput(input)
    setPreventRemove(false)
    addShoppingListItem(payload, {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        setPreventRemove(true)
        Alert.alert('Fehler', 'Das Item konnte nicht gespeichert werden.')
        console.error('Error adding shopping list item:', error)
      },
    })
  }

  const edit = (
    shoppingListItemId: string,
    input: ShoppingListItemFormValues,
    onSuccess?: () => void,
  ) => {
    const payload = toEditShoppingListItemInput(input)
    setPreventRemove(false)
    updateShoppingListItem(
      { itemId: shoppingListItemId, payload },
      {
        onSuccess: () => {
          onSuccess?.()
        },
        onError: (error) => {
          setPreventRemove(true)
          Alert.alert('Fehler', 'Das Item konnte nicht angelegt werden.')
          console.error('Error editing shopping list item:', error)
        },
        onSettled: () => {
          setIsSubmitting(false)
        },
      },
    )
  }

  const submit = (
    payload: ShoppingListItemFormValues,
    shoppingListItemId?: string,
    onSuccess?: () => void,
  ) => {
    setIsSubmitting(true)
    if (shoppingListItemId) {
      edit(shoppingListItemId, payload, onSuccess)
    } else {
      add(payload, onSuccess)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}
