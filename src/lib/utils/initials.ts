/**
 * Generate initials from a full name
 * Takes the first letter of the first two words
 * Examples:
 * - "Kristian Epa Froditus Santoso" → "KE"
 * - "Sintikhe Damayanti" → "SD"
 * - "John" → "J"
 * - "" → "U"
 */
export function getInitials(name: string): string {
  if (!name || typeof name !== 'string') {
    return 'U' // Default fallback for "User"
  }

  const words = name.trim().split(/\s+/).filter(word => word.length > 0)

  if (words.length === 0) {
    return 'U'
  }

  if (words.length === 1) {
    return words[0][0].toUpperCase()
  }

  // Take first letter of first word and first letter of second word
  const firstInitial = words[0][0].toUpperCase()
  const secondInitial = words[1][0].toUpperCase()

  return `${firstInitial}${secondInitial}`
}