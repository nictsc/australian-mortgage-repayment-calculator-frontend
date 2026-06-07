import { formatAUD, formatPercent, toNumber } from './money'

describe('toNumber', () => {
  it('parses a decimal string from the API', () => {
    expect(toNumber('2997.75')).toBe(2997.75)
  })

  it('parses whole-dollar strings', () => {
    expect(toNumber('500000.00')).toBe(500000)
  })
})

describe('formatAUD', () => {
  it('formats a number as Australian currency', () => {
    expect(formatAUD(2997.75)).toBe('$2,997.75')
  })

  it('accepts an API decimal string directly', () => {
    expect(formatAUD('500000.00')).toBe('$500,000.00')
  })
})

describe('formatPercent', () => {
  it('always shows two decimal places', () => {
    expect(formatPercent(6)).toBe('6.00%')
    expect(formatPercent(5.75)).toBe('5.75%')
  })
})
