export type ColumnType = 'number' | 'boolean' | 'date' | 'text' | 'empty'

export interface ColumnProfile {
    name: string
    type: ColumnType
    totalCount: number
    missingCount: number
    missingPercent: number
    uniqueCount: number
}

export interface DatasetProfile {
    rowCount: number
    columnCount: number
    columns: ColumnProfile[]
}