export enum RiskLevel {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'Critical'
}

export enum StudyStatus {
  COMPLETED = 'Completed',
  NEEDS_REVIEW = 'Needs Review',
  DRAFT = 'Draft',
  WAITING = 'Waiting'
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
}

export interface Finding {
  id: string;
  arteryName: string; // e.g., LAD, RCA, LCX
  confidence: number;
  blockagePercentage: number;
  imageUrl: string;
  heatmapUrl?: string;
  isFlagged: boolean;
  notes?: string;
  excludedFromReport?: boolean; // If true, this finding won't appear in the PDF report
}

export interface Patient {
  id: string;
  name: string;
  age: number;
  sex: 'M' | 'F' | 'O';
  lastAngiographyDate: string;
  status: StudyStatus;
  riskLevel: RiskLevel;
  findings: Finding[];
  reportGenerated?: boolean;
  // Metadata for Detailed Report
  accessSite?: string;
  contrastVolume?: number; // ml
  indication?: string;
  diagnosis?: string;
  hemodynamicData?: string; // e.g., "HR: 80 BPM, Aorta: 135/75"
  operator?: string;
  impression?: string;
  advice?: string;
  studyId?: string; // backend study id produced when uploading images
}

// Mock Data Generators
const ARTERIES = ['LAD (Left Anterior Descending)', 'RCA (Right Coronary Artery)', 'LCX (Left Circumflex)', 'LM (Left Main)'];
const INDICATIONS = ['Stable Angina', 'NSTEMI', 'Abnormal Stress Test', 'Pre-op clearance'];

export const generateMockPatients = (count: number): Patient[] => {
  return Array.from({ length: count }).map((_, i) => {
    const isCritical = Math.random() > 0.7;
    const statusVal = isCritical ? StudyStatus.NEEDS_REVIEW : (Math.random() > 0.5 ? StudyStatus.COMPLETED : StudyStatus.WAITING);
    
    return {
      id: `P-${1000 + i}`,
      name: `Patient ${String.fromCharCode(65 + (i % 26))}${i}`, // e.g., Patient A0, B1
      age: 45 + Math.floor(Math.random() * 40),
      sex: Math.random() > 0.33 ? (Math.random() > 0.5 ? 'M' : 'F') : 'O',
      lastAngiographyDate: new Date(Date.now() - Math.floor(Math.random() * 1000000000)).toLocaleDateString(),
      status: statusVal,
      riskLevel: isCritical ? RiskLevel.HIGH : (Math.random() > 0.5 ? RiskLevel.MEDIUM : RiskLevel.LOW),
      reportGenerated: statusVal === StudyStatus.COMPLETED,
      accessSite: Math.random() > 0.3 ? 'Right Radial' : 'Right Femoral',
      contrastVolume: 50 + Math.floor(Math.random() * 100),
      indication: INDICATIONS[Math.floor(Math.random() * INDICATIONS.length)],
      diagnosis: isCritical ? 'CAD - Single Vessel Disease' : 'Normal Coronaries',
      hemodynamicData: 'HR: 78 BPM | Aorta: 130/80 mmHg',
      operator: 'Dr. Sai Ravi Shanker',
      impression: isCritical ? 'Significant stenosis in LAD.' : 'No significant obstructive coronary artery disease.',
      advice: isCritical ? 'Medical Management + Stent' : 'Medical Management',
      findings: Array.from({ length: 3 + Math.floor(Math.random() * 4) }).map((__, j) => ({
        id: `f-${i}-${j}`,
        arteryName: ARTERIES[j % ARTERIES.length],
        confidence: 85 + Math.floor(Math.random() * 14),
        blockagePercentage: isCritical && j === 0 ? 70 + Math.floor(Math.random() * 25) : 10 + Math.floor(Math.random() * 40),
        imageUrl: `https://picsum.photos/seed/${i}-${j}/800/800`, // Consistent random images
        isFlagged: isCritical && j === 0
      }))
    };
  });
};