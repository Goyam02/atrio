import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';
import { 
  LayoutDashboard, Users, Plus, Settings, LogOut, 
  Menu, X
} from 'lucide-react';

import MainLandingPage from './components/MainLandingPage';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import PatientList from './components/PatientList';
import AngiographyView from './components/AngiographyView';
import NewPatientPage from './components/NewPatientPage';

import { Doctor, Patient, generateMockPatients } from './types';

// Protected Route Wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode; user: Doctor | null }> = ({ children, user }) => {
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  return <>{children}</>;
};

// Main Layout Component
const MainLayout: React.FC<{
  user: Doctor;
  patients: Patient[];
  currentView: 'dashboard' | 'patients';
  setCurrentView: (view: 'dashboard' | 'patients') => void;
  onPatientClick: (patient: Patient) => void;
  onLogout: () => void;
  onNewPatient: () => void;
}> = ({ user, patients, currentView, setCurrentView, onPatientClick, onLogout, onNewPatient }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    onLogout();
    navigate('/auth');
  };

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 overflow-hidden font-sans text-slate-900">
      
      {/* LEFT SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-gradient-to-b from-blue-600 to-indigo-700 border-r border-blue-500/30 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:relative md:translate-x-0 flex flex-col shadow-2xl md:shadow-xl
      `}>
        {/* Logo Area */}
        <div className="h-16 flex items-center px-6 border-b border-white/20">
          <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center mr-3 shadow-sm">
             <span className="text-white font-bold text-lg">A</span>
          </div>
          <span className="text-white font-bold text-lg tracking-tight">Atrio</span>
          <button 
            className="ml-auto md:hidden text-slate-400"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1">
          <button 
            onClick={() => {
              setCurrentView('dashboard');
              navigate('/dashboard');
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${
              currentView === 'dashboard' ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            <span>Overview</span>
          </button>
          
          <button 
            onClick={() => {
              setCurrentView('patients');
              navigate('/patients');
            }}
            className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors font-medium ${
              currentView === 'patients' ? 'bg-white/20 backdrop-blur-sm text-white shadow-lg' : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <Users className="w-5 h-5" />
            <span>Patients</span>
          </button>
        </nav>

        {/* User Profile */}
        <div className="p-4 border-t border-white/20">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white font-bold">
              {user.name.charAt(4)} 
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-blue-100 truncate">Cardiology Dept.</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 text-xs font-medium text-blue-100 hover:text-white py-2 hover:bg-white/10 rounded-lg transition-colors ml-[-0.5rem]"
          >
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative">
        
        {/* TOP NAVBAR */}
        <header className="h-16 bg-white/80 backdrop-blur-sm border-b border-blue-200/50 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm">
          <div className="flex items-center gap-4">
            <button 
              className="md:hidden p-2 text-slate-600 hover:bg-blue-50 rounded-lg"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </button>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent hidden sm:block">
              {currentView === 'dashboard' ? 'Clinical Overview' : 'Patient Management'}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => {
                onNewPatient();
                navigate('/new-patient');
              }}
              className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-lg shadow-blue-500/30 active:scale-95 transform"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Patient</span>
            </button>
            <button className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
              <Settings className="w-5 h-5" />
            </button>
          </div>
        </header>

        {/* SCROLLABLE CONTENT */}
        <div className="flex-1 overflow-hidden p-4 md:p-6">
          {currentView === 'dashboard' ? (
            <div className="h-full overflow-y-auto">
              <Dashboard 
                patients={patients} 
                onPatientClick={onPatientClick} 
              />
            </div>
          ) : (
            <PatientList 
              patients={patients} 
              onPatientClick={onPatientClick} 
            />
          )}
        </div>
      </main>
    </div>
  );
};

// Main App Container
const App: React.FC = () => {
  const [user, setUser] = useState<Doctor | null>(null);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [currentView, setCurrentView] = useState<'dashboard' | 'patients'>('dashboard');
  const navigate = useNavigate();

  // Initialize Data
  useEffect(() => {
    setPatients(generateMockPatients(15));
  }, []);

  // Handlers
  const handleLogin = (doctor: Doctor) => {
    setUser(doctor);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('dashboard');
  };

  const handlePatientClick = (patient: Patient) => {
    navigate(`/patient/${patient.id}`);
  };

  const handlePatientUpdate = (updatedPatient: Patient) => {
    setPatients(prev => prev.map(p => p.id === updatedPatient.id ? updatedPatient : p));
  };

  const handleNewPatientSave = (newPatient: Patient) => {
    setPatients(prev => [newPatient, ...prev]);
    navigate('/patients');
  };

  const handleNewPatient = () => {
    setCurrentView('patients');
  };

  return (
    <Routes>
      {/* Landing Page */}
      <Route path="/" element={<MainLandingPage />} />
      
      {/* Auth Page */}
      <Route 
        path="/auth" 
        element={
          user ? <Navigate to="/dashboard" replace /> : <Auth onLogin={handleLogin} />
        } 
      />
      
      {/* Dashboard */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute user={user}>
            <MainLayout
              user={user!}
              patients={patients}
              currentView="dashboard"
              setCurrentView={setCurrentView}
              onPatientClick={handlePatientClick}
              onLogout={handleLogout}
              onNewPatient={handleNewPatient}
            />
          </ProtectedRoute>
        }
      />
      
      {/* Patients List */}
      <Route
        path="/patients"
        element={
          <ProtectedRoute user={user}>
            <MainLayout
              user={user!}
              patients={patients}
              currentView="patients"
              setCurrentView={setCurrentView}
              onPatientClick={handlePatientClick}
              onLogout={handleLogout}
              onNewPatient={handleNewPatient}
            />
          </ProtectedRoute>
        }
      />
      
      {/* New Patient */}
      <Route
        path="/new-patient"
        element={
          <ProtectedRoute user={user}>
            <div className="h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100">
              <NewPatientPage 
                onBack={() => navigate('/patients')}
                onSave={handleNewPatientSave}
              />
            </div>
          </ProtectedRoute>
        }
      />
      
      {/* Patient Detail View */}
      <Route
        path="/patient/:id"
        element={
          <ProtectedRoute user={user}>
            <PatientDetailView
              patients={patients}
              onBack={() => navigate('/patients')}
              onUpdatePatient={handlePatientUpdate}
            />
          </ProtectedRoute>
        }
      />
      
      {/* Default redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

// Patient Detail View Component
const PatientDetailView: React.FC<{
  patients: Patient[];
  onBack: () => void;
  onUpdatePatient: (patient: Patient) => void;
}> = ({ patients, onBack, onUpdatePatient }) => {
  const { id } = useParams<{ id: string }>();
  const patient = patients.find(p => p.id === id);

  if (!patient) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Patient Not Found</h2>
          <button
            onClick={onBack}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-2 rounded-lg"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 p-4">
      <AngiographyView 
        patient={patient} 
        onBack={onBack} 
        onUpdatePatient={onUpdatePatient}
      />
    </div>
  );
};

export default App;
