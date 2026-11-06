import type { Insight } from '../types/analysis'
import { makeElement } from '../utils/dom'

export function renderInsightsPanel(
  container: HTMLElement,
  insights: Insight[],
): void {
  container.replaceChildren()
  container.appendChild(makeElement('h2', 'Findings'))

  const list = makeElement('ul', '', 'insights')
  for (const insight of insights) {
    const prefix = insight.severity === 'warning' ? 'Check: ' : ''
    list.appendChild(
      makeElement('li', prefix + insight.text, `insight ${insight.severity}`),
    )
  }
  container.appendChild(list)
}