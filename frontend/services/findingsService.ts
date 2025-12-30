export type FindingsView = {
  study_id: string;
  images: Array<{
    image_id: string;
    artery: string;
    blockage_pct: number;
    confidence: number;
    image_path: string | null;
    heatmap_path: string | null;
  }>;
};

export async function getFindingsView(studyId: string): Promise<FindingsView> {
  const base = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:8000';
  const url = `${base}/studies/${encodeURIComponent(studyId)}/findings-view`;
  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`getFindingsView failed: ${res.status} ${res.statusText} ${txt}`);
  }
  return (await res.json()) as FindingsView;
}
