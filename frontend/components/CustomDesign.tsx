
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { RoomMeasurements, FurnitureItem } from '../types';
import { analyzeRoomLayout } from '../services/geminiService';
import { 
  Plus, Minus, Trash2, Layers, Grid, 
  Box, Sofa, Bed, Table, 
  X, Settings2, RotateCw, Wand2,
  Search, ChevronRight, Ruler, Zap, Loader2, Sparkles, ArrowUp
} from 'lucide-react';

interface CustomDesignProps {
  roomMeasurements: RoomMeasurements;
  photo: string | null;
  onBack: () => void;
  onVisualize: (items: FurnitureItem[]) => void;
}

const CATEGORIES = [
  { id: 'seating', label: 'Seating', icon: Sofa, color: 'bg-indigo-500', text: 'text-indigo-600', itemColor: '#6366f1' },
  { id: 'bedroom', label: 'Bed', icon: Bed, color: 'bg-emerald-500', text: 'text-emerald-600', itemColor: '#10b981' },
  { id: 'tables', label: 'Tables', icon: Table, color: 'bg-amber-500', text: 'text-amber-600', itemColor: '#f59e0b' },
  { id: 'storage', label: 'Storage', icon: Box, color: 'bg-rose-500', text: 'text-rose-600', itemColor: '#f43f5e' },
];

const PRESETS: Record<string, Array<{ type: string; width: number; depth: number; height: number }>> = {
  seating: [
    { type: 'Chair', width: 2.5, depth: 2.5, height: 3.0 },
    { type: 'Standard Sofa', width: 6.0, depth: 3.0, height: 2.8 },
    { type: 'L-Shaped Sofa', width: 8.0, depth: 6.0, height: 2.8 },
  ],
  bedroom: [
    { type: 'Single Bed', width: 3.2, depth: 6.3, height: 1.8 },
    { type: 'Double Bed', width: 4.5, depth: 6.3, height: 1.8 },
    { type: 'King Bed', width: 6.3, depth: 6.7, height: 1.8 },
  ],
  tables: [
    { type: 'Coffee Table', width: 3.0, depth: 1.8, height: 1.4 },
    { type: 'Study Table', width: 4.0, depth: 2.0, height: 2.5 },
    { type: 'Side Table', width: 1.5, depth: 1.5, height: 1.8 },
    { type: 'Dining Table', width: 5.0, depth: 3.0, height: 2.5 },
  ],
  storage: [
    { type: 'Wardrobe', width: 3.5, depth: 2.0, height: 6.5 },
    { type: 'Bookshelf', width: 2.6, depth: 1.0, height: 6.0 },
    { type: 'TV Stand', width: 5.0, depth: 1.5, height: 1.6 },
  ]
};

