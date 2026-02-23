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
  setPreventRemove: (value: boolean) => void
}

export function useSubmitShoppingListForm({
  setPreventRemove,
}: UseSubmitShoppingListFormProps) {
  const { addShoppingListItem } = useSaveShoppingListItem()
  const { updateShoppingListItem } = useUpdateShoppingListItem()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const add = (input: SaveShoppingListItemArgs, onSuccess?: () => void) => {
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

  const update = (
    shoppingListItemId: string,
    input: SaveShoppingListItemArgs,
    onSuccess?: () => void,
  ) => {
    const payload = toUpdateShoppingListItemInput(input)
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
    onSuccess?: () => void,
  ) => {
    setIsSubmitting(true)
    if (shoppingListItemId) {
      update(shoppingListItemId, payload, onSuccess)
    } else {
      add(payload, onSuccess)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}
