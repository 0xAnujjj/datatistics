export type DataRow = Record<string, string>

export interface ParseIssues {
    affectedRowCount: number    //row that had atleast one formatting problem
    countsByCode: Record<string, number> 
}

export interface Dataset {
    fileName: string
    columns: string[]
    rows: DataRow[]
    parseIssues: ParseIssues
}
