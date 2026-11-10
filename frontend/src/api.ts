export type Operation = 'add'|'subtract'|'multiply'|'divide'|'power'|'sqrt'|'percent';
export interface CalculationResponse { operation: Operation; result: number }
const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080';
export async function calculate(operation: Operation, a: number, b = 0): Promise<number> {
  const response = await fetch(`${API_BASE}/api/calculate/${operation}`, {
    method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({a,b})
  });
  const data = await response.json() as CalculationResponse | {error:string};
  if (!response.ok) throw new Error('error' in data ? data.error : 'Something went wrong.');
  return (data as CalculationResponse).result;
}
