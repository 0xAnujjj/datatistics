export interface HistogramBin {
    start: number
    end: number
    count: number
}

export function buildHistogram(
    numbers: number[],
    binCount: number = 10,
): HistogramBin[] {
    if (numbers.length === 0) return []

    // A loop, not Math.min(...numbers): spreading a huge array can crash.
    let min = numbers[0]
    let max = numbers[0]
    for (const n of numbers) {
    if (n < min) min = n
    if (n > max) max = n
    }

  // All values equal: one bin is the honest answer.
    if (min === max) return [{ start: min, end: max, count: numbers.length }]

    const width = (max - min) / binCount
    const bins: HistogramBin[] = Array.from({ length: binCount }, (_, i) => ({
    start: min + i * width,
    end: min + (i + 1) * width,
    count: 0,
    }))

    for (const n of numbers) {
    // The maximum value belongs in the last bin, not in a bin of its own.
    const index = Math.min(binCount - 1, Math.floor((n - min) / width))
    bins[index].count += 1
    }

    return bins
}