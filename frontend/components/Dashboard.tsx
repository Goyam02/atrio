import React from 'react';
import { 
  AlertTriangle, FileText, Bell, CheckCircle2, 
  Activity, BarChart3, ChevronRight, PieChart as PieChartIcon
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, AreaChart, Area, CartesianGrid 
} from 'recharts';
import { Patient, RiskLevel, StudyStatus } from '../types';

interface DashboardProps {
  patients: Patient[];
  onPatientClick: (patient: Patient) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ patients, onPatientClick }) => {
  // Derived Data
  const highRiskCount = patients.filter(p => p.riskLevel === RiskLevel.HIGH).length;
  const draftCount = patients.filter(p => p.status === StudyStatus.NEEDS_REVIEW).length;
  const completedToday = 4;
  const followUps = 2;

  // Chart Data
  const volumeData = [
    { name: 'Mon', studies: 12 },
    { name: 'Tue', studies: 15 },
    { name: 'Wed', studies: 8 },
    { name: 'Thu', studies: 14 },
    { name: 'Fri', studies: 18 },
    { name: 'Sat', studies: 5 },
    { name: 'Sun', studies: 3 },
  ];

  const riskData = [
    { name: 'Low', value: patients.filter(p => p.riskLevel === RiskLevel.LOW).length },
    { name: 'Medium', value: patients.filter(p => p.riskLevel === RiskLevel.MEDIUM).length },
    { name: 'Critical', value: patients.filter(p => p.riskLevel === RiskLevel.HIGH).length },
  ];

  const RISK_COLORS = ['#10b981', '#f59e0b', '#ef4444'];

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* A. ATTENTION PANEL */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-red-500 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-red-500 uppercase tracking-wider mb-1">Attention Required</p>
              <h3 className="text-3xl font-bold text-slate-800">{highRiskCount}</h3>
              <p className="text-sm text-slate-500 mt-1">High-Risk Pending</p>
            </div>
            <div className="bg-red-50 p-3 rounded-xl group-hover:bg-red-100 transition-colors">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-500 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-wider mb-1">In Progress</p>
              <h3 className="text-3xl font-bold text-slate-800">{draftCount}</h3>
              <p className="text-sm text-slate-500 mt-1">Drafts Unsigned</p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-xl group-hover:bg-yellow-100 transition-colors">
              <FileText className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm p-5 rounded-xl shadow-sm border border-blue-200/50 border-l-4 border-l-blue-500 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-1">Alerts</p>
              <h3 className="text-3xl font-bold text-slate-800">{followUps}</h3>
              <p className="text-sm text-slate-500 mt-1">Follow-up Due</p>
            </div>
            <div className="bg-gradient-to-br from-blue-100 to-indigo-100 p-3 rounded-xl group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500 hover:shadow-md transition-shadow cursor-pointer group">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-wider mb-1">Performance</p>
              <h3 className="text-3xl font-bold text-slate-800">{completedToday}</h3>
              <p className="text-sm text-slate-500 mt-1">Completed Today</p>
            </div>
            <div className="bg-green-50 p-3 rounded-xl group-hover:bg-green-100 transition-colors">
              <CheckCircle2 className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* B. CHARTS PANEL */}
        <div className="lg:col-span-2 space-y-6">
            
            {/* Volume Trend */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200/50 p-6">
                <div className="flex justify-between items-center mb-6">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-blue-500" />
                        Weekly Study Volume
                    </h3>
                    <div className="flex gap-2">
                        <span className="text-xs font-medium px-2 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 rounded">Studies</span>
                    </div>
                </div>
                <div className="h-64 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={volumeData}>
                            <defs>
                                <linearGradient id="colorStudies" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e0e7ff" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6366f1'}} dy={10} />
                            <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#6366f1'}} />
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #c7d2fe', boxShadow: '0 4px 6px -1px rgb(99 102 241 / 0.2)'}}
                                itemStyle={{color: '#1e293b'}}
                            />
                            <Area type="monotone" dataKey="studies" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorStudies)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Recent Patients Table */}
            <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200/50 overflow-hidden">
                <div className="p-5 border-b border-slate-100 flex justify-between items-center">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-500" />
                    Recent Priority Patients
                    </h3>
                    <button className="text-sm bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hover:from-blue-700 hover:to-indigo-700 font-medium">View All</button>
                </div>
                <div className="divide-y divide-slate-50">
                    {patients.slice(0, 4).map((patient) => (
                    <div 
                        key={patient.id} 
                        onClick={() => onPatientClick(patient)}
                        className="p-4 hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between group"
                    >
                        <div className="flex items-center gap-4">
                        <div className={`w-1.5 h-10 rounded-full ${
                            patient.riskLevel === RiskLevel.HIGH ? 'bg-red-500' : 
                            patient.riskLevel === RiskLevel.MEDIUM ? 'bg-yellow-500' : 'bg-green-500'
                        }`}></div>
                        <div>
                            <h4 className="font-medium text-slate-800 group-hover:text-blue-600 transition-colors">{patient.name}</h4>
                            <p className="text-xs text-slate-500">ID: {patient.id} • {patient.sex} • {patient.age}y</p>
                        </div>
                        </div>
                        
                        <div className="flex items-center gap-6">
                        <div className="text-right hidden sm:block">
                            <p className="text-xs text-slate-400">Last Angio</p>
                            <p className="text-sm text-slate-600 font-medium">{patient.lastAngiographyDate}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
                            patient.riskLevel === RiskLevel.HIGH ? 'bg-red-50 text-red-700 border-red-100' : 
                            patient.riskLevel === RiskLevel.MEDIUM ? 'bg-yellow-50 text-yellow-700 border-yellow-100' : 
                            'bg-green-50 text-green-700 border-green-100'
                        }`}>
                            {patient.riskLevel}
                        </span>
                        <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500" />
                        </div>
                    </div>
                    ))}
                </div>
            </div>
        </div>

        {/* C. SIDE ANALYTICS */}
        <div className="space-y-6">
             {/* Risk Distribution */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200/50 p-6 flex flex-col h-[400px]">
                <div className="mb-4">
                    <h3 className="font-semibold text-slate-800 flex items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-indigo-500" />
                        Risk Distribution
                    </h3>
                </div>
                <div className="flex-1 min-h-0 relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={riskData}
                                cx="50%"
                                cy="50%"
                                innerRadius={50}
                                outerRadius={70}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {riskData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={RISK_COLORS[index % RISK_COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip 
                                contentStyle={{backgroundColor: '#fff', borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                    {/* Centered Text Logic if needed, omitted for simplicity to focus on Legend */}
                </div>
                <div className="grid grid-cols-1 gap-3 mt-4">
                    {riskData.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between border-b border-slate-50 pb-2 last:border-0">
                             <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{backgroundColor: RISK_COLORS[index]}}></div>
                                <p className="text-sm text-slate-600">{item.name} Risk</p>
                             </div>
                             <p className="text-sm font-bold text-slate-800">{item.value}</p>
                        </div>
                    ))}
                </div>
             </div>
             
             {/* AI Confidence Metric */}
             <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-blue-200/50 p-6">
                <h3 className="font-semibold text-slate-800 mb-4">AI Performance</h3>
                <div className="flex items-end justify-between mb-2">
                     <span className="text-slate-500 text-sm">Avg Confidence</span>
                     <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">92.4%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2 mb-6">
                    <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full" style={{ width: '92.4%' }}></div>
                </div>

                <div className="flex items-end justify-between mb-2">
                     <span className="text-slate-500 text-sm">Acceptance Rate</span>
                     <span className="text-2xl font-bold text-green-600">98%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: '98%' }}></div>
                </div>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;