
import React, { useState } from 'react';
import { AppState, RoomData, User, FurnitureItem } from './types';
import Auth from './components/Auth';
import RoomInput from './components/RoomInput';
import CustomDesign from './components/CustomDesign';
import View3D from './components/View3D';
import { Home, LogOut, ChevronRight } from 'lucide-react';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [roomData, setRoomData] = useState<RoomData>({ photo: null, measurements: null });
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);

  const handleLogin = (u: User) => {
    setUser(u);
    setAppState(AppState.ROOM_INPUT);
  };

  const handleRoomSubmit = (data: RoomData) => {
    setRoomData(data);
    setAppState(AppState.CUSTOM_DESIGN);
  };

  const handleVisualize = (items: FurnitureItem[]) => {
    setFurniture(items);
    setAppState(AppState.VIEW_3D);
  };

  const logout = () => {
    setUser(null);
    setRoomData({ photo: null, measurements: null });
    setFurniture([]);
    setAppState(AppState.AUTH);
  };

  const steps = [
    { label: 'Specs', state: AppState.ROOM_INPUT },
    { label: 'Planner', state: AppState.CUSTOM_DESIGN },
    { label: '3D View', state: AppState.VIEW_3D }
  ];

  const getCurrentStepIndex = () => {
    if (appState === AppState.AUTH) return -1;
    if (appState === AppState.ROOM_INPUT) return 0;
    if (appState === AppState.CUSTOM_DESIGN) return 1;
    if (appState === AppState.VIEW_3D) return 2;
    return 0;
  };

  const currentIdx = getCurrentStepIndex();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {user && (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.ROOM_INPUT)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">DreamSpace Studio</span>
          </div>
          
          <div className="hidden lg:flex items-center gap-8">
            {steps.map((step, idx) => {
              const isActive = step.state === appState;
              const isCompleted = currentIdx > idx;
              return (
                <div key={idx} className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    isActive ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-200 ring-4 ring-indigo-50' : 
                    isCompleted ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                  }`}>
                    {idx + 1}
                  </div>
                  <span className={`text-xs font-black uppercase tracking-widest ${isActive ? 'text-indigo-600' : isCompleted ? 'text-slate-400' : 'text-slate-300'}`}>
                    {step.label}
                  </span>
                  {idx < steps.length - 1 && <ChevronRight className="w-4 h-4 text-slate-200" />}
                </div>
              );
            })}
          </div>

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-slate-400 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Logout</span>
          </button>
        </nav>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {appState === AppState.AUTH && <Auth onLogin={handleLogin} />}
        
        {appState === AppState.ROOM_INPUT && <RoomInput onSubmit={handleRoomSubmit} />}
        
        {appState === AppState.CUSTOM_DESIGN && roomData.measurements && (
          <CustomDesign 
            roomMeasurements={roomData.measurements} 
            photo={roomData.photo} 
            onBack={() => setAppState(AppState.ROOM_INPUT)}
            onVisualize={handleVisualize}
          />
        )}
        
        {appState === AppState.VIEW_3D && roomData.photo && roomData.measurements && (
          <div className="space-y-6">
            <button 
              onClick={() => setAppState(AppState.CUSTOM_DESIGN)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-colors"
            >
              <ChevronRight className="w-4 h-4 rotate-180" />
              Return to Planner
            </button>
            <View3D 
              imageData={roomData.photo} 
              furniture={furniture} 
              measurements={roomData.measurements} 
            />
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
