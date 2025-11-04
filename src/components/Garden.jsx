import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, OrbitControls } from '@react-three/drei';

// Utility: random point on unit sphere
function randomUnitVector() {
  const u = Math.random();
  const v = Math.random();
  const theta = 2 * Math.PI * u;
  const phi = Math.acos(2 * v - 1);
  const x = Math.sin(phi) * Math.cos(theta);
  const y = Math.sin(phi) * Math.sin(theta);
  const z = Math.cos(phi);
  return new THREE.Vector3(x, y, z).normalize();
}

function FloatingRock({ radius = 1.2, distortion = 0.15 }) {
  const ref = useRef();
  const geom = useMemo(() => new THREE.IcosahedronGeometry(radius, 4), [radius]);
  // Distort vertices slightly to look like a rock
  useMemo(() => {
    const pos = geom.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i);
      const n = v.clone().normalize();
      const noise = (Math.sin(v.x * 2.1) + Math.sin(v.y * 1.7) + Math.sin(v.z * 2.5)) / 3;
      v.addScaledVector(n, noise * distortion);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;
    geom.computeVertexNormals();
  }, [geom, distortion]);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (ref.current) {
      ref.current.position.y = Math.sin(t * 0.6) * 0.05;
      ref.current.rotation.y = t * 0.03;
    }
  });

  return (
    <group ref={ref}>
      <mesh geometry={geom} receiveShadow castShadow>
        <meshStandardMaterial color="#4b5563" roughness={0.95} metalness={0.05} />
      </mesh>
    </group>
  );
}

function GrassLayer({ count = 1600, rockRadius = 1.2, surfaceOffset = 0.01, color = '#84cc16' }) {
  const instRef = useRef();
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const geom = useMemo(() => new THREE.ConeGeometry(0.01, 0.08, 6), []); // thin, short blade
  const mat = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), [color]);

  useEffect(() => {
    for (let i = 0; i < count; i++) {
      const dir = randomUnitVector();
      const pos = dir.clone().multiplyScalar(rockRadius + surfaceOffset + (Math.random() * 0.005));
      // Orient cone to point along normal (outwards)
      dummy.position.copy(pos);
      const up = new THREE.Vector3(0, 1, 0);
      const quat = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
      dummy.quaternion.copy(quat);
      const s = 0.7 + Math.random() * 0.6;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      instRef.current.setMatrixAt(i, dummy.matrix);
    }
    instRef.current.instanceMatrix.needsUpdate = true;
  }, [count, rockRadius, surfaceOffset, dummy]);

  return (
    <instancedMesh ref={instRef} args={[geom, mat, count]} castShadow receiveShadow />
  );
}

function Flower({ src, position, normal, size = 0.35 }) {
  const meshRef = useRef();
  const [texture, setTexture] = useState(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const tex = new THREE.Texture(img);
      tex.needsUpdate = true;
      tex.colorSpace = THREE.SRGBColorSpace;
      setTexture(tex);
    };
    img.src = src;
  }, [src]);

  useFrame(({ clock }) => {
    if (!meshRef.current) return;
    const t = clock.getElapsedTime();
    meshRef.current.position.set(position.x, position.y, position.z);
    // gentle sway based on normal
    const sway = Math.sin(t * 1.5 + position.x * 3.1) * 0.06;
    const axis = new THREE.Vector3().crossVectors(normal, new THREE.Vector3(0, 1, 0));
    if (axis.lengthSq() > 0.0001) {
      meshRef.current.setRotationFromAxisAngle(axis.normalize(), sway);
    }
  });

  // orient the plane so that its normal faces outwards from the rock
  const quat = useMemo(() => {
    const up = new THREE.Vector3(0, 0, 1); // plane faces +Z by default
    const q = new THREE.Quaternion().setFromUnitVectors(up, normal.clone().normalize());
    return q;
  }, [normal]);

  return (
    <mesh ref={meshRef} quaternion={quat} position={[position.x, position.y, position.z]}>
      <planeGeometry args={[size, size]} />
      <meshBasicMaterial map={texture} transparent side={THREE.DoubleSide} />
    </mesh>
  );
}

function Scene({ flowers }) {
  const rockRadius = 1.2;
  return (
    <>
      <ambientLight intensity={0.6} />
      <directionalLight position={[4, 6, 5]} intensity={1} castShadow />
      <Environment preset="forest" />

      <group position={[0, -0.2, 0]}>
        <FloatingRock radius={rockRadius} />
        {/* full surface thin grass layer */}
        <GrassLayer count={2000} rockRadius={rockRadius} surfaceOffset={0.02} />
        {flowers.map((f) => (
          <Flower key={f.id} src={f.src} position={f.position} normal={f.normal} size={f.size} />
        ))}
      </group>

      <OrbitControls enablePan={false} minDistance={2.2} maxDistance={5} />
    </>
  );
}

export default function Garden({ flowers }) {
  return (
    <div className="w-full h-[520px] rounded-2xl overflow-hidden border border-emerald-900/10 bg-emerald-900/20">
      <Canvas shadows camera={{ position: [2.6, 1.8, 2.6], fov: 50 }}>
        <Scene flowers={flowers} />
      </Canvas>
    </div>
  );
}

// Helper for external usage: compute a position/normal on rock surface for planting
export function pickRockSurfaceSpot(rockRadius = 1.2, offset = 0.02) {
  const dir = randomUnitVector();
  const pos = dir.clone().multiplyScalar(rockRadius + offset);
  return { position: pos, normal: dir };
}
