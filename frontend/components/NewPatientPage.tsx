import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Mic, MicOff, Upload, FileImage, X, 
  CheckCircle, Loader2, ArrowRight, User, Hash, Wand2
} from 'lucide-react';
import { Patient, RiskLevel, StudyStatus, Finding } from '../types';
import { refineMedicalTranscript } from '../services/geminiService';

interface NewPatientPageProps {
  onBack: () => void;
  onSave: (patient: Patient) => void;
}

const NewPatientPage: React.FC<NewPatientPageProps> = ({ onBack, onSave }) => {
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [rawSpokenText, setRawSpokenText] = useState('');
  const [aiFixedText, setAiFixedText] = useState('');
  const [isProcessingVoice, setIsProcessingVoice] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    id: '', 
    age: '',
    sex: 'M' as 'M' | 'F' | 'O',
    indication: '',
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Smart Voice Logic
  const toggleRecording = () => {
    if (isRecording) {
      // Stop recording and process
      if (recognitionRef.current) {
        recognitionRef.current.stop();
        // Processing will happen in onend
      }
    } else {
      // Start recording
      if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = false; // Don't show interim results
        recognition.lang = 'en-US';

        let allFinalTranscripts: string[] = [];

        recognition.onresult = (event: any) => {
          // Only collect final results, don't update UI yet
          for (let i = event.resultIndex; i < event.results.length; i++) {
            if (event.results[i].isFinal) {
              const transcript = event.results[i][0].transcript;
              allFinalTranscripts.push(transcript);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          recognitionRef.current = null;
        };

        recognition.onend = async () => {
          setIsRecording(false);
          const fullTranscript = allFinalTranscripts.join(' ').trim();
          
          if (fullTranscript) {
            setRawSpokenText(fullTranscript);
            setIsProcessingVoice(true);
            const cleaned = await refineMedicalTranscript(fullTranscript);
            setAiFixedText(cleaned);
            setTranscript(cleaned);
            setIsProcessingVoice(false);
          }
          recognitionRef.current = null;
          allFinalTranscripts = [];
        };

        recognition.start();
        recognitionRef.current = recognition;
        setIsRecording(true);
        allFinalTranscripts = []; // Reset
      } else {
        alert('Speech recognition is not supported in this browser.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setUploadedFiles(prev => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    setLoading(true);
    setTimeout(() => {
        let findings: Finding[] = [];
        if (uploadedFiles.length > 0) {
            findings = uploadedFiles.map((file, idx) => ({
                id: `new-f-${Date.now()}-${idx}`,
                arteryName: idx === 0 ? 'LAD (Left Anterior Descending)' : (idx === 1 ? 'RCA (Right Coronary Artery)' : 'LCX (Left Circumflex)'),
                confidence: 85 + Math.floor(Math.random() * 14),
                blockagePercentage: Math.floor(Math.random() * 90),
                imageUrl: URL.createObjectURL(file), 
                isFlagged: Math.random() > 0.5
            }));
        } else {
             findings = [
                {
                   id: 'new-1',
                   arteryName: 'LAD (Left Anterior Descending)',
                   confidence: 88,
                   blockagePercentage: 65,
                   imageUrl: 'https://picsum.photos/seed/newpatient1/800/800',
                   isFlagged: true
                }
            ];
        }

        const maxBlockage = Math.max(...findings.map(f => f.blockagePercentage));
        let risk: RiskLevel = RiskLevel.LOW;
        if (maxBlockage > 70) risk = RiskLevel.HIGH;
        else if (maxBlockage > 50) risk = RiskLevel.MEDIUM;

        const newPatient: Patient = {
          id: formData.id || `P-${Math.floor(Math.random() * 10000)}`,
          name: formData.name || 'Unknown Patient',
          age: parseInt(formData.age) || 50,
          sex: formData.sex as 'M'|'F'|'O',
          lastAngiographyDate: new Date().toLocaleDateString(),
          status: StudyStatus.NEEDS_REVIEW,
          riskLevel: risk,
          reportGenerated: false,
          indication: transcript || formData.indication || 'Routine Checkup',
          diagnosis: risk === RiskLevel.HIGH ? 'CAD - Single Vessel Disease' : 'Normal Coronaries',
          hemodynamicData: 'HR: 75 BPM | BP: 120/80 mmHg',
          operator: 'Dr. Current User',
          impression: `Angiography reveals ${risk.toLowerCase()} risk findings.`,
          advice: 'Medical Management',
          findings: findings
        };
        
        onSave(newPatient);
        setLoading(false);
    }, 2500);
  };

  if (loading) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-slate-50">
              <div className="bg-white p-12 rounded-2xl shadow-xl border border-blue-100 text-center max-w-md w-full">
                  <div className="relative w-20 h-20 mx-auto mb-6">
                       <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                       <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                       <Loader2 className="absolute inset-0 m-auto text-blue-600 w-8 h-8 animate-pulse" />
                  </div>
                  <h2 className="text-xl font-bold text-slate-800 mb-2">Analyzing Angiography</h2>
                  <p className="text-slate-500 mb-6">Processing {uploadedFiles.length} images with YOLO v4.2...</p>
                  
                  <div className="space-y-3 text-sm text-slate-500 text-left bg-slate-50 p-5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-3 text-green-600 font-medium">
                        <CheckCircle className="w-4 h-4" /> 
                        Image Upload Complete
                      </div>
                      <div className="flex items-center gap-3 text-blue-600 font-medium animate-pulse">
                        <Loader2 className="w-4 h-4 animate-spin" /> 
                        Segmenting Arteries...
                      </div>
                  </div>
              </div>
          </div>
      )
  }

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-4 shadow-sm shrink-0 z-10">
         <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition-colors">
            <ArrowLeft className="w-5 h-5" />
         </button>
         <div>
            <h1 className="text-xl font-bold text-slate-800">New Patient Study</h1>
            <p className="text-xs text-slate-500">Enter details and upload imaging series</p>
         </div>
      </div>

      {/* Main Content - Centered Grid with Equal Height Columns */}
      <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center">
        <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 flex-1">
            
            {/* Left Column: Data Entry */}
            <div className="flex flex-col gap-6 h-full">
                {/* Demographics */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-500" />
                        Patient Demographics
                    </h3>
                    
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    placeholder="e.g. John Smith"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Patient ID</label>
                                <div className="relative">
                                    <Hash className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input 
                                        type="text" 
                                        className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                        placeholder="e.g. P-1234"
                                        value={formData.id}
                                        onChange={(e) => setFormData({...formData, id: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                                <input 
                                    type="number" 
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    placeholder="Years"
                                    value={formData.age}
                                    onChange={(e) => setFormData({...formData, age: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-slate-600 mb-1">Sex</label>
                                <select 
                                    className="w-full px-4 py-2 bg-white border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-slate-800"
                                    value={formData.sex}
                                    onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
                                >
                                    <option value="M">Male</option>
                                    <option value="F">Female</option>
                                    <option value="O">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Voice Notes - Fills remaining height */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col flex-1">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                            <Mic className="w-5 h-5 text-blue-500" />
                            Voice Indication
                        </h3>
                        {isRecording && <span className="text-red-500 text-xs font-bold animate-pulse flex items-center gap-1">● REC</span>}
                    </div>

                    <div className="space-y-4 flex-1 flex flex-col">
                        <button 
                            onClick={toggleRecording}
                            disabled={isProcessingVoice}
                            className={`w-full py-3 border-2 border-dashed rounded-xl flex items-center justify-center gap-3 transition-all ${
                                isRecording 
                                ? 'border-red-400 bg-red-50 text-red-600' 
                                : 'border-slate-200 hover:border-blue-400 hover:bg-blue-50 text-slate-500 hover:text-blue-600'
                            }`}
                        >
                            {isProcessingVoice ? (
                                <><Loader2 className="w-5 h-5 animate-spin" /> Cleaning Audio...</>
                            ) : (
                                isRecording ? <><MicOff className="w-5 h-5" /> Stop Dictation</> : <><Mic className="w-5 h-5" /> Start Dictation</>
                            )}
                        </button>

                        <div className="relative flex-1">
                            <textarea 
                                className="w-full h-full p-4 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                                placeholder="Indication notes..."
                                value={transcript}
                                onChange={(e) => setTranscript(e.target.value)}
                            />
                            {transcript && !isProcessingVoice && (
                                <div className="absolute bottom-3 right-3 text-xs text-blue-600 font-medium flex items-center gap-1 bg-blue-50 px-2 py-1 rounded-full border border-blue-100">
                                    <Wand2 className="w-3 h-3" /> AI Refined
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Documentation Box - Shows spoken and AI-fixed text */}
                {(rawSpokenText || aiFixedText) && (
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200 shadow-sm">
                        <h3 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                            <CheckCircle className="w-4 h-4 text-blue-500" />
                            Voice Documentation
                        </h3>
                        <div className="space-y-3">
                            {rawSpokenText && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1">Raw Spoken Text:</p>
                                    <p className="text-sm text-slate-700 bg-white/80 p-2 rounded border border-slate-200 italic">
                                        "{rawSpokenText}"
                                    </p>
                                </div>
                            )}
                            {aiFixedText && (
                                <div>
                                    <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1">
                                        <Wand2 className="w-3 h-3" />
                                        AI Refined Text:
                                    </p>
                                    <p className="text-sm text-slate-800 bg-white p-2 rounded border border-blue-200 font-medium">
                                        "{aiFixedText}"
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Right Column: Upload - Fills height to match Left Column */}
            <div className="flex flex-col h-full">
                <div 
                    className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex-1 flex flex-col h-full"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <h3 className="font-semibold text-slate-800 mb-4 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-blue-500" />
                        Imaging Series
                    </h3>

                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-blue-100 bg-blue-50/30 rounded-xl p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-50 hover:border-blue-300 transition-all mb-6 group shrink-0"
                    >
                        <div className="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                             <Upload className="w-8 h-8 text-blue-500" />
                        </div>
                        <p className="text-slate-800 font-medium">Click to upload DICOM / Image Folder</p>
                        <p className="text-slate-400 text-sm mt-1">Supports multi-select & drag-and-drop</p>
                        <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            multiple 
                            // @ts-ignore
                            webkitdirectory=""
                            onChange={handleFileChange} 
                        />
                    </div>

                    {/* File List */}
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 min-h-[200px] mb-4">
                        {uploadedFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic border border-slate-100 rounded-lg bg-slate-50">
                                <FileImage className="w-8 h-8 mb-2 opacity-20" />
                                No images selected yet.
                            </div>
                        ) : (
                            uploadedFiles.map((file, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100 group hover:border-blue-200 transition-colors">
                                    <div className="w-12 h-12 bg-slate-200 rounded overflow-hidden flex items-center justify-center shrink-0">
                                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-slate-700 truncate">{file.name}</p>
                                        <p className="text-xs text-slate-400">{(file.size / 1024).toFixed(0)} KB</p>
                                    </div>
                                    <button 
                                        onClick={() => removeFile(idx)}
                                        className="text-slate-400 hover:text-red-500 p-2 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>

                    <div className="pt-4 border-t border-slate-100 mt-auto">
                        <div className="flex justify-between items-center mb-4 text-sm text-slate-500">
                             <span>{uploadedFiles.length} files ready for AI</span>
                             <span>Estimated Time: {uploadedFiles.length > 0 ? '2-5s' : '0s'}</span>
                        </div>
                        <button 
                            onClick={handleAnalyze}
                            disabled={uploadedFiles.length === 0}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:shadow-none transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                        >
                            Run AI Analysis <ArrowRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

        </div>
      </div>
    </div>
  );
};

export default NewPatientPage;