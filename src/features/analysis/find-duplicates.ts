import type { Dataset } from '../../types/dataset'
import type { DuplicateReport } from '../../types/analysis'

export function findDuplicates(dataset: Dataset): DuplicateReport {
  const seen = new Set<string>()
  const duplicateRowNumbers: number[] = []

  dataset.rows.forEach((row, index) => {
    // Turn the whole row into one comparable string.
    const key = JSON.stringify(
      dataset.columns.map((column) => (row[column] ?? '').trim()),
    )

    if (seen.has(key)) {
      duplicateRowNumbers.push(index + 1)
    } else {
      seen.add(key)
    }
  })

  return {
    duplicateRowCount: duplicateRowNumbers.length,
    uniqueRowCount: dataset.rows.length - duplicateRowNumbers.length,
    duplicateRowNumbers,
  }
}