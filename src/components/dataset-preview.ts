import type { Dataset } from "../types/dataset";

const DEFAULT_PREVIEW_ROWS = 10

export function renderDatasetPreview(
    container: HTMLElement,
    dataset: Dataset,
    maxRows: number = DEFAULT_PREVIEW_ROWS,
): void {
    container.replaceChildren() //removes anything drawn earlier

    const heading = document.createElement('h2')
    heading.textContent = 'Preview'

    const shown = Math.min(maxRows, dataset.rows.length)
    const note = document.createElement('p')
    note.textContent = `Showing ${shown} of ${dataset.rows.length} rows`

    const table = document.createElement('table')

    //header row
    const headRow = table.createTHead().insertRow()
    for(const column of dataset.columns) {
        const th = document.createElement('th')
        th.textContent = column
        headRow.appendChild(th)
    }

    // body row
    const tbody = table.createTBody()
    for (const row of dataset.rows.slice(0, maxRows)) {
        const tr = tbody.insertRow()
        for (const column of dataset.columns) {
            const td = tr.insertCell()
            td.textContent = row[column] ?? ''
        }
    }

    // Wrapper lets wide tables scroll sideways instead of breaking the layout
    const wrapper = document.createElement('div')
    wrapper.className = 'table-wrapper'
    wrapper.appendChild(table)

    container.append(heading, note, wrapper)
}