const CustomDesign: React.FC<CustomDesignProps> = ({ roomMeasurements, photo, onBack, onVisualize }) => {
  const [items, setItems] = useState<FurnitureItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [scale, setScale] = useState(35); 
  const [snapToGrid, setSnapToGrid] = useState(true);
  const [activeCategory, setActiveCategory] = useState('seating');
  const [searchQuery, setSearchQuery] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ id: string; startX: number; startY: number; itemX: number; itemY: number } | null>(null);

  const selectedItem = items.find(i => i.id === selectedId);

  useEffect(() => {
    if (containerRef.current) {
      const { clientWidth, clientHeight } = containerRef.current;
      const fitScale = Math.min(
        (clientWidth - 100) / roomMeasurements.width,
        (clientHeight - 100) / roomMeasurements.length
      );
      setScale(fitScale);
    }
  }, [roomMeasurements]);

  const handleMagicLayout = async () => {
    if (!photo) return;
    setIsGenerating(true);
    try {
      const suggested = await analyzeRoomLayout(photo, roomMeasurements);
      setItems(suggested);
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  };

  const deleteItem = (id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
    setSelectedId(null);
  };

  const updateItem = (id: string, updates: Partial<FurnitureItem>) => {
    setItems(prev => prev.map(i => i.id === id ? { ...i, ...updates } : i));
  };

  const addItem = (preset: { type: string; width: number; depth: number; height: number }) => {
    const category = CATEGORIES.find(c => c.id === activeCategory);
    const newItem: FurnitureItem = {
      id: Math.random().toString(36).substr(2, 9),
      type: preset.type,
      width: preset.width,
      depth: preset.depth,
      height: preset.height,
      x: roomMeasurements.width / 2 - preset.width / 2,
      y: roomMeasurements.length / 2 - preset.depth / 2,
      rotation: 0,
      color: category?.itemColor || '#6366f1',
      material: preset.type.toLowerCase().includes('sofa') ? 'Fabric' : 'Wood'
    };
    setItems([...items, newItem]);
    setSelectedId(newItem.id);
  };

  const handlePointerDown = (e: React.PointerEvent, item: FurnitureItem) => {
    e.stopPropagation();
    setSelectedId(item.id);
    dragRef.current = {
      id: item.id,
      startX: e.clientX,
      startY: e.clientY,
      itemX: item.x,
      itemY: item.y
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const { id, startX, startY, itemX, itemY } = dragRef.current;
    const dx = (e.clientX - startX) / scale;
    const dy = (e.clientY - startY) / scale;
    
    let nextX = itemX + dx;
    let nextY = itemY + dy;

    if (snapToGrid) {
      const gridSize = 0.1; 
      nextX = Math.round(nextX / gridSize) * gridSize;
      nextY = Math.round(nextY / gridSize) * gridSize;
    }

    setItems(prev => prev.map(it => it.id === id ? { ...it, x: nextX, y: nextY } : it));
  };

  const handlePointerUp = () => {
    dragRef.current = null;
  };

  return (
    <div className="flex flex-col lg:flex-row gap-0 h-[calc(100vh-80px)] overflow-hidden bg-white border border-slate-200 shadow-xl rounded-xl">
      <div className="w-full lg:w-[340px] bg-white border-r border-slate-200 flex flex-col z-20 shadow-sm overflow-hidden">
        {selectedItem ? (
          <div className="flex flex-col h-full animate-in slide-in-from-left duration-300">
            <div className="px-6 py-5 border-b border-slate-100 flex justify-between items-center bg-indigo-600">
              <div className="flex items-center gap-3">
                <Settings2 className="w-5 h-5 text-white" />
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-white leading-none">Inspector</h3>
              </div>
              <button onClick={() => setSelectedId(null)} className="text-white hover:bg-white/10 p-1.5 rounded-full transition-all">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="p-6 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-1">Label</label>
                <input 
                  type="text"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:bg-white focus:border-indigo-500 outline-none transition-all"
                  value={selectedItem.type}
                  onChange={(e) => updateItem(selectedId!, { type: e.target.value })}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Width (ft)</span>
                  <input 
                    type="number" step="0.1" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none" 
                    value={selectedItem.width} 
                    onChange={(e) => updateItem(selectedId!, { width: parseFloat(e.target.value) || 0.1 })} 
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[9px] font-black text-slate-400 uppercase ml-1">Depth (ft)</span>
                  <input 
                    type="number" step="0.1" 
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none" 
                    value={selectedItem.depth} 
                    onChange={(e) => updateItem(selectedId!, { depth: parseFloat(e.target.value) || 0.1 })} 
                  />
                </div>
              </div>

              {/* FIXED: Height option added here */}
              <div className="space-y-1.5">
                <span className="text-[9px] font-black text-slate-400 uppercase ml-1 flex items-center gap-2">
                  <ArrowUp className="w-3.5 h-3.5 text-indigo-500" /> Height (ft)
                </span>
                <input 
                  type="number" step="0.1" 
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold focus:border-indigo-500 outline-none" 
                  value={selectedItem.height} 
                  onChange={(e) => updateItem(selectedId!, { height: parseFloat(e.target.value) || 0.1 })} 
                />
              </div>

              <button 
                onClick={() => updateItem(selectedId!, { rotation: (selectedItem.rotation + 90) % 360 })} 
                className="w-full py-4 bg-slate-900 text-white text-[9px] font-black uppercase tracking-[0.2em] rounded-xl flex items-center justify-center gap-2 hover:bg-black transition-all shadow-lg"
              >
                <RotateCw className="w-4 h-4" /> Rotate 90°
              </button>
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50">
              <button 
                onClick={() => deleteItem(selectedId!)} 
                className="w-full py-4 text-rose-500 hover:bg-rose-50 text-[9px] font-black uppercase tracking-[0.3em] rounded-xl border border-rose-100 flex items-center justify-center gap-2 transition-all"
              >
                <Trash2 className="w-4 h-4" /> Remove Asset
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-full animate-in fade-in duration-300">
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-900">Catalog</h3>
                
              </div>
             
            </div>
            
            <div className="flex border-b border-slate-100 px-4 bg-white overflow-x-auto no-scrollbar">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat.id} 
                  onClick={() => setActiveCategory(cat.id)} 
                  className={`flex-1 min-w-[70px] py-4 text-[9px] font-black uppercase tracking-[0.2em] transition-all relative ${activeCategory === cat.id ? cat.text : 'text-slate-300 hover:text-slate-500'}`}
                >
                  <div className="flex flex-col items-center gap-2"><cat.icon className="w-4 h-4" />{cat.label}</div>
                  {activeCategory === cat.id && <div className={`absolute bottom-0 left-3 right-3 h-[3px] rounded-t-full ${cat.color}`} />}
                </button>
              ))}
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
              {PRESETS[activeCategory]?.filter(p => p.type.toLowerCase().includes(searchQuery.toLowerCase())).map((p, idx) => (
                <button 
                  key={idx} 
                  onClick={() => addItem(p)} 
                  className="w-full flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-500 hover:shadow-lg transition-all group"
                >
                  <div className="text-left">
                    <p className="font-black text-slate-900 text-[11px] uppercase tracking-tight">{p.type}</p>
                    <span className="text-[8px] text-slate-400 font-black uppercase tracking-widest">{p.width}ft × {p.depth}ft</span>
                  </div>
                  <Plus className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </button>
              ))}
            </div>
            
            <div className="p-6 border-t border-slate-100 bg-slate-50/50">
              <button 
                onClick={() => onVisualize(items)} 
                disabled={items.length === 0} 
                className="w-full py-4 bg-slate-900 hover:bg-black disabled:bg-slate-200 text-white text-[10px] font-black uppercase tracking-[0.3em] rounded-xl transition-all shadow-xl flex items-center justify-center gap-2"
              >
                Assemble 3D <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col min-w-0 bg-slate-50 overflow-hidden relative">
        <div className="px-8 py-5 bg-white border-b border-slate-100 flex justify-between items-center z-10 shadow-sm">
          <div className="flex flex-col">
            <div className="flex items-center gap-4">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
              <h3 className="text-xs font-black text-slate-900 uppercase tracking-[0.4em]">Precision Blueprint</h3>
            </div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Scale: 1ft = {scale}px</p>
          </div>
          <div className="flex items-center gap-4">
            
            <div className="h-6 w-px bg-slate-200" />
            <div className="flex items-center bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
              <button onClick={() => setScale(s => Math.min(100, s + 5))} className="p-2.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 transition-all border-r border-slate-100"><Plus className="w-4 h-4" /></button>
              <button onClick={() => setScale(s => Math.max(10, s - 5))} className="p-2.5 text-slate-400 hover:text-rose-500 hover:bg-slate-50 transition-all"><Minus className="w-4 h-4" /></button>
            </div>
          </div>
        </div>

        <div 
          ref={containerRef}
          className="flex-1 overflow-auto flex items-center justify-center p-20 canvas-container bg-slate-100/30 relative"
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onClick={() => setSelectedId(null)}
        >
          {isGenerating && (
            <div className="absolute inset-0 z-[100] bg-white/60 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-300">
               <div className="flex flex-col items-center gap-4 bg-white p-10 rounded-3xl shadow-2xl border border-slate-100">
                  <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
                  <p className="text-xs font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 animate-pulse" /> Gemini is Designing...
                  </p>
               </div>
            </div>
          )}
          <div 
            className="relative bg-white shadow-2xl ring-1 ring-slate-200 transition-all duration-300"
            style={{
              width: roomMeasurements.width * scale,
              height: roomMeasurements.length * scale,
              backgroundImage: 'linear-gradient(#f1f5f9 1px, transparent 1px), linear-gradient(90deg, #f1f5f9 1px, transparent 1px)',
              backgroundSize: `${scale}px ${scale}px` 
            }}
          >
            {items.map((item) => {
              const isLShaped = item.type.toLowerCase().includes('l-shape');
              return (
                <div
                  key={item.id}
                  onPointerDown={(e) => handlePointerDown(e, item)}
                  className={`absolute cursor-move transition-all ${selectedId === item.id ? 'z-50' : 'z-20'}`}
                  style={{
                    left: item.x * scale,
                    top: item.y * scale,
                    width: item.width * scale,
                    height: item.depth * scale,
                    transform: `rotate(${item.rotation}deg)`,
                    touchAction: 'none'
                  }}
                >
                  <div 
                    className={`w-full h-full border-2 transition-all relative flex flex-col items-center justify-center shadow-sm ${selectedId === item.id ? 'border-indigo-600 bg-white ring-8 ring-indigo-600/5 shadow-2xl' : 'border-slate-800 bg-white/95 hover:border-indigo-400'}`}
                    style={{ 
                      borderColor: item.color,
                      clipPath: isLShaped ? 'polygon(0% 0%, 100% 0%, 100% 35%, 35% 35%, 35% 100%, 0% 100%)' : 'none',
                      backgroundColor: `${item.color}15`
                    }}
                  >
                    <div className="flex flex-col items-center px-1 overflow-hidden pointer-events-none text-center">
                      <span className={`text-[8px] font-black uppercase text-slate-900 truncate leading-none mb-0.5 ${isLShaped ? '-translate-x-3 -translate-y-3' : ''}`}>{item.type}</span>
                      <span className={`text-[7px] font-mono text-slate-400 font-bold ${isLShaped ? '-translate-x-3 -translate-y-3' : ''}`}>{item.width.toFixed(1)}x{item.depth.toFixed(1)}ft</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
        
        <div className="px-8 py-4 bg-white border-t border-slate-100 flex justify-between items-center text-slate-400 shadow-[0_-1px_3px_rgba(0,0,0,0.02)]">
           <div className="flex items-center gap-6">
             <div className="flex items-center gap-3"><Ruler className="w-4 h-4 text-indigo-300" /><span className="text-[10px] font-black uppercase tracking-widest">{roomMeasurements.width}ft x {roomMeasurements.length}ft Workspace</span></div>
             <div className="h-4 w-px bg-slate-100" />
             <div className="flex items-center gap-2"><ArrowUp className="w-3.5 h-3.5 text-slate-300" /><span className="text-[10px] font-black uppercase tracking-widest">Height: {roomMeasurements.height}ft</span></div>
           </div>
           <button onClick={onBack} className="text-[9px] font-black uppercase tracking-widest hover:text-indigo-600 transition-colors bg-slate-50 px-4 py-2 rounded-lg border border-slate-200">Adjust Room Details</button>
        </div>
      </div>
    </div>
  );
};

export default CustomDesign;
