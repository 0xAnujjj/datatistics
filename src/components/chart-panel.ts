import Chart from 'chart.js/auto'
import type { Dataset } from '../types/dataset'
import type { ColumnProfile, DatasetProfile } from '../types/analysis'
import { getColumnValues } from '../features/analysis/column-values'
import { getTopValues } from '../features/analysis/calculate-statistics'
import { buildHistogram } from '../features/visualization/histogram'
import { makeElement } from '../utils/dom'
import { formatNumber } from '../utils/format-number'

const MAX_BARS = 10

// Kept outside the functions so an old chart can be destroyed
// when a new file is loaded.
let activeChart: Chart | null = null

export function destroyChart(): void {
  activeChart?.destroy()
  activeChart = null
}

interface ChartData {
  title: string
  labels: string[]
  counts: number[]
}

function prepareChartData(dataset: Dataset, column: ColumnProfile): ChartData {
  const values = getColumnValues(dataset, column.name)

  // Numbers with many distinct values: histogram.
  // Everything else: bar chart of the most common values.
  if (column.type === 'number' && !column.topValues) {
    const bins = buildHistogram(values.map((value) => Number(value)))
    return {
      title: `Distribution of ${column.name}`,
      labels: bins.map((bin) =>
        bin.start === bin.end
          ? formatNumber(bin.start)
          : `${formatNumber(bin.start)} – ${formatNumber(bin.end)}`,
      ),
      counts: bins.map((bin) => bin.count),
    }
  }

  const top = getTopValues(values, MAX_BARS)
  return {
    title: `Most common values of ${column.name}`,
    labels: top.map((item) => item.value),
    counts: top.map((item) => item.count),
  }
}

export function renderChartPanel(
  container: HTMLElement,
  dataset: Dataset,
  profile: DatasetProfile,
): void {
  destroyChart()
  container.replaceChildren()
  container.appendChild(makeElement('h2', 'Charts'))

  const columns = profile.columns.filter(
    (column) => column.type !== 'empty' && column.type !== 'date',
  )
  if (columns.length === 0) {
    container.appendChild(makeElement('p', 'No columns available to chart.'))
    return
  }

  // Dropdown to choose the column. The option value is the position in
  // `columns`, which avoids problems with unusual column names.
  const select = document.createElement('select')
  columns.forEach((column, index) => {
    const option = document.createElement('option')
    option.value = String(index)
    option.textContent = `${column.name} (${column.type})`
    select.appendChild(option)
  })

  const label = makeElement('label', 'Column: ')
  label.appendChild(select)
  const controls = makeElement('div', '', 'chart-controls')
  controls.appendChild(label)

  const canvas = document.createElement('canvas')
  const box = makeElement('div', '', 'chart-box')
  box.appendChild(canvas)

  container.append(controls, box)

  function draw(column: ColumnProfile): void {
    activeChart?.destroy()
    const data = prepareChartData(dataset, column)

    activeChart = new Chart(canvas, {
      type: 'bar',
      data: {
        labels: data.labels,
        datasets: [{ label: 'Rows', data: data.counts }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          title: { display: true, text: data.title },
        },
        scales: {
          y: {
            beginAtZero: true,
            title: { display: true, text: 'Number of rows' },
          },
        },
      },
    })
  }

  select.addEventListener('change', () => {
    const column = columns[Number(select.value)]
    if (column) draw(column)
  })

  draw(columns[0])
}