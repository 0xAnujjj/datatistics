import Papa from 'papaparse'
import type { Dataset, DataRow } from '../../types/dataset'

export async function parseCsv(file: File): Promise<Dataset> {
    const text = await file.text()
    
    const results = Papa.parse<DataRow>(text, {
        header: true,
        skipEmptyLines: true
    })
    
    const countsByCode: Record<string, number>  = {}
    const affectedRows = new Set<number>()

    for (const error of results.errors) {
        countsByCode[error.code] = (countsByCode[error.code] ?? 0) + 1
        if (error.row !== undefined) affectedRows.add(error.row)

    }

    return {
        fileName: file.name,
        columns: results.meta.fields ?? [],
        rows: results.data,
        parseIssues: { affectedRowCount: affectedRows.size, countsByCode },
    }
}