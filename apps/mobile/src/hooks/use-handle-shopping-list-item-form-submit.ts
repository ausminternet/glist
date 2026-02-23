import { useState } from 'react'
import { Alert } from 'react-native'
import {
  useSaveShoppingListItem,
  useUpdateShoppingListItem,
} from '@/api/shopping-list-items'
import {
  type SaveShoppingListItemArgs,
  toAddShoppingListItemInput,
  toUpdateShoppingListItemInput,
} from '@/hooks/use-shopping-list-item-form'

interface UseSubmitShoppingListFormProps {
  householdId: string
  setPreventRemove: (value: boolean) => void
  resetFormAndGoBack: () => void
}

export function useSubmitShoppingListForm({
  householdId,
  setPreventRemove,
  resetFormAndGoBack,
}: UseSubmitShoppingListFormProps) {
  const { addShoppingListItem } = useSaveShoppingListItem(householdId)
  const { updateShoppingListItem } = useUpdateShoppingListItem(householdId)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const add = (input: SaveShoppingListItemArgs) => {
    const payload = toAddShoppingListItemInput(input)
    setPreventRemove(false)
    addShoppingListItem(payload, {
      onSuccess: () => {
        resetFormAndGoBack()
      },
      onError: (error) => {
        setPreventRemove(true)
        Alert.alert('Fehler', 'Das Item konnte nicht gespeichert werden.')
        console.error('Error adding shopping list item:', error)
      },
    })
  }

  const update = (
    shoppingListItemId: string,
    input: SaveShoppingListItemArgs,
  ) => {
    const payload = toUpdateShoppingListItemInput(input)
    setPreventRemove(false)
    updateShoppingListItem(
      { itemId: shoppingListItemId, payload },
      {
        onSuccess: () => {
          resetFormAndGoBack()
        },
        onError: (error) => {
          setPreventRemove(true)
          Alert.alert('Fehler', 'Das Item konnte nicht angelegt werden.')
          console.error('Error adding shopping list item:', error)
        },
        onSettled: () => {
          setIsSubmitting(false)
        },
      },
    )
  }

  const submit = (
    payload: SaveShoppingListItemArgs,
    shoppingListItemId?: string,
  ) => {
    setIsSubmitting(true)
    if (shoppingListItemId) {
      update(shoppingListItemId, payload)
    } else {
      add(payload)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}
