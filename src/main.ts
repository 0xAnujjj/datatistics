import './style.css'
import { parseCsv } from './features/csv/parse-csv'
import {
  validateDataset,
  validateFile,
  getParseWarning,
} from './features/csv/validate-csv'
import { profileDataset } from './features/analysis/profile-dataset'
import { findDuplicates } from './features/analysis/find-duplicates'
import { renderDatasetPreview } from './components/dataset-preview'
import { renderSummaryCards } from './components/summary-cards'
import { renderDataQualityPanel } from './components/data-quality-panel'
import { renderColumnStatistics } from './components/column-statistics'
import { getElement } from './utils/dom'
import { renderChartPanel, destroyChart } from './components/chart-panel'
import { renderInsightsPanel } from './components/insights-panel'
import { generateInsights } from './features/insights/generate-insights'

const fileInput = getElement<HTMLInputElement>('#csv-input')
const status = getElement<HTMLParagraphElement>('#status')
const warning = getElement<HTMLParagraphElement>('#warning')
const summary = getElement<HTMLElement>('#summary')
const preview = getElement<HTMLElement>('#preview')
const quality = getElement<HTMLElement>('#quality')
const statistics = getElement<HTMLElement>('#statistics')
const charts = getElement<HTMLElement>('#charts')
const findings = getElement<HTMLElement>('#findings')


function clearResults(): void {
  destroyChart()
  status.textContent = ''
  warning.textContent = ''
  for (const container of [summary, charts, preview, quality, statistics, findings]) {
    container.replaceChildren()
  }
}

fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if (!file) return

  clearResults()

  const fileProblem = validateFile(file)
  if (fileProblem) {
    status.textContent = fileProblem
    return
  }

  try {
    const dataset = await parseCsv(file)

    const problems = validateDataset(dataset)
    if (problems.length > 0) {
      status.textContent = problems.join(' ')
      return
    }

    const profile = profileDataset(dataset)
    const duplicates = findDuplicates(dataset)

    status.textContent = `Loaded ${dataset.fileName}: ${dataset.rows.length} rows, ${dataset.columns.length} columns`
    warning.textContent = getParseWarning(dataset) ?? ''

    renderSummaryCards(summary, profile, duplicates)
    renderInsightsPanel(findings, generateInsights(profile, duplicates))
    renderChartPanel(charts, dataset, profile)
    renderDatasetPreview(preview, dataset)
    renderDataQualityPanel(quality, profile, duplicates)
    renderColumnStatistics(statistics, profile)
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? `Could not read the file: ${error.message}`
        : 'Could not read the file.'
  }
})