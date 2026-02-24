import { useState } from 'react'
import { Alert } from 'react-native'
import {
  useAddInventoryItem,
  useEditInventoryItem,
} from '@/api/inventory-items'
import {
  type InventoryItemFormValues,
  toAddInventoryItemInput,
  toEditInventoryItemInput,
} from './use-inventory-item-form'

interface UseSubmitInventoryItemFormProps {
  setPreventRemove: (value: boolean) => void
}

export function useSubmitInventoryItemForm({
  setPreventRemove,
}: UseSubmitInventoryItemFormProps) {
  const { addInventoryItem } = useAddInventoryItem()
  const { editInventoryItem } = useEditInventoryItem()
  const [isSubmitting, setIsSubmitting] = useState(false)

  const add = (input: InventoryItemFormValues, onSuccess?: () => void) => {
    const payload = toAddInventoryItemInput(input)
    setPreventRemove(false)
    addInventoryItem(payload, {
      onSuccess: () => {
        onSuccess?.()
      },
      onError: (error) => {
        setPreventRemove(true)
        Alert.alert('Fehler', 'Der Vorrat konnte nicht gespeichert werden.')
        console.error('Error adding inventory item:', error)
      },
    })
  }

  const edit = (
    inventoryItemId: string,
    input: InventoryItemFormValues,
    onSuccess?: () => void,
  ) => {
    const payload = toEditInventoryItemInput(input)
    setPreventRemove(false)
    editInventoryItem(
      { itemId: inventoryItemId, payload },
      {
        onSuccess: () => {
          onSuccess?.()
        },
        onError: (error) => {
          setPreventRemove(true)
          Alert.alert('Fehler', 'Der Vorrat konnte nicht gespeichert werden.')
          console.error('Error editing inventory item:', error)
        },
        onSettled: () => {
          setIsSubmitting(false)
        },
      },
    )
  }

  const submit = (
    payload: InventoryItemFormValues,
    inventoryItemId?: string,
    onSuccess?: () => void,
  ) => {
    console.log(
      'Submitting inventory item form with payload:',
      payload,
      inventoryItemId,
    )
    setIsSubmitting(true)
    if (inventoryItemId) {
      edit(inventoryItemId, payload, onSuccess)
    } else {
      add(payload, onSuccess)
    }
  }

  return {
    submit,
    isSubmitting,
  }
}
