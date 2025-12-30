import React, { useState } from 'react';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { Patient, RiskLevel } from '../types';

interface PatientListProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

const PatientList: React.FC<PatientListProps> = ({ patients, onPatientClick }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200/50 overflow-hidden flex flex-col h-full">
      {/* Controls */}
      <div className="p-3 border-b border-blue-200/50 flex flex-col sm:flex-row gap-2 justify-between items-center bg-white/50 shrink-0">
        <h2 className="text-base font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">Patient Registry</h2>
        
        <div className="flex gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-56">
             <Search className="absolute left-2 top-2 text-slate-400 w-4 h-4" />
             <input 
               type="text" 
               placeholder="Search..." 
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="w-full pl-8 pr-3 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-700 placeholder-slate-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm"
             />
          </div>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 bg-white shadow-sm transition-colors">
            <Filter className="w-3.5 h-3.5" />
          </button>
          <button className="p-1.5 border border-slate-200 rounded-lg hover:bg-slate-50 text-slate-600 bg-white shadow-sm transition-colors">
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-12 bg-slate-50 p-2 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-100 shrink-0">
        <div className="col-span-4">Patient Details</div>
        <div className="col-span-2">Age / Sex</div>
        <div className="col-span-3">Status</div>
        <div className="col-span-3 text-right">Last Exam</div>
      </div>

      {/* Table Body - Internal scroll only, no page scroll */}
      <div className="flex-1 min-h-0 overflow-hidden">
        <div className="h-full overflow-y-auto">
          {filteredPatients.map((patient) => (
            <div 
              key={patient.id}
              onClick={() => onPatientClick(patient)}
              className="grid grid-cols-12 p-2 border-b border-blue-50/50 hover:bg-gradient-to-r hover:from-blue-50/80 hover:to-indigo-50/80 cursor-pointer transition-colors group items-center"
            >
              <div className="col-span-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-100 to-indigo-100 border border-blue-200 flex items-center justify-center text-xs font-bold text-blue-700 group-hover:from-blue-200 group-hover:to-indigo-200 group-hover:text-indigo-700 transition-colors shrink-0">
                  {patient.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm text-slate-800 group-hover:bg-gradient-to-r group-hover:from-blue-600 group-hover:to-indigo-600 group-hover:bg-clip-text group-hover:text-transparent transition-all truncate">{patient.name}</p>
                  <p className="text-xs text-slate-400 truncate">{patient.id}</p>
                </div>
              </div>
              
              <div className="col-span-2 text-xs text-slate-600">
                {patient.age} <span className="text-slate-400">/</span> {patient.sex}
              </div>

              <div className="col-span-3">
                 <span className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                   patient.riskLevel === RiskLevel.HIGH ? 'bg-red-50 text-red-600 border border-red-100' :
                   patient.riskLevel === RiskLevel.MEDIUM ? 'bg-yellow-50 text-yellow-600 border border-yellow-100' :
                   'bg-green-50 text-green-600 border border-green-100'
                 }`}>
                   {patient.riskLevel}
                 </span>
                 <div className="text-xs text-slate-400 mt-0.5 truncate">{patient.status}</div>
              </div>

              <div className="col-span-3 text-right text-xs text-slate-600 font-medium">
                {patient.lastAngiographyDate}
              </div>
            </div>
          ))}
          
          {filteredPatients.length === 0 && (
            <div className="p-8 text-center text-slate-400">
              No patients found matching your search.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PatientList;