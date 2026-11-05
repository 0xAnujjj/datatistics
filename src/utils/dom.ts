// finds an element or fails with a clear msg.
export function getElement <T extends HTMLElement>(selector: string): T {
    const element = document.querySelector<T>(selector)
    if (!element) {
        throw new Error(`Missing element in index.html: ${selector}`)
    }
    return element
}

// create element with opt. txt and css class
export function makeElement(
    tag: string,
    text: string = '',
    className: string = '',
): HTMLElement {
    const element = document.createElement(tag)
    element.textContent = text
    if (className) element.className = className
    return element
}

// builds scrollable table from column headers and rows of plain txt.
export function makeTable(headers: string[], rows: string[][]): HTMLElement {
    const table = document.createElement('table')

    const headRow = table.createTHead().insertRow()
    for (const header of headers) {
        headRow.appendChild(makeElement('th', header))
    }

    const body = table.createTBody()
    for (const row of rows) {
        const tr = body.insertRow()
        for (const cell of row) {
            tr.insertCell().textContent = cell
        }
    }

    const wrapper = makeElement('div', '', 'table-wrapper')
    wrapper.appendChild(table)
    return wrapper

}