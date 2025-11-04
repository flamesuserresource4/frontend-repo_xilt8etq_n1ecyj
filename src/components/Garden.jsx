import React, { Suspense, useMemo } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Float, Icosahedron, MeshDistortMaterial, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

function Rock() {
  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.8}>
      <Icosahedron args={[1.8, 2]} castShadow receiveShadow>
        <MeshDistortMaterial color="#c4b5fd" roughness={0.9} metalness={0.05} distort={0.08} speed={1.2} />
      </Icosahedron>
    </Float>
  );
}

function GardenBed() {
  return (
    <group position={[0, 0.15, 0]}>
      {/* soil disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.1, 64]} />
        <meshStandardMaterial color="#f1e3ff" roughness={1} />
      </mesh>
      {/* subtle rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.05, 1.12, 64]} />
        <meshStandardMaterial color="#e9d5ff" roughness={1} />
      </mesh>
    </group>
  );
}

function FlowerPlane({ url, index, total }) {
  const [texture] = useLoader(THREE.TextureLoader, [url]);
  texture.colorSpace = THREE.SRGBColorSpace;

  // scatter around center in gentle spiral to avoid overlap
  const { x, z, scale } = useMemo(() => {
    const r = 0.15 + Math.min(0.9, Math.sqrt(index + 1) * 0.09);
    const angle = (index * 137.508) * (Math.PI / 180); // golden angle
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    const scale = 0.45 + (Math.random() * 0.25);
    return { x, z, scale };
  }, [index]);

  // maintain aspect ratio based on texture image
  const planeArgs = useMemo(() => {
    const w = texture?.image?.width || 512;
    const h = texture?.image?.height || 512;
    const aspect = w / h;
    const base = 0.5; // base size on shortest side
    return aspect >= 1 ? [base * aspect, base] : [base, base / aspect];
  }, [texture]);

  return (
    <group position={[x, 0.26, z]} rotation={[-Math.PI / 2, 0, 0]}> {/* lay flat on bed */}
      <mesh>
        {/* plane sized to image aspect so the flower looks exactly like the drawing */}
        <planeGeometry args={planeArgs} />
        <meshBasicMaterial map={texture} transparent />
      </mesh>
    </group>
  );
}

function Scene({ plants }) {
  return (
    <>
      <ambientLight intensity={0.8} />
      <directionalLight position={[3, 4, 2]} intensity={0.9} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Rock />
      <GardenBed />
      {plants.map((p, i) => (
        <FlowerPlane key={p.id} url={p.src} index={i} total={plants.length} />
      ))}
      <Environment preset="sunset" />
      <OrbitControls enablePan={false} minDistance={3} maxDistance={6} target={[0, 0.2, 0]} />
    </>
  );
}

export default function Garden({ plants }) {
  return (
    <div className="w-full rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50 to-rose-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-rose-500">3D Garden</p>
          <h3 className="text-lg font-semibold text-rose-900">Your floating rock of blooms</h3>
        </div>
      </div>
      <div className="relative h-80 md:h-96 w-full overflow-hidden rounded-xl bg-gradient-to-b from-white/80 to-white">
        <Canvas shadows camera={{ position: [0, 2.3, 4], fov: 45 }}>
          <Suspense fallback={<Html center>Loading garden…</Html>}>
            <Scene plants={plants} />
          </Suspense>
        </Canvas>
      </div>
      <p className="mt-3 text-xs text-rose-600">Each sketch becomes a delicate 3D-staged petal tile resting on your floating rock garden bed.</p>
    </div>
  );
}
