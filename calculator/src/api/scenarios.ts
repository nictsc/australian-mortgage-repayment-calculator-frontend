import { apiDelete, apiGet, apiPost } from './client'
import type { CalculateRequest, Scenario } from '../types/mortgage'

export function listScenarios(token: string): Promise<Scenario[]> {
  return apiGet<Scenario[]>('/mortgage/scenarios/', token)
}

export function createScenario(
  name: string,
  loan: CalculateRequest,
  token: string,
): Promise<Scenario> {
  return apiPost<Scenario>('/mortgage/scenarios/', { name, loan }, token)
}

export function deleteScenario(id: number, token: string): Promise<void> {
  return apiDelete(`/mortgage/scenarios/${id}/`, token)
}
