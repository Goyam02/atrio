import React, { useState, useRef } from 'react';
import { 
  ArrowLeft, Download, CheckCircle, XCircle, 
  Mic, ChevronLeft, ChevronRight, Box,
  Info, Edit, Wand2, Loader2, MicOff, RefreshCw, Trash2, Save
} from 'lucide-react';
import { Patient, Finding } from '../types';
import { analyzeMedicalCorrection, refineMedicalTranscript } from '../services/geminiService';
import { jsPDF } from "jspdf";

interface AngiographyViewProps {
  patient: Patient;
  onBack: () => void;
  onUpdatePatient: (updatedPatient: Patient) => void;
}

const AngiographyView: React.FC<AngiographyViewProps> = ({ patient, onBack, onUpdatePatient }) => {
  const [selectedFindingIndex, setSelectedFindingIndex] = useState(0);
  const [is3DMode, setIs3DMode] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [rejectionNote, setRejectionNote] = useState('');
  const [isProcessingAI, setIsProcessingAI] = useState(false);
  
  // Edit Mode State
  const [editMode, setEditMode] = useState(false);
  const [reportChanges, setReportChanges] = useState('');
  
  // Voice State
  const [isRecording, setIsRecording] = useState(false);
  const [isCleaningVoice, setIsCleaningVoice] = useState(false);
  const [rawSpokenText, setRawSpokenText] = useState('');
  const [aiFixedText, setAiFixedText] = useState('');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  const correctionRef = useRef<HTMLTextAreaElement>(null);
  
  const selectedFinding = patient.findings[selectedFindingIndex];

  // Helper to update current finding
  const updateCurrentFinding = (updates: Partial<Finding>) => {
    const updatedFindings = [...patient.findings];
    updatedFindings[selectedFindingIndex] = {
      ...updatedFindings[selectedFindingIndex],
      ...updates
    };
    onUpdatePatient({
      ...patient,
      findings: updatedFindings
    });
  };

  const handleDeleteFinding = (index: number, e: React.MouseEvent) => {
      e.stopPropagation();
      if (patient.findings.length <= 1) {
          alert("A report must contain at least one image/finding.");
          return;
      }
      
      // Completely remove the finding from the array
      const updatedFindings = patient.findings.filter((_, i) => i !== index);
      const newPatient = { ...patient, findings: updatedFindings };
      onUpdatePatient(newPatient);
      
      // Adjust selection if needed
      if (index === selectedFindingIndex) {
          setSelectedFindingIndex(Math.max(0, index - 1));
      } else if (index < selectedFindingIndex) {
          setSelectedFindingIndex(selectedFindingIndex - 1);
      }
  };

  const handleNext = () => {
    if (selectedFindingIndex < patient.findings.length - 1) {
      setSelectedFindingIndex(prev => prev + 1);
      setIs3DMode(false);
    }
  };

  const handlePrev = () => {
    if (selectedFindingIndex > 0) {
      setSelectedFindingIndex(prev => prev - 1);
      setIs3DMode(false);
    }
  };

  const handleCorrectionClick = () => {
    setIsRejecting(true);
    // Auto-scroll to text box
    setTimeout(() => {
        correctionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        correctionRef.current?.focus();
    }, 100);
  };

  const handleVoiceInput = () => {
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
            setIsCleaningVoice(true);
            const cleaned = await refineMedicalTranscript(fullTranscript);
            setAiFixedText(cleaned);
            // Show AI interpretation
            setRejectionNote(prev => {
              const base = prev || '';
              return base + (base && !base.endsWith(' ') ? ' ' : '') + cleaned;
            });
            setIsCleaningVoice(false);
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

  const handleRejectSubmit = async () => {
    if (!rejectionNote) return;
    
    setIsProcessingAI(true);
    const correction = await analyzeMedicalCorrection(selectedFinding, rejectionNote);
    
    updateCurrentFinding(correction);
    
    setIsProcessingAI(false);
    setIsRejecting(false);
    setRejectionNote('');
  };

  const getImageData = (url: string): Promise<string> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = "Anonymous";
        img.src = url;
        img.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext("2d");
            if (ctx) {
                ctx.drawImage(img, 0, 0);
                resolve(canvas.toDataURL("image/jpeg"));
            } else {
                reject("Canvas context failed");
            }
        };
        img.onerror = reject;
    });
  }

  const generatePDF = async (currentPatient: Patient) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = 20;

    // Helper to add text
    const addText = (text: string, x: number, y: number, fontSize = 10, font = 'helvetica', style = 'normal', align = 'left') => {
        doc.setFont(font, style);
        doc.setFontSize(fontSize);
        doc.text(text, x, y, { align: align as any });
    };

    // --- Header ---
    addText("ASTER PRIME HOSPITAL", pageWidth / 2, yPos, 18, 'times', 'bold', 'center');
    yPos += 10;
    
    // Line
    doc.setLineWidth(0.5);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    addText("CORONARY ANGIOGRAM REPORT", pageWidth / 2, yPos, 14, 'times', 'bold', 'center');
    doc.line(pageWidth/2 - 40, yPos + 1, pageWidth/2 + 40, yPos + 1); // Underline
    yPos += 15;

    // --- Patient Details Grid ---
    const startY = yPos;
    addText(`Patient Name: ${currentPatient.name.toUpperCase()}`, margin, yPos, 11, 'times', 'bold');
    addText(`Age/Sex: ${currentPatient.age}Y / ${currentPatient.sex}`, pageWidth / 2 + 10, yPos, 11, 'times', 'bold');
    yPos += 8;
    addText(`ID: ${currentPatient.id}`, margin, yPos, 11, 'times');
    addText(`Date: ${new Date().toLocaleDateString()}`, pageWidth / 2 + 10, yPos, 11, 'times');
    yPos += 10;

    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- Procedure Details ---
    const details = [
        `Diagnosis: ${currentPatient.diagnosis || 'CAD'}`,
        `Operator: ${currentPatient.operator || 'Dr. SAI RAVI SHANKER'}`,
        `Approach: ${currentPatient.accessSite || 'Radial'}`,
        `Contrast: Omni Paque (${currentPatient.contrastVolume}ml)`
    ];
    
    details.forEach(detail => {
        addText(detail, margin, yPos, 10, 'times');
        yPos += 6;
    });
    
    yPos += 4;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;

    // --- Findings ---
    addText("Hemodynamic Data: " + (currentPatient.hemodynamicData || "HR: 80 BPM, Normal LV"), margin, yPos, 10, 'times', 'bold');
    yPos += 10;
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 10;
    
    addText("FINDINGS:", margin, yPos, 11, 'times', 'bold');
    yPos += 8;

    currentPatient.findings.forEach((finding, index) => {
        const text = `${finding.arteryName}: ${finding.blockagePercentage}% Stenosis. ${finding.isFlagged ? 'Significant Disease.' : 'Normal.'}`;
        addText(text, margin, yPos, 10, 'times');
        yPos += 6;
    });
    yPos += 5;

    // --- Images ---
    // Check space
    const imgHeight = 60;
    const imgWidth = 80;
    
    if (yPos + imgHeight > 270) {
        doc.addPage();
        yPos = 20;
    }

    addText("ANGIOGRAPHIC IMAGES:", margin, yPos, 11, 'times', 'bold');
    yPos += 10;

    let xImg = margin;
    
    // Include all findings (removed ones are already filtered out)
    for (let i = 0; i < currentPatient.findings.length; i++) {
        const f = currentPatient.findings[i];
        
        try {
            // Load image
            const imgData = await getImageData(f.imageUrl);
            
            // Check page break
            if (yPos + imgHeight > 270) {
                doc.addPage();
                yPos = 20;
                xImg = margin;
            }

            doc.addImage(imgData, 'JPEG', xImg, yPos, imgWidth, imgHeight);
            
            // Label under image
            doc.setFontSize(8);
            doc.text(f.arteryName, xImg, yPos + imgHeight + 5);

            // Move X
            if (xImg === margin) {
                xImg = margin + imgWidth + 10; // Move right
            } else {
                xImg = margin; // Reset left
                yPos += imgHeight + 15; // Move down
            }
        } catch (e) {
            console.error("Could not load image for PDF", e);
        }
    }

    // Reset Y if we ended on the right column
    if (xImg !== margin) yPos += imgHeight + 15;

    // --- Impression & Advice ---
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }

    yPos += 10;
    addText(`IMPRESSION: ${currentPatient.impression || 'Single Vessel Disease'}`, margin, yPos, 11, 'times', 'bold');
    yPos += 8;
    addText(`ADVICE: ${currentPatient.advice || 'Medical Management'}`, margin, yPos, 11, 'times', 'bold');
    yPos += 20;

    // --- Footer / Signatures ---
    if (yPos > 240) {
        doc.addPage();
        yPos = 20;
    }
    
    doc.rect(margin, yPos, (pageWidth - margin*3)/2, 40); // Sig Box 1
    doc.rect(pageWidth/2 + 5, yPos, (pageWidth - margin*3)/2, 40); // Sig Box 2
    
    addText("REPORTED BY", margin + 5, yPos + 8, 9, 'times', 'bold');
    addText("REVIEWED BY", pageWidth/2 + 10, yPos + 8, 9, 'times', 'bold');

    addText("Dr. SRAVAN PERAVALI", margin + 5, yPos + 30, 10, 'times');
    addText("Dr. SAI RAVI SHANKER", pageWidth/2 + 10, yPos + 30, 10, 'times');

    doc.save(`${currentPatient.name.replace(/\s+/g, '_')}_Report.pdf`);
  };

  const handleFinalizeStudy = async () => {
     if (window.confirm("Confirm validation of all findings? This will generate the final report.")) {
        const updatedPatient = {
            ...patient, 
            reportGenerated: true, 
            status: 'Completed' as any
        };
        onUpdatePatient(updatedPatient);
        // Immediate download
        await generatePDF(updatedPatient);
     }
  };

  const handleRegenerate = async () => {
    // Apply changes from the text box if needed (mock logic)
    const updatedPatient = { ...patient, reportGenerated: true };
    
    if (reportChanges) {
       updatedPatient.advice = (updatedPatient.advice || "") + `\n[REVISION NOTE]: ${reportChanges}`;
    }

    onUpdatePatient(updatedPatient);
    await generatePDF(updatedPatient);
    
    // Exit edit mode
    setEditMode(false);
    setReportChanges('');
  };

  return (
    <div className="h-full flex gap-6 bg-slate-50 p-2">
      
      {/* 1. LEFT MAIN SECTION (Card) */}
      <div className="flex-1 flex flex-col bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        
        {/* Header */}
        <div className="h-16 border-b border-slate-100 flex items-center justify-between px-6 shrink-0">
            <div className="flex items-center gap-4">
            <button onClick={onBack} className="text-slate-400 hover:text-slate-800 transition-colors bg-slate-50 p-2 rounded-lg">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h2 className="text-slate-800 font-bold text-lg">{patient.name}</h2>
                <span className="text-slate-400 text-sm font-normal">ID: {patient.id}</span>
            </div>
            </div>
            {/* View Mode Toggle */}
            <div className="flex bg-slate-100 p-1 rounded-lg">
                <button 
                   onClick={() => setIs3DMode(false)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${!is3DMode ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    2D Angio
                </button>
                <button 
                   onClick={() => setIs3DMode(true)}
                   className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${is3DMode ? 'bg-white text-blue-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                    3D Model
                </button>
            </div>
        </div>

        {/* Main Viewer */}
        <div className="flex-1 relative flex items-center justify-center bg-slate-50 overflow-hidden">
             {/* 3D Overlay or Main Image */}
             {is3DMode ? (
                <div className="flex flex-col items-center justify-center">
                    <Box className="w-24 h-24 text-blue-300 animate-pulse mb-4" />
                    <p className="text-slate-500 font-mono text-sm">INTERACTIVE 3D MODEL</p>
                </div>
            ) : (
                <div className="relative w-full h-full flex items-center justify-center p-8">
                    <div className="relative max-w-2xl max-h-[60vh] flex items-center justify-center">
                        <img 
                            src={selectedFinding.imageUrl} 
                            alt="Angiography" 
                            className="max-h-full max-w-full object-contain mix-blend-multiply"
                        />
                        {/* Bounding Box */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 border-2 border-red-500/60 shadow-[0_0_15px_rgba(239,68,68,0.2)] rounded-lg pointer-events-none">
                             <div className="absolute -top-3 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                                 {selectedFinding.blockagePercentage}% Stenosis
                             </div>
                        </div>
                    </div>
                </div>
            )}
        </div>

        {/* Film Strip */}
        <div className="h-32 bg-white border-t border-slate-100 flex items-center px-4 shrink-0">
            <button onClick={handlePrev} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <ChevronLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 flex gap-4 overflow-x-auto px-4 py-4 scrollbar-hide">
              {patient.findings.map((f, idx) => (
                <div 
                  key={f.id}
                  onClick={() => { setSelectedFindingIndex(idx); setIs3DMode(false); }}
                  className={`relative min-w-[90px] h-[70px] rounded-lg overflow-hidden cursor-pointer border-2 transition-all group ${
                    idx === selectedFindingIndex 
                      ? 'border-blue-500 ring-4 ring-blue-50 shadow-sm' 
                      : 'border-slate-100 opacity-60 hover:opacity-100 hover:border-blue-200'
                  }`}
                >
                  <img src={f.imageUrl} className="w-full h-full object-cover" alt="" />
                  {f.isFlagged && <div className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full shadow-sm border border-white"></div>}
                  
                  {/* Delete Button on Hover */}
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteFinding(idx, e);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-700 hover:scale-110 transition-all z-20 opacity-0 group-hover:opacity-100"
                    title="Remove from report"
                  >
                      <XCircle className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={handleNext} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
              <ChevronRight className="w-6 h-6" />
            </button>
        </div>

      </div>

      {/* 2. RIGHT INFO PANEL (Separate Card) */}
      <div className="w-[400px] bg-white rounded-2xl shadow-sm border border-slate-100 flex flex-col shrink-0 overflow-hidden transition-all duration-300">
         <div className="p-6 overflow-y-auto flex-1 space-y-6">
            
            {/* Edit Mode Panel */}
            {editMode && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-4">
                    <h3 className="text-yellow-800 font-bold text-sm mb-2 flex items-center gap-2">
                        <Edit className="w-4 h-4" /> Report Correction Mode
                    </h3>
                    <div className="space-y-2">
                        <label className="text-xs text-yellow-700 font-medium">Describe changes needed:</label>
                        <textarea 
                            value={reportChanges}
                            onChange={(e) => setReportChanges(e.target.value)}
                            className="w-full text-sm p-2 border border-yellow-300 rounded-lg bg-white text-slate-700 focus:ring-2 focus:ring-yellow-500 outline-none"
                            rows={3}
                            placeholder="e.g. Remove artifacts, update stenosis to 60%..."
                        />
                        <p className="text-[10px] text-yellow-600 italic">
                            * Tap the red 'X' on images below to remove them from the report.
                        </p>
                    </div>
                </div>
            )}

            {/* Finding Header */}
            <div>
                <h3 className="text-xl font-bold text-slate-800 leading-tight mb-1">{selectedFinding.arteryName}</h3>
                <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                    <span>Frame: 142/500</span>
                    <span>•</span>
                    <span>Series 3</span>
                </div>
                <div className="inline-block">
                     <span className={`px-2.5 py-1 rounded-md text-xs font-bold uppercase tracking-wide border ${
                        selectedFinding.blockagePercentage > 70 
                        ? 'bg-red-50 text-red-600 border-red-100' 
                        : 'bg-yellow-50 text-yellow-600 border-yellow-100'
                     }`}>
                        {selectedFinding.blockagePercentage > 70 ? 'High Risk' : 'Moderate'}
                     </span>
                </div>
            </div>

            {/* Clinical Context Box (Matching Reference) */}
            <div className="bg-slate-50 rounded-xl p-5 border border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wide mb-4">Clinical Context</h4>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2">
                    <div>
                        <p className="text-slate-500 text-xs mb-1">Age / Sex</p>
                        <p className="font-bold text-slate-800 text-sm">{patient.age} / {patient.sex}</p>
                    </div>
                    <div>
                         <p className="text-slate-500 text-xs mb-1">Access Site</p>
                         <p className="font-bold text-slate-800 text-sm">{patient.accessSite || 'Radial Right'}</p>
                    </div>
                    <div>
                         <p className="text-slate-500 text-xs mb-1">Contrast</p>
                         <p className="font-bold text-slate-800 text-sm">{patient.contrastVolume || 45} ml</p>
                    </div>
                    <div>
                         <p className="text-slate-500 text-xs mb-1">Study Date</p>
                         <p className="font-bold text-slate-800 text-sm">{patient.lastAngiographyDate}</p>
                    </div>
                </div>
                {patient.indication && (
                    <div className="mt-4 pt-4 border-t border-slate-200">
                        <p className="text-slate-500 text-xs mb-1">Indication / Voice Notes</p>
                        <p className="font-medium text-slate-800 text-sm italic">{patient.indication}</p>
                    </div>
                )}
            </div>

            {/* Stats Boxes (Matching Reference) */}
            <div className="flex gap-4">
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Blockage</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-slate-800">{selectedFinding.blockagePercentage}</p>
                        <span className="text-sm text-slate-400 font-medium">%</span>
                    </div>
                </div>
                <div className="flex-1 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <p className="text-xs text-slate-400 uppercase font-semibold mb-1">AI Confidence</p>
                    <div className="flex items-baseline gap-1">
                        <p className="text-3xl font-bold text-blue-600">{selectedFinding.confidence}</p>
                        <span className="text-sm text-slate-400 font-medium">%</span>
                    </div>
                </div>
            </div>

            {/* AI Notes */}
            <div className="bg-white border border-slate-100 rounded-xl p-4 shadow-sm">
                <p className="text-slate-500 text-sm italic leading-relaxed">
                   "{selectedFinding.notes || "AI detection consistent with historical data. No anomalies in vessel structure detected."}"
                </p>
            </div>

            {/* Correction UI */}
            {isRejecting && !editMode && (
               <div className="space-y-3">
                 <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 animate-in fade-in slide-in-from-bottom-2">
                   <div className="flex justify-between items-center mb-2">
                       <p className="text-blue-800 text-sm font-medium">Physician Correction</p>
                       <button 
                          onClick={handleVoiceInput}
                          disabled={isCleaningVoice}
                          className={`p-1.5 rounded-full transition-colors ${isRecording ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-white text-slate-400 hover:text-blue-600'}`}
                       >
                          {isCleaningVoice ? <Loader2 className="w-4 h-4 animate-spin"/> : (isRecording ? <MicOff className="w-4 h-4"/> : <Mic className="w-4 h-4"/>)}
                       </button>
                   </div>
                   <textarea 
                      ref={correctionRef}
                      value={rejectionNote}
                      onChange={(e) => setRejectionNote(e.target.value)}
                      placeholder="Enter findings..."
                      className="w-full bg-white border border-blue-200 rounded-lg p-2 text-sm text-slate-700 focus:ring-2 focus:ring-blue-500 outline-none mb-2"
                      rows={3}
                   />
                   <div className="flex gap-2 justify-end">
                      <button 
                        onClick={() => setIsRejecting(false)}
                        className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1.5"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleRejectSubmit}
                        disabled={isProcessingAI}
                        className="bg-blue-600 hover:bg-blue-700 text-white rounded text-xs px-3 py-1.5 font-medium flex items-center gap-1"
                      >
                        {isProcessingAI && <Loader2 className="w-3 h-3 animate-spin"/>}
                        {isProcessingAI ? 'AI...' : 'Update'}
                      </button>
                   </div>
                 </div>

                 {/* Documentation Box - Shows spoken and AI-fixed text */}
                 {(rawSpokenText || aiFixedText) && (
                     <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4 shadow-sm">
                         <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2 text-sm">
                             <CheckCircle className="w-4 h-4 text-blue-500" />
                             Voice Documentation
                         </h4>
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
            )}
         </div>

         {/* Bottom Actions */}
         <div className="p-6 border-t border-slate-100 bg-slate-50/50 space-y-3">
             {!editMode && (
                 <button 
                     onClick={handleCorrectionClick}
                     className="w-full text-red-500 text-sm hover:text-red-700 font-medium flex items-center justify-center gap-2 hover:bg-red-50 py-2 rounded-lg transition-colors border-2 border-red-500 bg-white"
                 >
                     <XCircle className="w-4 h-4" /> Correction / Reject Finding
                 </button>
             )}

             {patient.reportGenerated && !editMode ? (
                <div className="flex gap-2">
                    <button 
                        onClick={() => generatePDF(patient)}
                        className="flex-1 flex items-center justify-center gap-2 bg-green-50 text-green-700 px-4 py-2.5 rounded-lg border border-green-200 hover:bg-green-100 transition-all font-medium text-sm"
                    >
                        <Download className="w-4 h-4" />
                        Download PDF
                    </button>
                    <button 
                        onClick={() => setEditMode(true)}
                        className="flex items-center justify-center gap-2 bg-white text-slate-600 px-3 py-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition-all"
                        title="Edit Report"
                    >
                        <Edit className="w-4 h-4" />
                    </button>
                </div>
             ) : editMode ? (
                <div className="flex gap-2">
                    <button 
                        onClick={() => setEditMode(false)}
                        className="px-4 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium text-sm"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleRegenerate}
                        className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-md transition-all font-medium text-sm"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Regenerate Report
                    </button>
                </div>
             ) : (
                <button 
                    onClick={handleFinalizeStudy}
                    className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 shadow-sm shadow-blue-200 transition-all font-semibold text-sm transform active:scale-[0.98]"
                >
                    <CheckCircle className="w-4 h-4" />
                    Approve & Sign Study
                </button>
             )}
         </div>
      </div>

    </div>
  );
};

export default AngiographyView;