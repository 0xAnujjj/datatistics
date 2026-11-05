import type { DatasetProfile } from '../types/analysis'
import { makeElement, makeTable } from '../utils/dom'
import { formatNumber } from '../utils/format-number'

export function renderColumnStatistics(
  container: HTMLElement,
  profile: DatasetProfile,
): void {
  container.replaceChildren()
  container.appendChild(makeElement('h2', 'Statistics'))

  const numericRows: string[][] = []
  for (const column of profile.columns) {
    const stats = column.numericStats
    if (!stats) continue
    numericRows.push([
      column.name,
      formatNumber(stats.count),
      formatNumber(stats.mean),
      formatNumber(stats.median),
      formatNumber(stats.min),
      formatNumber(stats.max),
      formatNumber(stats.standardDeviation),
    ])
  }

  if (numericRows.length > 0) {
    container.appendChild(makeElement('h3', 'Numeric columns'))
    container.appendChild(
      makeTable(
        ['Column', 'Count', 'Mean', 'Median', 'Min', 'Max', 'Std. deviation'],
        numericRows,
      ),
    )
  }

  const list = makeElement('ul')
  for (const column of profile.columns) {
    const top = column.topValues
    if (!top || top.length === 0) continue
    const summary = top.map((item) => `${item.value} (${item.count})`).join(', ')
    list.appendChild(makeElement('li', `${column.name}: ${summary}`))
  }
  if (list.children.length > 0) {
    container.appendChild(makeElement('h3', 'Most common values'))
    container.appendChild(list)
  }
}