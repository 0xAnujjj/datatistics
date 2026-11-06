export type ColumnType = 'number' | 'boolean' | 'date' | 'text' | 'empty'

export interface NumericStats {
    count: number
    mean: number
    median: number
    min: number
    max: number
    standardDeviation: number
}

export interface ValueCount {
    value: string
    count: number
}

export interface DuplicateReport {
    duplicateRowCount: number
    uniqueRowCount: number // rows left after removing repeats
    duplicateRowNumbers: number[] // 1-based data rows, header not counted
}

export interface ColumnProfile {
    name: string
    type: ColumnType
    totalCount: number
    missingCount: number
    missingPercent: number
    uniqueCount: number
    numericStats?: NumericStats 
    topValues?: ValueCount[] 
}

export interface DatasetProfile {
    rowCount: number
    columnCount: number
    columns: ColumnProfile[]
}

export interface Insight  {
    severity: 'info' | 'warning'
    text: string
}

