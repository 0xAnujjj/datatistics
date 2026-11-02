export type DataRow = Record<string, string>

export interface Dataset {
    fileName: string
    columns: string[]
    rows: DataRow[]
}
