export async function runInference(studyId: string): Promise<{ study_id: string; status: string }> {
  const base = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:8000';
  const url = `${base}/studies/${encodeURIComponent(studyId)}/run-inference`;
  const res = await fetch(url, { method: 'POST' });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`runInference failed: ${res.status} ${res.statusText} ${txt}`);
  }
  return (await res.json()) as { study_id: string; status: string };
}
