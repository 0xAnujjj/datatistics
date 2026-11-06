import type { Dataset } from '../../types/dataset'
import { isMissing } from './profile-dataset'

// All non-missing values of one column, trimmed.
export function getColumnValues(
    dataset: Dataset,
    columnName: string,
): string[] {
    return dataset.rows
    .map((row) => row[columnName] ?? '')
    .filter((value) => !isMissing(value))
    .map((value) => value.trim())
}