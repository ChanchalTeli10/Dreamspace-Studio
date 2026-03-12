
import React, { useState, useRef, useEffect } from 'react';
import { RoomData, RoomMeasurements } from '../types.ts';
import { Ruler, Camera, ChevronRight, X } from 'lucide-react';

interface RoomInputProps {
  onSubmit: (data: RoomData) => void;
  initialData?: RoomData;
}

const RoomInput: React.FC<RoomInputProps> = ({ onSubmit, initialData }) => {
  const [photo, setPhoto] = useState<string | null>(initialData?.photo || null);
  const [measurements, setMeasurements] = useState<RoomMeasurements>(
    initialData?.measurements || { length: 0, width: 0, height: 0 }
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync state if initialData changes (e.g., after loading from DB)
  useEffect(() => {
    if (initialData?.photo) setPhoto(initialData.photo);
    if (initialData?.measurements) setMeasurements(initialData.measurements);
  }, [initialData]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPhoto(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (photo && measurements.length > 0 && measurements.width > 0 && measurements.height > 0) {
      onSubmit({ photo, measurements });
    } else {
      alert("Please upload a photo and provide all measurements.");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="text-center">
        <h2 className="text-3xl font-black text-slate-900 tracking-tight">Room Measurements</h2>
        <p className="text-slate-500 mt-2 font-medium">Specify your room dimensions and upload a room photo</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Photo Upload */}
        <div className="space-y-4">
          <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Room Photo</label>
          {photo ? (
            <div className="relative rounded-3xl overflow-hidden border-2 border-indigo-100 shadow-xl group">
              <img src={photo} alt="Room" className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105" />
              <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity" />
              <button 
                onClick={() => setPhoto(null)}
                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur-md text-rose-500 rounded-full hover:bg-rose-500 hover:text-white transition-all shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div 
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/50 transition-all group bg-white"
            >
              <div className="p-5 bg-slate-50 rounded-2xl group-hover:bg-indigo-100 transition-colors">
                <Camera className="w-10 h-10 text-slate-400 group-hover:text-indigo-600" />
              </div>
              <div className="text-center">
                <p className="text-sm font-black text-slate-900 tracking-tight">Select Space Photo</p>
                <p className="text-[10px] text-slate-400 mt-1 font-bold uppercase tracking-widest">PNG or JPG up to 50MB</p>
              </div>
            </div>
          )}
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            className="hidden" 
            accept="image/*" 
          />
        </div>

        {/* Measurements Form */}
        <div className="space-y-6 flex flex-col justify-center">
          <div className="flex items-center gap-3 mb-2 p-3 bg-indigo-50 rounded-2xl w-fit">
            <Ruler className="w-5 h-5 text-indigo-600" />
            <h3 className="text-[10px] font-black text-indigo-900 uppercase tracking-[0.2em]">Imperial Grid (ft)</h3>
          </div>
          
          <div className="space-y-5">
            {[
              { label: 'Length', key: 'length' as keyof RoomMeasurements},
              { label: 'Width', key: 'width' as keyof RoomMeasurements},
              { label: 'Height', key: 'height' as keyof RoomMeasurements}
            ].map((field) => (
              <div key={field.key} className="space-y-1.5">
                <label className="block text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">{field.label} (ft)</label>
                <input
                  type="number"
                  step="0.5"
                  className="w-full px-5 py-4 bg-white border border-slate-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 focus:outline-none transition-all font-bold text-slate-900 shadow-sm"
                  value={measurements[field.key] || ''}
                  onChange={(e) => setMeasurements({ ...measurements, [field.key]: parseFloat(e.target.value) || 0 })}
                  required
                />
              </div>
            ))}
          </div>

          <div className="pt-6">
            <button
              onClick={handleFormSubmit}
              disabled={!photo || !measurements.length || !measurements.width || !measurements.height}
              className="w-full py-5 bg-slate-900 hover:bg-black disabled:bg-slate-200 disabled:cursor-not-allowed text-white text-[11px] font-black uppercase tracking-[0.3em] rounded-2xl shadow-2xl transition-all flex items-center justify-center gap-3 group"
            >
              Continue to Design
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomInput;
