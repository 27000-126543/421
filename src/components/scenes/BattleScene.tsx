import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useRef } from 'react';
import type { Mesh, Group } from 'three';

function EnergyBarrier() {
  const barrierRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (barrierRef.current) {
      const material = barrierRef.current.material as any;
      material.opacity = 0.3 + Math.sin(state.clock.elapsedTime * 2) * 0.1;
    }
  });

  return (
    <mesh ref={barrierRef} position={[0, 2, 0]} rotation={[0, Math.PI / 2, 0]}>
      <planeGeometry args={[20, 8]} />
      <meshStandardMaterial
        color="#9B5DE5"
        emissive="#9B5DE5"
        emissiveIntensity={0.5}
        transparent
        opacity={0.3}
        side={2}
      />
    </mesh>
  );
}

function DreamOrb({ position, color, isLeft }: { position: [number, number, number]; color: string; isLeft: boolean }) {
  const orbRef = useRef<Group>(null);

  useFrame((state) => {
    if (orbRef.current) {
      orbRef.current.position.y = position[1] + Math.sin(state.clock.elapsedTime * 1.5 + (isLeft ? 0 : Math.PI)) * 0.3;
      orbRef.current.rotation.y = state.clock.elapsedTime * (isLeft ? 1 : -1);
    }
  });

  return (
    <group ref={orbRef} position={position}>
      <Float speed={2} rotationIntensity={1}>
        <mesh>
          <sphereGeometry args={[1.2, 32, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={1.2}
            transparent
            opacity={0.7}
            roughness={0.1}
            metalness={0.8}
          />
        </mesh>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[1.6, 0.05, 8, 32]} />
          <meshStandardMaterial
            color={color}
            emissive={color}
            emissiveIntensity={2}
            transparent
            opacity={0.8}
          />
        </mesh>
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.8, 0.03, 8, 32]} />
          <meshStandardMaterial
            color="#FFD166"
            emissive="#FFD166"
            emissiveIntensity={1.5}
            transparent
            opacity={0.6}
          />
        </mesh>
      </Float>
    </group>
  );
}

function EnergyParticles() {
  const particlesRef = useRef<Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = child as Mesh;
        p.position.x = Math.sin(state.clock.elapsedTime * 0.5 + i * 0.5) * 3;
        p.position.y = ((state.clock.elapsedTime * 0.5 + i * 0.3) % 6) - 3;
        p.position.z = Math.cos(state.clock.elapsedTime * 0.5 + i * 0.5) * 3;
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array(20).fill(null).map((_, i) => (
        <mesh key={i}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#4ECDC4' : '#EF476F'}
            emissive={i % 2 === 0 ? '#4ECDC4' : '#EF476F'}
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function BattleScene() {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden absolute inset-0">
      <Canvas
        camera={{ position: [0, 3, 10], fov: 60 }}
        style={{ background: 'linear-gradient(180deg, #0a0520 0%, #1A0F3D 50%, #2D1B69 100%)' }}
      >
        <ambientLight intensity={0.2} />
        <pointLight position={[-8, 3, 0]} intensity={2} color="#4ECDC4" />
        <pointLight position={[8, 3, 0]} intensity={2} color="#EF476F" />
        <pointLight position={[0, 5, 0]} intensity={1} color="#FFD166" />

        <Stars radius={80} depth={60} count={3000} factor={5} fade speed={0.5} />
        <Sparkles count={100} scale={15} size={3} speed={0.5} color="#9B5DE5" />

        <DreamOrb position={[-5, 2, 0]} color="#4ECDC4" isLeft={true} />
        <DreamOrb position={[5, 2, 0]} color="#EF476F" isLeft={false} />
        <EnergyBarrier />
        <EnergyParticles />

        <EffectComposer>
          <Bloom luminanceThreshold={0.3} luminanceSmoothing={0.9} height={400} intensity={1.5} />
          <Vignette eskil={false} offset={0.1} darkness={0.9} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
