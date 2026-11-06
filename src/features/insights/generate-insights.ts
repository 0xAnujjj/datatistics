import type {
  ColumnProfile,
  ColumnType,
  DatasetProfile,
  DuplicateReport,
  Insight,
} from '../../types/analysis'
import { formatNumber } from '../../utils/format-number'

const HIGH_MISSING_PERCENT = 5
const ID_UNIQUE_RATIO = 0.9
const MIN_ROWS_FOR_ID_CHECKS = 10
const MAX_TYPICAL_SUMMARIES = 8

// plural(1, 'row') -> "1 row", plural(3, 'row') -> "3 rows"
function plural(count: number, word: string): string {
  return `${formatNumber(count)} ${word}${count === 1 ? '' : 's'}`
}

function describeOverview(profile: DatasetProfile): Insight {
  const typeCounts: Record<ColumnType, number> = {
    number: 0,
    boolean: 0,
    date: 0,
    text: 0,
    empty: 0,
  }
  for (const column of profile.columns) {
    typeCounts[column.type] += 1
  }

  // `[, count]` skips the first item of each pair (the type name).
  const parts = Object.entries(typeCounts)
    .filter(([, count]) => count > 0)
    .map(([type, count]) => `${count} ${type}`)

  return {
    severity: 'info',
    text: `The file has ${plural(profile.rowCount, 'row')} and ${plural(profile.columnCount, 'column')} (${parts.join(', ')}).`,
  }
}

function describeMissing(profile: DatasetProfile): Insight[] {
  const insights: Insight[] = []

  for (const column of profile.columns) {
    if (column.type === 'empty') {
      insights.push({
        severity: 'warning',
        text: `"${column.name}" is completely empty.`,
      })
    } else if (column.missingCount > 0) {
      insights.push({
        severity:
          column.missingPercent >= HIGH_MISSING_PERCENT ? 'warning' : 'info',
        text: `"${column.name}" has ${plural(column.missingCount, 'missing value')} (${formatNumber(column.missingPercent, 1)}%).`,
      })
    }
  }

  return insights
}

function describeDuplicates(
  profile: DatasetProfile,
  duplicates: DuplicateReport,
): Insight {
  const count = duplicates.duplicateRowCount
  if (count === 0) {
    return { severity: 'info', text: 'No duplicate rows were found.' }
  }

  const percent = formatNumber((count / profile.rowCount) * 100, 1)
  return {
    severity: 'warning',
    text: `${plural(count, 'row')} ${count === 1 ? 'is a copy' : 'are copies'} of an earlier row (${percent}% of the data). Duplicates can distort counts and averages.`,
  }
}

// Columns that are not ordinary measurements or categories.
function describeSpecialCase(column: ColumnProfile): Insight | null {
  const stats = column.numericStats
  const present = column.totalCount - column.missingCount

  if (column.type === 'number' && stats) {
    const isRowNumber =
      stats.count >= MIN_ROWS_FOR_ID_CHECKS &&
      stats.count === column.uniqueCount &&
      Number.isInteger(stats.min) &&
      stats.max - stats.min + 1 === stats.count

    if (isRowNumber) {
      return {
        severity: 'info',
        text: `"${column.name}" counts from ${formatNumber(stats.min)} to ${formatNumber(stats.max)} with no repeats, so it looks like a row number. Its statistics are not meaningful.`,
      }
    }

    if (column.uniqueCount === 1) {
      return {
        severity: 'info',
        text: `"${column.name}" has the same value in every row (${formatNumber(stats.min)}).`,
      }
    }

    const isZeroOne =
      column.topValues
        ?.map((item) => item.value)
        .sort()
        .join(',') === '0,1'
    if (isZeroOne) {
      return {
        severity: 'info',
        text: `"${column.name}" only contains 0 and 1, so it probably stands for two categories. ${formatNumber(stats.mean * 100, 1)}% of its values are 1.`,
      }
    }
  }

  if (
    column.type === 'text' &&
    present >= MIN_ROWS_FOR_ID_CHECKS &&
    column.uniqueCount / present >= ID_UNIQUE_RATIO
  ) {
    return {
      severity: 'info',
      text: `"${column.name}" has ${plural(column.uniqueCount, 'different value')} in ${plural(present, 'row')}, so it looks like an identifier, not a category.`,
    }
  }

  return null
}

// Plain-language summary of an ordinary numeric or categorical column.
function describeTypicalValues(column: ColumnProfile): Insight | null {
  const stats = column.numericStats

  if (column.type === 'number' && stats) {
    let text = `"${column.name}": the typical (median) value is ${formatNumber(stats.median)}, and values range from ${formatNumber(stats.min)} to ${formatNumber(stats.max)}.`

    const gap = Math.abs(stats.mean - stats.median)
    if (stats.standardDeviation > 0 && gap > 0.5 * stats.standardDeviation) {
      text += ` The mean (${formatNumber(stats.mean)}) differs noticeably from the median, so a few unusual values may be pulling the average.`
    }
    return { severity: 'info', text }
  }

  const top = column.topValues?.[0]
  if (top && (column.type === 'text' || column.type === 'boolean')) {
    const present = column.totalCount - column.missingCount
    const percent = formatNumber((top.count / present) * 100, 0)
    return {
      severity: 'info',
      text: `"${column.name}": the most common value is "${top.value}" (${formatNumber(top.count)} of ${formatNumber(present)} rows, ${percent}%).`,
    }
  }

  return null
}

export function generateInsights(
  profile: DatasetProfile,
  duplicates: DuplicateReport,
): Insight[] {
  const notes: Insight[] = []
  const summaries: Insight[] = []

  for (const column of profile.columns) {
    const special = describeSpecialCase(column)
    if (special) {
      notes.push(special)
      continue
    }
    const typical = describeTypicalValues(column)
    if (typical) summaries.push(typical)
  }

  const shown = summaries.slice(0, MAX_TYPICAL_SUMMARIES)
  if (summaries.length > shown.length) {
    shown.push({
      severity: 'info',
      text: `${plural(summaries.length - shown.length, 'more column')} not summarized here. See the tables below.`,
    })
  }

  // Warnings first. sort() keeps the original order among equal items.
  const rest = [
    describeDuplicates(profile, duplicates),
    ...describeMissing(profile),
    ...notes,
    ...shown,
  ]
  const rank = (insight: Insight) => (insight.severity === 'warning' ? 0 : 1)
  rest.sort((a, b) => rank(a) - rank(b))

  return [describeOverview(profile), ...rest]
}