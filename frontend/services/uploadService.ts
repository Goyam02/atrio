export type UploadBatchResponse = {
  patient_id: string;
  study_id: string;
  uploaded: number;
  images: Array<{ image_id: string; file_path: string }>;
};

export async function uploadBatch(patientId: string, files: File[]): Promise<UploadBatchResponse> {
  const base = (import.meta.env && (import.meta.env.VITE_API_BASE as string)) || 'http://localhost:8000';
  const url = `${base}/upload-batch?patient_id=${encodeURIComponent(patientId)}`;
  const fd = new FormData();
  files.forEach((f) => fd.append('files', f));

  const res = await fetch(url, {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`uploadBatch failed: ${res.status} ${res.statusText} ${txt}`);
  }
  return (await res.json()) as UploadBatchResponse;
}
