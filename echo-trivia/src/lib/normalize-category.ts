/**
 * Normalizes category names for consistent storage and matching.
 * Converts to Title Case and trims whitespace.
 */
export function normalizeCategory(category: string): string {
  if (!category) return category;

  // Trim and normalize whitespace
  const trimmed = category.trim().replace(/\s+/g, ' ');

  // Convert to Title Case (capitalize first letter of each word)
  return trimmed
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle special cases (articles, prepositions that should stay lowercase)
      const lowercaseWords = ['a', 'an', 'the', 'and', 'but', 'or', 'for', 'nor', 'on', 'at', 'to', 'by', 'of', 'in'];
      if (lowercaseWords.includes(word)) {
        return word;
      }
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    // Ensure first word is always capitalized
    .replace(/^./, str => str.toUpperCase());
}

/**
 * Common category name mappings for fuzzy matching.
 * Maps variations to canonical names.
 */
export const CATEGORY_ALIASES: Record<string, string> = {
  // Lord of the Rings variations
  'lord of the rings': 'Lord of the Rings',
  'lotr': 'Lord of the Rings',
  'the lord of the rings': 'Lord of the Rings',

  // Star Wars variations
  'star wars': 'Star Wars',
  'starwars': 'Star Wars',

  // Harry Potter variations
  'harry potter': 'Harry Potter',
  'hp': 'Harry Potter',

  // Game of Thrones variations
  'game of thrones': 'Game of Thrones',
  'got': 'Game of Thrones',
  'a song of ice and fire': 'Game of Thrones',

  // Marvel variations
  'marvel': 'Marvel',
  'mcu': 'Marvel',
  'marvel cinematic universe': 'Marvel',

  // DC variations
  'dc': 'DC Comics',
  'dc comics': 'DC Comics',
  'dceu': 'DC Comics',
};

/**
 * Normalizes and applies fuzzy matching to category names.
 */
export function normalizeCategoryWithAliases(category: string): string {
  if (!category) return category;

  const lower = category.trim().toLowerCase();

  // Check for alias match first
  if (CATEGORY_ALIASES[lower]) {
    return CATEGORY_ALIASES[lower];
  }

  // Fall back to standard normalization
  return normalizeCategory(category);
}
