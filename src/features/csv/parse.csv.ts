import Papa from 'papaparse'
import type { Dataset, DataRow } from '../../types/dataset'

export async function parseCsv(file: File): Promise<Dataset> {
    const text = await file.text()
    
    const results = Papa.parse<DataRow>(text, {
        header: true,
        skipEmptyLines: true
    })
    
    if(results.errors.length > 0) {
        console.warn('CSV parse warning:', results.errors)
    }

    return {
        fileName: file.name,
        columns: results.meta.fields ?? [],
        rows: results.data
    }
}