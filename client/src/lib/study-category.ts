export interface StoredStudyCategory {
  id: string;
  name: string;
  color?: string;
}

/**
 * Read the category selected in the UI straight from storage.
 *
 * The category hooks keep per-component state, so a long-lived listener (Discord
 * presence, session recorder) cannot rely on a captured array. localStorage is
 * the value that all instances agree on.
 */
export function readSelectedCategory(): StoredStudyCategory | null {
  if (typeof window === 'undefined') return null;

  try {
    const selectedId = localStorage.getItem('selectedCategoryId');
    const rawCategories = localStorage.getItem('studyCategories');
    if (!selectedId || !rawCategories) return null;

    const categories = JSON.parse(rawCategories) as StoredStudyCategory[];
    if (!Array.isArray(categories)) return null;

    return categories.find((category) => category?.id === selectedId) ?? null;
  } catch {
    return null;
  }
}
