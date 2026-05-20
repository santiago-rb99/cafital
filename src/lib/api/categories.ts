import { Category, PublicationCategory, Subcategory } from '@/types'
import {
  getCategoryById,
  getSubcategoryById,
  mockCategories,
} from '@/data/mock/categories'
import { delay } from './_client'

export async function listCategories(): Promise<Category[]> {
  await delay(120)
  return mockCategories
}

export async function getCategory(
  id: PublicationCategory
): Promise<Category | null> {
  await delay(120)
  return getCategoryById(id)
}

export async function getSubcategory(id: string): Promise<Subcategory | null> {
  await delay(120)
  return getSubcategoryById(id)
}

export async function listSubcategories(
  categoryId: PublicationCategory
): Promise<Subcategory[]> {
  await delay(120)
  return getCategoryById(categoryId)?.subcategories ?? []
}
