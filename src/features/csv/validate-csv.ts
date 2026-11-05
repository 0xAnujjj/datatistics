import type {Dataset} from '../../types/dataset'

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024 //5MB in bytes
const BLOCKING_ROW_RATIO = 0.5 // stop the analysis when half the rows are affected

const CODE_EXPLANATIONS: Record<string, string> = {
    TooManyFields: 'more values than the header has column names',
    TooFewFields: 'fewer values than the header has column names',
    MissingQuotes: 'a quote that was opened but never closed',
}

function describeParseIssues(dataset: Dataset): string {
    const { affectedRowCount, countsByCode } = dataset.parseIssues
    const total = dataset.rows.length
    const percent = total === 0 ? '0.0' : ((affectedRowCount / total) * 100).toFixed(1)

    const reasons = Object.keys(countsByCode).map(
        (code) => CODE_EXPLANATIONS[code] ?? `a "${code}" problem`,
    )

    let text = `${affectedRowCount.toLocaleString()} of ${total.toLocaleString()} rows (${percent}%) have formatting problems: ${reasons.join(', ')}.`
    if (countsByCode.TooManyFields) {
        text += ' A common cause is an unnamed index column at the start of each row.'
    }
    return text
}

function affectedRatio(dataset: Dataset): number {
    if (dataset.rows.length === 0) return 0
    return dataset.parseIssues.affectedRowCount / dataset.rows.length
}

// A softer message for files that still load. Returns null if there is nothing to report.
export function getParseWarning(dataset: Dataset): string | null {
    if (dataset.parseIssues.affectedRowCount === 0) return null
    return `${describeParseIssues(dataset)} Results may be affected.`
}

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

    if (affectedRatio(dataset) >= BLOCKING_ROW_RATIO) {
    problems.push (
    `${describeParseIssues(dataset)} Values are probably in the wrong columns, 
    so the analysis was stopped. Check that every column has a name in the header row.`,
    )
}

    return problems
}