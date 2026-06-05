import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import CalculatorForm from './CalculatorForm'

describe('CalculatorForm', () => {
  it('submits a valid request with the default values', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CalculatorForm onSubmit={onSubmit} loading={false} />)

    await user.click(screen.getByRole('button', { name: /calculate repayments/i }))

    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(
      expect.objectContaining({
        loan_amount: 500000,
        annual_rate: 6,
        rate_type: 'variable',
        repayment_type: 'principal_and_interest',
        repayment_frequency: 'monthly',
        loan_term_years: 30,
      }),
    )
  })

  it('blocks submission and shows an error when the rate is out of range', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CalculatorForm onSubmit={onSubmit} loading={false} />)

    const rate = screen.getByLabelText(/annual rate/i)
    await user.clear(rate)
    await user.type(rate, '25')
    await user.click(screen.getByRole('button', { name: /calculate repayments/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/rate must be between/i)).toBeInTheDocument()
  })

  it('rejects an offset larger than the loan amount', async () => {
    const user = userEvent.setup()
    const onSubmit = vi.fn()
    render(<CalculatorForm onSubmit={onSubmit} loading={false} />)

    const offset = screen.getByLabelText(/offset amount/i)
    await user.clear(offset)
    await user.type(offset, '600000') // loan defaults to 500000
    await user.click(screen.getByRole('button', { name: /calculate repayments/i }))

    expect(onSubmit).not.toHaveBeenCalled()
    expect(screen.getByText(/offset cannot exceed/i)).toBeInTheDocument()
  })
})
