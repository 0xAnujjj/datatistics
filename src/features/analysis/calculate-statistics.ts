import type { NumericStats, ValueCount } from '../../types/analysis'

// Expects values that are already non-missing.
export function calculateNumericStats(
    presentValues: string[],
): NumericStats | null {
    const numbers = presentValues
    .map((value) => Number(value))
    .filter((n) => Number.isFinite(n))

    if (numbers.length === 0) return null

    const count = numbers.length
    const sum = numbers.reduce((total, n) => total + n, 0)
    const mean = sum / count

    // Numbers need a comparison function, or JS sorts them as text.
    const sorted = [...numbers].sort((a, b) => a - b)
    const middle = Math.floor(count / 2)
    const median =
        count % 2 === 1 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2

    // Sample standard deviation (n - 1), like pandas. Undefined for 1 value, so 0.
    const squaredDistances = numbers.reduce(
    (total, n) => total + (n - mean) ** 2,
        0,
    )
    const standardDeviation =
    count > 1 ? Math.sqrt(squaredDistances / (count - 1)) : 0

    return {
    count,
    mean,
    median,
    min: sorted[0],
    max: sorted[count - 1],
    standardDeviation,
    }
}

export function getTopValues(
    presentValues: string[],
    limit: number = 5,
): ValueCount[] {
    const counts = new Map<string, number>()

    for (const raw of presentValues) {
    const value = raw.trim()
    counts.set(value, (counts.get(value) ?? 0) + 1)
    }

    return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit)
}