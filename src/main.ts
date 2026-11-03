import './style.css'
import {parseCsv} from './features/csv/parse.csv'
import { validateDataset, validateFile } from './features/csv/validate-csv'
import { renderDatasetPreview } from './components/dataset-preview'
import { profileDataset } from './features/analysis/profile-dataset'


const fileInput = document.querySelector<HTMLInputElement>('#csv-input')
const status = document.querySelector<HTMLParagraphElement>('#status')

//preview container
const preview = document.querySelector<HTMLElement>('#preview')
if (!fileInput || !status || !preview) {
  throw new Error('Required HTML elements are missing')
}

if (!fileInput || !status) {
  throw new Error('Required HTML elements are missing')
}


fileInput.addEventListener('change', async () => {
  const file = fileInput.files?.[0]
  if(!file) return 

  // clear the old preview
  preview.replaceChildren()

  const fileProblem = validateFile(file)
  if(fileProblem) {
    status.textContent = fileProblem
    return 
  }

  try {
    const dataset = await parseCsv(file)

    const problems = validateDataset(dataset)
    if (problems.length > 0) {
      status.textContent = problems.join('  ')
      return
    }    
  

  status.textContent = `Loaded ${dataset.fileName}: ${dataset.rows.length} rows, ${dataset.columns.length} columns`
    // draw the table
    renderDatasetPreview(preview, dataset) 
    console.table(profileDataset(dataset).columns)
    console.log('Columns:', dataset.columns)
    console.table(dataset.rows.slice(0, 5))
  } catch (error) {
    status.textContent =
      error instanceof Error
        ? `Could not read the file: ${error.message}`
        : 'Could not read the file.'
  }
})