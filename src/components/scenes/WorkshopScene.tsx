import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Stars, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom, Vignette } from '@react-three/postprocessing';
import { useRef, useMemo } from 'react';
import type { Group, Mesh } from 'three';

function FloatingIsland() {
  const groupRef = useRef<Group>(null);

  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = state.clock.elapsedTime * 0.05;
      groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.3;
    }
  });

  return (
    <group ref={groupRef} position={[0, -1, 0]}>
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[3, 4, 2, 8]} />
        <meshStandardMaterial
          color="#2D1B69"
          roughness={0.8}
          metalness={0.2}
        />
      </mesh>
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[3.5, 3, 0.4, 8]} />
        <meshStandardMaterial
          color="#06D6A0"
          roughness={0.9}
        />
      </mesh>
      {Array(5).fill(null).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos(i * 1.2) * 2.5,
            1.8 + Math.random() * 1.5,
            Math.sin(i * 1.2) * 2.5
          ]}
        >
          <sphereGeometry args={[0.3 + Math.random() * 0.2, 8, 8]} />
          <meshStandardMaterial
            color="#FFD166"
            emissive="#FFD166"
            emissiveIntensity={0.5}
          />
        </mesh>
      ))}
    </group>
  );
}

function DreamCrystals() {
  const crystals = useMemo(() => 
    Array(8).fill(null).map((_, i) => ({
      position: [
        Math.cos(i * 0.8) * 5,
        Math.random() * 3 - 0.5,
        Math.sin(i * 0.8) * 5
      ] as [number, number, number],
      scale: 0.5 + Math.random() * 0.5,
      speed: 0.5 + Math.random() * 0.5,
      color: ['#9B5DE5', '#4ECDC4', '#FFD166'][i % 3]
    })), []
  );

  return (
    <>
      {crystals.map((crystal, i) => (
        <Float key={i} speed={crystal.speed} rotationIntensity={0.5} floatIntensity={1}>
          <mesh position={crystal.position} scale={crystal.scale}>
            <octahedronGeometry args={[0.5, 0]} />
            <meshStandardMaterial
              color={crystal.color}
              emissive={crystal.color}
              emissiveIntensity={0.8}
              transparent
              opacity={0.8}
              roughness={0.1}
              metalness={0.9}
            />
          </mesh>
        </Float>
      ))}
    </>
  );
}

function MagicBeams() {
  const beamRef = useRef<Mesh>(null);

  useFrame((state) => {
    if (beamRef.current) {
      beamRef.current.rotation.z = state.clock.elapsedTime * 0.3;
    }
  });

  return (
    <mesh ref={beamRef} position={[0, 3, 0]}>
      <torusGeometry args={[3, 0.05, 8, 32]} />
      <meshStandardMaterial
        color="#4ECDC4"
        emissive="#4ECDC4"
        emissiveIntensity={2}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export default function WorkshopScene() {
  return (
    <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden">
      <Canvas
        camera={{ position: [0, 3, 8], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={1} color="#9B5DE5" />
        <pointLight position={[-5, 3, -5]} intensity={0.8} color="#4ECDC4" />
        <pointLight position={[0, 5, 0]} intensity={1.2} color="#FFD166" />
        <directionalLight position={[0, 10, 5]} intensity={0.5} />

        <Stars radius={50} depth={50} count={2000} factor={4} fade speed={1} />
        <Sparkles count={50} scale={10} size={2} speed={0.4} color="#FFD166" />

        <FloatingIsland />
        <DreamCrystals />
        <MagicBeams />

        <OrbitControls
          enablePan={false}
          enableZoom={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI / 2}
        />

        <EffectComposer>
          <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} height={300} />
          <Vignette eskil={false} offset={0.1} darkness={0.8} />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
