import React, { useState } from 'react';
import { X, Mic, Upload, User, ArrowRight, Loader2 } from 'lucide-react';
import { Patient, RiskLevel, StudyStatus } from '../types';

interface NewPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
}

const NewPatientModal: React.FC<NewPatientModalProps> = ({ isOpen, onClose, onSave }) => {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    sex: 'M',
  });

  if (!isOpen) return null;

  const handleNext = async () => {
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      setLoading(true);
      // Simulate Upload and AI Analysis
      setTimeout(() => {
        const newPatient: Patient = {
          id: `P-${Math.floor(Math.random() * 10000)}`,
          name: formData.name || 'Unknown Patient',
          age: parseInt(formData.age) || 50,
          sex: formData.sex as 'M'|'F',
          lastAngiographyDate: new Date().toLocaleDateString(),
          status: StudyStatus.DRAFT,
          riskLevel: RiskLevel.MEDIUM, // Mock result
          reportGenerated: false,
          findings: [
            {
               id: 'new-1',
               arteryName: 'LAD (Left Anterior Descending)',
               confidence: 88,
               blockagePercentage: 65,
               imageUrl: 'https://picsum.photos/seed/newpatient/800/800',
               isFlagged: true
            }
          ]
        };
        onSave(newPatient);
        setLoading(false);
        setStep(1);
        setFormData({ name: '', age: '', sex: 'M' });
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
          <h3 className="font-bold text-slate-800 text-lg">New Patient Study</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8">
          
          {/* Progress */}
          <div className="flex items-center justify-center mb-8 gap-2">
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 1 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
            <div className={`h-2 w-16 rounded-full transition-colors ${step >= 2 ? 'bg-blue-600' : 'bg-slate-200'}`}></div>
          </div>

          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 fade-in">
               <h4 className="font-semibold text-slate-700 mb-4">Step 1: Patient Demographics</h4>
               
               <div>
                 <label className="block text-sm font-medium text-slate-600 mb-1">Full Name</label>
                 <div className="relative">
                   <User className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
                   <input 
                     type="text" 
                     className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="John Doe"
                     value={formData.name}
                     onChange={(e) => setFormData({...formData, name: e.target.value})}
                   />
                 </div>
               </div>

               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Age</label>
                   <input 
                     type="number" 
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                     placeholder="e.g. 55"
                     value={formData.age}
                     onChange={(e) => setFormData({...formData, age: e.target.value})}
                   />
                 </div>
                 <div>
                   <label className="block text-sm font-medium text-slate-600 mb-1">Sex</label>
                   <select 
                     className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                     value={formData.sex}
                     onChange={(e) => setFormData({...formData, sex: e.target.value as any})}
                   >
                     <option value="M">Male</option>
                     <option value="F">Female</option>
                   </select>
                 </div>
               </div>

               <div className="pt-4 border-t border-slate-100">
                  <p className="text-xs text-slate-500 mb-2 font-medium uppercase">Or Dictate Details</p>
                  <button className="w-full py-3 border-2 border-dashed border-slate-300 rounded-lg text-slate-500 hover:text-blue-600 hover:border-blue-400 hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                    <Mic className="w-5 h-5" />
                    Record Patient Intake
                  </button>
               </div>
            </div>
          )}

          {step === 2 && !loading && (
            <div className="space-y-6 animate-in slide-in-from-right-4 fade-in text-center">
               <h4 className="font-semibold text-slate-700">Step 2: Upload Angiography Series</h4>
               
               <div className="border-2 border-dashed border-blue-200 bg-blue-50 rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer hover:bg-blue-100 transition-colors">
                  <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mb-4">
                    <Upload className="w-8 h-8 text-blue-500" />
                  </div>
                  <p className="text-blue-800 font-medium">Click to upload DICOM / Images</p>
                  <p className="text-blue-400 text-sm mt-1">or drag and drop files here</p>
               </div>
               
               <p className="text-xs text-slate-400">YOLO Model v4.2 will run automatically upon upload.</p>
            </div>
          )}

          {loading && (
             <div className="py-12 flex flex-col items-center justify-center animate-in fade-in">
                <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h4 className="text-lg font-semibold text-slate-800">Processing Imaging Data...</h4>
                <p className="text-slate-500">Detecting vessels and analyzing stenosis...</p>
             </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-6 py-4 flex justify-end gap-3">
           <button onClick={onClose} className="px-4 py-2 text-slate-600 font-medium hover:text-slate-800">Cancel</button>
           <button 
             onClick={handleNext}
             disabled={loading}
             className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-50"
           >
             {step === 1 ? 'Next Step' : (loading ? 'Processing...' : 'Run Analysis')}
             {!loading && <ArrowRight className="w-4 h-4" />}
           </button>
        </div>
      </div>
    </div>
  );
};

export default NewPatientModal;