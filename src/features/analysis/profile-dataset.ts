import type { Dataset } from "../../types/dataset";
import type {
    ColumnProfile,
    ColumnType,
    DatasetProfile,
} from '../../types/analysis'

    import { calculateNumericStats,
    getTopValues,
} from './calculate-statistics'

// chosen rules
const MISSING_TOKENS = new Set(['', 'na', 'n/a', 'nan', 'null'])
const BOOLEAN_TOKENS = new Set(['true', 'false', 'yes', 'no'])
const NUMBER_PATTERN = /^[+-]?(\d+\.?\d*|\.\d+)$/
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/

// for stats. part
export function isMissing(value:string | undefined): boolean {
    if (value === undefined) return true
    return MISSING_TOKENS.has(value.trim().toLowerCase())
}

function isBoolean(value:string): boolean {
    return BOOLEAN_TOKENS.has(value.trim().toLowerCase())
}

function isNumber(value:string): boolean {
    return NUMBER_PATTERN.test(value.trim())
}

function isIsoDate(value: string): boolean {
    const text = value.trim()
    if(!ISO_DATE_PATTERN.test(text)) return false
    // Round-trip check: "2024-02-30" would roll over to March, so it won't match.

    const date = new Date(`${text}t00:00:ooZ`)
    return !Number.isNaN(date.getTime()) && date.toISOString().startsWith(text)
}

export function detectColumnType(values: string[]): ColumnType {
    const present = values.filter((value) => !isMissing(value))

    if (present.length === 0) return 'empty'
    if (present.every(isBoolean)) return 'boolean'
    if (present.every(isNumber)) return 'number'
    if (present.every(isIsoDate)) return 'date'
    return 'text'
}

export function profileDataset(dataset: Dataset): DatasetProfile {
    const columns: ColumnProfile[] = dataset.columns.map((name) => {
    const values = dataset.rows.map((row) => row[name] ?? '')
    const present = values.filter((value) => !isMissing(value))
    const missingCount = values.length - present.length
    const type = detectColumnType(values)
    
    return {
        name,
        type,
        totalCount: values.length,
        missingCount,
        missingPercent:
         values.length === 0 ? 0 : (missingCount / values.length) * 100,
        uniqueCount: new Set(present.map((value) => value.trim())).size,
        numericStats:
            type === 'number' ? (calculateNumericStats(present) ?? undefined) : undefined,
        topValues:
            type === 'text' || type === 'boolean' ? getTopValues(present) : undefined,
    }
})

    return {
    rowCount: dataset.rows.length,
    columnCount: dataset.columns.length,
    columns,
    }
}