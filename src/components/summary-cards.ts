import type { DatasetProfile, DuplicateReport } from '../types/analysis'
import { makeElement } from '../utils/dom'
import { formatNumber } from '../utils/format-number'

export function renderSummaryCards(
  container: HTMLElement,
  profile: DatasetProfile,
  duplicates: DuplicateReport,
): void {
  container.replaceChildren()

  const totalMissing = profile.columns.reduce(
    (sum, column) => sum + column.missingCount,
    0,
  )

  const cards: [string, string][] = [
    ['Rows', formatNumber(profile.rowCount)],
    ['Columns', formatNumber(profile.columnCount)],
    ['Missing cells', formatNumber(totalMissing)],
    ['Duplicate rows', formatNumber(duplicates.duplicateRowCount)],
  ]

  const grid = makeElement('div', '', 'cards')
  for (const [label, value] of cards) {
    const card = makeElement('div', '', 'card')
    card.append(
      makeElement('div', value, 'card-value'),
      makeElement('div', label, 'card-label'),
    )
    grid.appendChild(card)
  }

  container.appendChild(grid)
}