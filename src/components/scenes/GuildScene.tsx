import { Canvas, useFrame } from '@react-three/fiber';
import { Stars, Float, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useRef } from 'react';
import type { Group, Mesh } from 'three';

function DreamTower() {
  const towerRef = useRef<Group>(null);

  useFrame((state) => {
    if (towerRef.current) {
      towerRef.current.rotation.y = state.clock.elapsedTime * 0.15;
    }
  });

  return (
    <group ref={towerRef} position={[0, 0, 0]}>
      <mesh position={[0, 0.5, 0]}>
        <cylinderGeometry args={[1.5, 2, 1, 8]} />
        <meshStandardMaterial color="#2D1B69" roughness={0.7} />
      </mesh>
      {Array(5).fill(null).map((_, i) => (
        <mesh key={i} position={[0, 1 + i * 0.8, 0]}>
          <cylinderGeometry args={[1.3 - i * 0.15, 1.5 - i * 0.15, 0.7, 8]} />
          <meshStandardMaterial
            color={i % 2 === 0 ? '#9B5DE5' : '#4ECDC4'}
            emissive={i % 2 === 0 ? '#9B5DE5' : '#4ECDC4'}
            emissiveIntensity={0.3}
            roughness={0.5}
            metalness={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, 5, 0]}>
        <coneGeometry args={[1.2, 2, 8]} />
        <meshStandardMaterial
          color="#FFD166"
          emissive="#FFD166"
          emissiveIntensity={0.8}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>
      <mesh position={[0, 6.5, 0]}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshStandardMaterial
          color="#FFD166"
          emissive="#FFD166"
          emissiveIntensity={2}
        />
      </mesh>
      {Array(4).fill(null).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2) * 1.5,
            5 + Math.sin(Date.now() * 0.001 + i) * 0.3,
            Math.sin(i * Math.PI / 2) * 1.5
          ]}
        >
          <sphereGeometry args={[0.15, 8, 8]} />
          <meshStandardMaterial
            color="#FFD166"
            emissive="#FFD166"
            emissiveIntensity={2}
          />
        </mesh>
      ))}
    </group>
  );
}

function ResearchHall() {
  const hallRef = useRef<Group>(null);

  useFrame((state) => {
    if (hallRef.current) {
      hallRef.current.rotation.y = -state.clock.elapsedTime * 0.1;
      hallRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
    }
  });

  return (
    <group ref={hallRef} position={[0, 0, 0]}>
      <mesh position={[0, 0.8, 0]} rotation={[0, Math.PI / 4, 0]}>
        <boxGeometry args={[2.5, 1.5, 2.5]} />
        <meshStandardMaterial
          color="#1A0F3D"
          roughness={0.6}
          metalness={0.4}
        />
      </mesh>
      {Array(4).fill(null).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * Math.PI / 2 + Math.PI / 4) * 1.3,
            2,
            Math.sin(i * Math.PI / 2 + Math.PI / 4) * 1.3
          ]}
        >
          <cylinderGeometry args={[0.1, 0.1, 1.5, 8]} />
          <meshStandardMaterial
            color="#9B5DE5"
            emissive="#9B5DE5"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
      <mesh position={[0, 2.8, 0]}>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#4ECDC4"
          emissive="#4ECDC4"
          emissiveIntensity={1}
          transparent
          opacity={0.7}
          roughness={0.1}
          metalness={0.9}
        />
      </mesh>
      <mesh position={[0, 2.8, 0]}>
        <ringGeometry args={[1, 1.2, 32]} />
        <meshStandardMaterial
          color="#FFD166"
          emissive="#FFD166"
          emissiveIntensity={1.5}
          transparent
          opacity={0.6}
          side={2}
        />
      </mesh>
    </group>
  );
}

function ContributingParticles() {
  const particlesRef = useRef<Group>(null);

  useFrame((state) => {
    if (particlesRef.current) {
      particlesRef.current.children.forEach((child, i) => {
        const p = child as Mesh;
        const targetY = 3 + (i % 3) * 2;
        p.position.y += (targetY - p.position.y) * 0.02;
        p.rotation.y += 0.02;
        if (p.position.y > targetY + 0.1) {
          p.position.set(
            (Math.random() - 0.5) * 6,
            -2,
            (Math.random() - 0.5) * 6
          );
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {Array(30).fill(null).map((_, i) => (
        <Float key={i} speed={1} rotationIntensity={1}>
          <mesh
            position={[
              (Math.random() - 0.5) * 6,
              Math.random() * 5,
              (Math.random() - 0.5) * 6
            ]}
          >
            <sphereGeometry args={[0.05 + Math.random() * 0.05, 6, 6]} />
            <meshStandardMaterial
              color={['#FFD166', '#9B5DE5', '#4ECDC4'][i % 3]}
              emissive={['#FFD166', '#9B5DE5', '#4ECDC4'][i % 3]}
              emissiveIntensity={2}
            />
          </mesh>
        </Float>
      ))}
    </group>
  );
}

export default function GuildScene({ type = 'tower' }: { type?: 'tower' | 'hall' }) {
  return (
    <div className="w-full h-full min-h-[300px] rounded-xl overflow-hidden">
      <Canvas
        camera={{ position: [5, 4, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1.5} color="#9B5DE5" />
        <pointLight position={[-5, 3, -5]} intensity={1} color="#4ECDC4" />
        <pointLight position={[0, 8, 0]} intensity={1.5} color="#FFD166" />

        <Stars radius={60} depth={40} count={2500} factor={4} fade speed={0.8} />
        <Sparkles count={80} scale={12} size={2.5} speed={0.4} color="#FFD166" />

        {type === 'tower' ? <DreamTower /> : <ResearchHall />}
        <ContributingParticles />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} intensity={1.2} />
          <Vignette eskil={false} offset={0.1} darkness={0.85} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
