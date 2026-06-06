import styles from './ResultsToggle.module.css'

export type ResultsView = 'graph' | 'table'

interface Props {
  view: ResultsView
  onChange: (view: ResultsView) => void
}

// A controlled segmented control: the parent owns `view` and we report changes up.
function ResultsToggle({ view, onChange }: Props) {
  return (
    <div className={styles.toggle} role="group" aria-label="Results view">
      <button
        type="button"
        className={view === 'graph' ? `${styles.option} ${styles.active}` : styles.option}
        aria-pressed={view === 'graph'}
        onClick={() => onChange('graph')}
      >
        Graph
      </button>
      <button
        type="button"
        className={view === 'table' ? `${styles.option} ${styles.active}` : styles.option}
        aria-pressed={view === 'table'}
        onClick={() => onChange('table')}
      >
        Table
      </button>
    </div>
  )
}

export default ResultsToggle
