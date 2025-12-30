export type PatientCreateResponse = {
  id: string;
  name: string;
};

export async function createPatient(name: string): Promise<PatientCreateResponse> {
  const base = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:8000';
  const res = await fetch(`${base}/patients`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name }),
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`createPatient failed: ${res.status} ${res.statusText} ${txt}`);
  }
  return (await res.json()) as PatientCreateResponse;
}
