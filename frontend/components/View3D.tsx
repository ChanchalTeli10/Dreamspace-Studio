
import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { FurnitureItem, RoomMeasurements } from '../types.ts';
import { 
  Maximize2, Info, Compass, Activity
} from 'lucide-react';

interface View3DProps {
  imageData: string;
  furniture: FurnitureItem[];
  measurements: RoomMeasurements;
}

const View3D: React.FC<View3DProps> = ({ furniture, measurements }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setReady(true), 200);
    return () => clearTimeout(timer);
  }, []);
  
  useEffect(() => {
    if (!canvasRef.current || !ready) return;

    canvasRef.current.innerHTML = '';
    const width = canvasRef.current.clientWidth;
    const height = canvasRef.current.clientHeight;

    if (width === 0 || height === 0) return;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf1f5f9); 

    const camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.set(measurements.width, measurements.height * 1.5, measurements.length);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(window.devicePixelRatio);
    canvasRef.current.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.05;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    scene.add(ambientLight);

    const mainLight = new THREE.DirectionalLight(0xffffff, 1.2);
    mainLight.position.set(measurements.width, measurements.height * 4, measurements.length);
    mainLight.castShadow = true;
    mainLight.shadow.mapSize.width = 2048;
    mainLight.shadow.mapSize.height = 2048;
    scene.add(mainLight);

    // Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(measurements.width, measurements.length),
      new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    scene.add(floor);

    // Grid
    const gridHelper = new THREE.GridHelper(Math.max(measurements.width, measurements.length) * 2, 20, 0xdbeafe, 0xe2e8f0);
    scene.add(gridHelper);

    // Furniture Assembly
    furniture.forEach(item => {
      const h = item.height || 2.5;
      const typeLower = item.type.toLowerCase();
      const isLShaped = typeLower.includes('l-shape') || typeLower.includes('corner');
      
      let geometry: THREE.BufferGeometry;

      if (isLShaped) {
        const shape = new THREE.Shape();
        const w = item.width;
        const d = item.depth;
        const thickness = 0.35; 

        shape.moveTo(0, 0);
        shape.lineTo(w, 0);
        shape.lineTo(w, d * thickness);
        shape.lineTo(w * thickness, d * thickness);
        shape.lineTo(w * thickness, d);
        shape.lineTo(0, d);
        shape.lineTo(0, 0);

        geometry = new THREE.ExtrudeGeometry(shape, {
          depth: h,
          bevelEnabled: true,
          bevelThickness: 0.05,
          bevelSize: 0.05,
          bevelSegments: 3
        });
        geometry.rotateX(Math.PI / 2);
        geometry.center();
      } else {
        geometry = new THREE.BoxGeometry(item.width, h, item.depth);
      }

      const material = new THREE.MeshStandardMaterial({ 
        color: new THREE.Color(item.color || '#6366f1'),
        roughness: 0.6,
        metalness: 0.2
      });
      const mesh = new THREE.Mesh(geometry, material);
      
      mesh.position.x = (item.x + item.width / 2) - (measurements.width / 2);
      mesh.position.z = (item.y + item.depth / 2) - (measurements.length / 2);
      mesh.position.y = h / 2; 
      mesh.rotation.y = -THREE.MathUtils.degToRad(item.rotation || 0);
      
      mesh.castShadow = true;
      mesh.receiveShadow = true;
      scene.add(mesh);
    });

    let animationId: number;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!canvasRef.current) return;
      const w = canvasRef.current.clientWidth;
      const h = canvasRef.current.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
      renderer.dispose();
      controls.dispose();
      if (canvasRef.current) canvasRef.current.innerHTML = '';
    };
  }, [furniture, measurements, ready]);

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-center border-b border-slate-200 pb-6">
        <div>
          <h2 className="text-4xl font-black text-slate-900">3D View</h2>
          
        </div>
        <div className="flex gap-4 text-slate-300">
          <Activity className="w-5 h-5" />
          <Compass className="w-5 h-5" />
        </div>
      </div>

      <div className="aspect-video bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-100 relative">
        <div ref={canvasRef} className="w-full h-full cursor-move" />
        {!ready && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50">
            <div className="w-12 h-12 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
          </div>
        )}
        <div className="absolute bottom-6 right-6">
           <div className="bg-white/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-500 flex items-center gap-2 shadow-sm">
             <Maximize2 className="w-3.5 h-3.5 text-indigo-500" /> Area: {(measurements.width * measurements.length).toFixed(1)} sq ft
           </div>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl border border-slate-100 flex items-center gap-6">
        <Info className="w-8 h-8 text-indigo-400" />
        <p className="text-sm font-medium text-slate-600 leading-relaxed">
          
          Use <span className="font-bold text-slate-900">Left Click</span> to rotate, 
          <span className="font-bold text-slate-900"> Right Click</span> to pan, 
          and <span className="font-bold text-slate-900">Scroll</span> to zoom into the details of your suggested layout.
        </p>
      </div>
    </div>
  );
};

export default View3D;
