import React, { Suspense, useMemo, useRef } from 'react';
import { Canvas, useFrame, useLoader } from '@react-three/fiber';
import { OrbitControls, Float, Icosahedron, MeshDistortMaterial, Environment, Html } from '@react-three/drei';
import * as THREE from 'three';

function Rock() {
  return (
    <Float speed={1} rotationIntensity={0.4} floatIntensity={0.8}>
      <Icosahedron args={[1.8, 2]} castShadow receiveShadow>
        <MeshDistortMaterial color="#b9fbc0" roughness={0.95} metalness={0.02} distort={0.08} speed={1.2} />
      </Icosahedron>
    </Float>
  );
}

function GardenBed() {
  return (
    <group position={[0, 0.18, 0]}>
      {/* soil disc */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[1.15, 64]} />
        <meshStandardMaterial color="#6b4f37" roughness={1} />
      </mesh>
      {/* soft rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[1.10, 1.20, 64]} />
        <meshStandardMaterial color="#7a5a40" roughness={1} />
      </mesh>
    </group>
  );
}

function Grass() {
  // Instanced little blades around a ring for a grassy feel
  const instRef = useRef();
  const count = 260;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const color = new THREE.Color('#84cc16');

  useMemo(() => {
    if (!instRef.current) return;
    for (let i = 0; i < count; i++) {
      const r = 0.35 + Math.random() * 0.7; // ring radius
      const angle = Math.random() * Math.PI * 2;
      const x = Math.cos(angle) * r;
      const z = Math.sin(angle) * r;
      const y = 0.2;
      const scale = 0.5 + Math.random() * 0.9;
      const lean = (Math.random() - 0.5) * 0.3;
      dummy.position.set(x, y, z);
      dummy.rotation.set(-Math.PI / 2 + 0.15 + lean, angle, 0);
      dummy.scale.set(0.05, 0.05, scale);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
      instRef.current.setColorAt(i, color.offsetHSL(0, 0, (Math.random() - 0.5) * 0.1));
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [count, dummy, color]);

  return (
    <instancedMesh ref={instRef} args={[null, null, count]} castShadow receiveShadow>
      <coneGeometry args={[1, 3, 5]} />
      <meshStandardMaterial color="#84cc16" roughness={0.9} />
    </instancedMesh>
  );
}

function FlowerPlane({ url, index }) {
  const [texture] = useLoader(THREE.TextureLoader, [url]);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.needsUpdate = true;

  // place in a golden-angle spiral, raised slightly from soil
  const { x, z, y, tilt, spin } = useMemo(() => {
    const r = 0.18 + Math.min(0.95, Math.sqrt(index + 1) * 0.1);
    const angle = (index * 137.508) * (Math.PI / 180);
    const x = Math.cos(angle) * r;
    const z = Math.sin(angle) * r;
    return { x, z, y: 0.32, tilt: 0.2 + Math.random() * 0.25, spin: angle + Math.random() * 0.5 };
  }, [index]);

  // size from image aspect
  const planeArgs = useMemo(() => {
    const w = texture?.image?.width || 512;
    const h = texture?.image?.height || 512;
    const aspect = w / h;
    const base = 0.8; // a bit larger so it reads clearly
    return aspect >= 1 ? [base * aspect, base] : [base, base / aspect];
  }, [texture]);

  const meshRef = useRef();
  useFrame((state) => {
    if (!meshRef.current) return;
    const t = state.clock.getElapsedTime();
    // gentle sway
    meshRef.current.rotation.x = (Math.sin(t * 0.6) * 0.04) - tilt;
    meshRef.current.rotation.y = spin + Math.sin(t * 0.4 + index) * 0.05;
  });

  return (
    <group position={[x, y, z]}>
      <mesh ref={meshRef} castShadow>
        <planeGeometry args={planeArgs} />
        <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function Scene({ plants }) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 3]} intensity={1} castShadow shadow-mapSize-width={1024} shadow-mapSize-height={1024} />
      <Rock />
      <GardenBed />
      <Grass />
      {plants.map((p, i) => (
        <FlowerPlane key={p.id} url={p.src} index={i} />
      ))}
      <Environment preset="sunset" />
      <OrbitControls enablePan={false} minDistance={2.8} maxDistance={6} target={[0, 0.35, 0]} />
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
        <Canvas shadows camera={{ position: [0, 2.6, 4.2], fov: 45 }}>
          <Suspense fallback={<Html center>Loading garden…</Html>}> 
            <Scene plants={plants} />
          </Suspense>
        </Canvas>
      </div>
      <p className="mt-3 text-xs text-rose-600">Sketches now stand upright, gently swaying above a grassy bed so your blooms are easy to see.</p>
    </div>
  );
}
