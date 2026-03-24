import { Score } from '@/types'

/**
 * Generate 5 unique random numbers between 1 and 45
 */
export function generateRandomDraw(): number[] {
  const numbers = new Set<number>()
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1)
  }
  return Array.from(numbers).sort((a, b) => a - b)
}

/**
 * Generate 5 unique numbers weighted by score frequency
 * direction: 'most_frequent' = likely winners, 'least_frequent' = jackpot growth
 */
export function generateAlgorithmicDraw(
  allScores: number[],
  direction: 'most_frequent' | 'least_frequent'
): number[] {
  // Count frequency of each number 1-45
  const freq: Record<number, number> = {}
  for (let i = 1; i <= 45; i++) freq[i] = 0
  for (const s of allScores) {
    if (s >= 1 && s <= 45) freq[s]++
  }

  // Build weighted pool
  const maxFreq = Math.max(...Object.values(freq))
  const weights: { num: number; weight: number }[] = []

  for (let i = 1; i <= 45; i++) {
    const f = freq[i]
    const weight =
      direction === 'most_frequent'
        ? f + 1 // higher freq = higher weight
        : maxFreq - f + 1 // lower freq = higher weight
    weights.push({ num: i, weight })
  }

  const totalWeight = weights.reduce((s, w) => s + w.weight, 0)
  const selected = new Set<number>()

  while (selected.size < 5) {
    let rand = Math.random() * totalWeight
    for (const { num, weight } of weights) {
      rand -= weight
      if (rand <= 0 && !selected.has(num)) {
        selected.add(num)
        break
      }
    }
  }

  return Array.from(selected).sort((a, b) => a - b)
}

/**
 * Count how many of a user's scores match the drawn numbers
 */
export function matchScores(
  userScores: number[],
  drawnNumbers: number[]
): { matchCount: number; matchedNumbers: number[] } {
  const drawn = new Set(drawnNumbers)
  const matchedNumbers = userScores.filter((s) => drawn.has(s))
  return { matchCount: matchedNumbers.length, matchedNumbers }
}

/**
 * Calculate prize pool breakdown
 * contributionAmountPence: per-subscriber prize pool contribution in pence
 */
export function calculatePrizePools(
  totalActiveSubscribers: number,
  contributionAmountPence: number,
  rolloverAmountPence: number = 0
): {
  total: number
  pool5match: number
  pool4match: number
  pool3match: number
} {
  const basePool = totalActiveSubscribers * contributionAmountPence
  const total = basePool + rolloverAmountPence
  return {
    total,
    pool5match: Math.floor(total * 0.4),
    pool4match: Math.floor(total * 0.35),
    pool3match: Math.floor(total * 0.25),
  }
}

/**
 * Distribute prizes among winners in a tier
 */
export function distributePrize(
  poolAmount: number,
  winnerCount: number
): number {
  if (winnerCount === 0) return 0
  return Math.floor(poolAmount / winnerCount)
}
