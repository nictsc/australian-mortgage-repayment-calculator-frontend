import type { CalculateRequest, CalculateResponse } from '../types/mortgage'
import { apiPost } from './client'

/** POST /api/mortgage/calculate/ — no auth required. */
export function calculate(
  request: CalculateRequest,
): Promise<CalculateResponse> {
  return apiPost<CalculateResponse>('/mortgage/calculate/', request)
}
