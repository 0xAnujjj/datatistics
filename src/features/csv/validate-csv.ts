import type {Dataset} from '../../types/dataset'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 //5MB in bytes


export function validateFile(file: File): string | null {
    
    if(!file.name.toLocaleLowerCase().endsWith('.csv')) {
        return 'Please choose a .csv file.'
    }

    if (file.size == 0) {
        return 'Empty file'
    }

    if (file.size > MAX_FILE_SIZE_BYTES)
    {
        return 'file size exceeds the limit of 5 MB. Please choose a smaller file.'
    }
    return null
}

export function validateDataset(dataset: Dataset): string[] {
    const problems: string[] = []

    if (dataset.columns.length === 0) {
        problems.push('No columns were found. Is first row a header?')
    }

    if (dataset.rows.length === 0) {
        problems.push('The file has a header but no data rows.')
    }

    dataset.columns.forEach((name, index) => {
        if (name.trim() === '') {
            problems.push(`Column ${index + 1} has no name.`)
        }
    })

    return problems
}