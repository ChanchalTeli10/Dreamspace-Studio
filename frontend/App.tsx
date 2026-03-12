
import React, { useState, useEffect } from 'react';
import { AppState, RoomData, User, FurnitureItem } from './types.ts';
import Auth from './components/Auth.tsx';
import RoomInput from './components/RoomInput.tsx';
import CustomDesign from './components/CustomDesign.tsx';
import View3D from './components/View3D.tsx';
import { Home, LogOut, ChevronRight, Loader2, CheckCircle } from 'lucide-react';

const API_URL = 'http://localhost:5000/api/designs';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [roomData, setRoomData] = useState<RoomData>({ photo: null, measurements: null });
  const [furniture, setFurniture] = useState<FurnitureItem[]>([]);
  const [appState, setAppState] = useState<AppState>(AppState.AUTH);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(false);

  useEffect(() => {
    if (user && user.id) {
      loadDesign();
    }
  }, [user]);

  const loadDesign = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;
    
    setIsInitialLoading(true);
    try {
      const response = await fetch(`${API_URL}/load`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setRoomData(data.roomData);
        setFurniture(data.furniture || []);
        if (data.roomData?.measurements && data.roomData?.photo) {
          setAppState(AppState.CUSTOM_DESIGN);
        }
      }
    } catch (err) {
      console.error("Load failed:", err);
    } finally {
      setIsInitialLoading(false);
    }
  };

  const saveDesign = async (currentRoom: RoomData, currentFurniture: FurnitureItem[]) => {
    const token = localStorage.getItem('token');
    if (!token || !user?.id) {
      console.warn("Cloud save disabled: Not logged in.");
      return;
    }

    setIsSyncing(true);
    try {
      const response = await fetch(`${API_URL}/save`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ roomData: currentRoom, furniture: currentFurniture })
      });
      
      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Save failed");
      }
    } catch (err: any) {
      console.error("Sync error:", err);
    } finally {
      // Show 'Saved' badge for UX
      setTimeout(() => setIsSyncing(false), 1500);
    }
  };

  const handleLogin = (u: User) => {
    setUser(u);
    setAppState(AppState.ROOM_INPUT);
  };

  const handleRoomSubmit = (data: RoomData) => {
    setRoomData(data);
    setAppState(AppState.CUSTOM_DESIGN);
    // Ensure save happens when moving from input to design
    saveDesign(data, furniture);
  };

  const handleVisualize = (items: FurnitureItem[]) => {
    setFurniture(items);
    setAppState(AppState.VIEW_3D);
    saveDesign(roomData, items);
  };

  const logout = () => {
    setUser(null);
    setRoomData({ photo: null, measurements: null });
    setFurniture([]);
    localStorage.removeItem('token');
    setAppState(AppState.AUTH);
  };

  if (isInitialLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <p className="mt-4 text-[11px] font-black uppercase tracking-[0.3em] text-slate-400">Restoring Workspace...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {user && (
        <nav className="bg-white border-b border-slate-200 px-6 py-4 flex justify-between items-center sticky top-0 z-50 shadow-sm">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setAppState(AppState.ROOM_INPUT)}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Home className="text-white w-5 h-5" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">DreamSpace Studio</span>
          </div>

          <div className="flex items-center gap-6">
            {isSyncing && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 text-emerald-600 rounded-full animate-in fade-in duration-300">
                <CheckCircle className="w-4 h-4 animate-pulse" />
                <span className="text-[10px] font-black uppercase tracking-widest">Saved to Cloud</span>
              </div>
            )}
            
            <button 
              onClick={logout}
              className="flex items-center gap-2 text-slate-400 hover:text-rose-500 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="text-xs font-black uppercase tracking-widest hidden sm:inline">Logout</span>
            </button>
          </div>
        </nav>
      )}

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8">
        {appState === AppState.AUTH && <Auth onLogin={handleLogin} />}
        
        {appState === AppState.ROOM_INPUT && (
          <RoomInput 
            onSubmit={handleRoomSubmit} 
            initialData={roomData} 
          />
        )}
        
        {appState === AppState.CUSTOM_DESIGN && roomData.measurements && (
          <CustomDesign 
            roomMeasurements={roomData.measurements} 
            photo={roomData.photo} 
            initialItems={furniture}
            onBack={() => setAppState(AppState.ROOM_INPUT)}
            onVisualize={handleVisualize}
            onSave={(items) => {
                setFurniture(items);
                saveDesign(roomData, items);
            }}
          />
        )}

        {appState === AppState.VIEW_3D && roomData.photo && roomData.measurements && (
          <div className="space-y-6 animate-in fade-in duration-700">
            <button 
              onClick={() => setAppState(AppState.CUSTOM_DESIGN)}
              className="flex items-center gap-2 text-slate-400 hover:text-indigo-600 font-black text-xs uppercase tracking-widest transition-all"
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
