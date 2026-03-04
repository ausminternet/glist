import { drizzle } from 'drizzle-orm/d1'
import {
  inventoryItemPhotos,
  shoppingListItemPhotos,
} from '../infrastructure/persistence/schema'

export async function findAndCleanupOrphanedPhotos(env: CloudflareBindings) {
  console.log('Starting orphaned photos cleanup cron job...')
  const db = drizzle(env.glist_db)

  // 1. Fetch all legitimate photo keys from the database
  console.log('Fetching photo references from database...')

  const [inventoryPhotos, shoppingListPhotos] = await Promise.all([
    db.select({ key: inventoryItemPhotos.photoKey }).from(inventoryItemPhotos),
    db
      .select({ key: shoppingListItemPhotos.photoKey })
      .from(shoppingListItemPhotos),
  ])

  const validPhotoKeys = new Set([
    ...inventoryPhotos.map((p) => p.key),
    ...shoppingListPhotos.map((p) => p.key),
  ])

  console.log(
    `Found ${validPhotoKeys.size} valid photo references in the database.`,
  )

  // 2. Iterate through R2 bucket and find photos not in the valid set
  console.log('Scanning R2 bucket for orphaned photos...')
  let truncated = true
  let cursor: string | undefined
  let orphanedCount = 0

  while (truncated) {
    const listResult = await env.glist_photos.list({ cursor })

    const keysToDelete: string[] = []

    for (const object of listResult.objects) {
      if (!validPhotoKeys.has(object.key)) {
        console.log(`Orphaned photo found: ${object.key}`)
        keysToDelete.push(object.key)
        orphanedCount++
      }
    }

    // Optional: Delete the orphaned photos
    // If you only want to find them, comment out this block
    if (keysToDelete.length > 0) {
      console.log(
        `Deleting ${keysToDelete.length} orphaned photos in this batch...`,
      )
      await env.glist_photos.delete(keysToDelete)
    }

    truncated = listResult.truncated
    cursor = listResult.truncated ? listResult.cursor : undefined
  }

  console.log(
    `Cleanup finished. Processed and removed ${orphanedCount} orphaned photos.`,
  )
}
