import type { DatasetProfile, DuplicateReport } from '../types/analysis'
import { makeElement, makeTable } from '../utils/dom'
import { formatNumber } from '../utils/format-number'

export function renderDataQualityPanel(
  container: HTMLElement,
  profile: DatasetProfile,
  duplicates: DuplicateReport,
): void {
  container.replaceChildren()
  container.appendChild(makeElement('h2', 'Data quality'))

  const rows = profile.columns.map((column) => [
    column.name,
    column.type,
    formatNumber(column.missingCount),
    `${formatNumber(column.missingPercent, 1)}%`,
    formatNumber(column.uniqueCount),
  ])
  container.appendChild(
    makeTable(['Column', 'Type', 'Missing', 'Missing %', 'Unique values'], rows),
  )

  const count = duplicates.duplicateRowCount
  let message = 'No duplicate rows found.'
  if (count > 0) {
    const shown = duplicates.duplicateRowNumbers.slice(0, 10).join(', ')
    const more = count > 10 ? ', ...' : ''
    message = `${formatNumber(count)} duplicate ${count === 1 ? 'row' : 'rows'} found (data row ${shown}${more}).`
  }
  container.appendChild(makeElement('p', message))
}