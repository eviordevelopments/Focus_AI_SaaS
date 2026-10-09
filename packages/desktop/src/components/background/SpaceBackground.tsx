import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Stars, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

// A dynamic starfield
function Starfield({ isStatic }: { isStatic: boolean }) {
    const group = useRef<THREE.Group>(null);
    useFrame((state, delta) => {
        if (group.current && !isStatic) {
            group.current.rotation.y += delta * 0.02;
            group.current.rotation.x += delta * 0.01;
        }
    });
    return (
        <group ref={group}>
            <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
        </group>
    );
}

// Interactive camera rig that follows the mouse smoothly
function CameraRig({ isStatic }: { isStatic: boolean }) {
    const { camera, mouse } = useThree();
    useFrame((state) => {
        if (isStatic) return;
        // Smoothly interpolate camera position based on mouse
        // Limit movement to a small area to keep planets in view
        camera.position.x = THREE.MathUtils.lerp(camera.position.x, mouse.x * 1.5, 0.05);
        camera.position.y = THREE.MathUtils.lerp(camera.position.y, mouse.y * 1.5, 0.05);
        camera.lookAt(0, 0, 0);
    });
    return null;
}

// A simple planet
function Planet({ position, color, size, speed, isStatic }: { position: [number, number, number], color: string, size: number, speed: number, isStatic?: boolean }) {
    const mesh = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (mesh.current && !isStatic) {
            mesh.current.rotation.y += delta * speed;
        }
    });
    
    return (
        <Float speed={isStatic ? 0 : 1.5} rotationIntensity={isStatic ? 0 : 0.5} floatIntensity={isStatic ? 0 : 1}>
            <mesh ref={mesh} position={position}>
                <sphereGeometry args={[size, 64, 64]} />
                <meshStandardMaterial color={color} roughness={0.7} metalness={0.2} />
            </mesh>
        </Float>
    );
}

// A glowing ring/galaxy element
function GalaxyRing({ position, color, scale, isStatic }: { position: [number, number, number], color: string, scale: number, isStatic?: boolean }) {
    const ringRef = useRef<THREE.Mesh>(null);
    useFrame((state, delta) => {
        if (ringRef.current) {
            if (!isStatic) ringRef.current.rotation.z += delta * 0.1;
            ringRef.current.rotation.x = Math.PI / 2.2;
        }
    });

    return (
        <mesh ref={ringRef} position={position} scale={scale}>
            <torusGeometry args={[3, 0.2, 16, 100]} />
            <meshBasicMaterial color={color} transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
    );
}



export function SpaceBackground() {
    const { staticBackground } = useSelector((state: RootState) => state.ui);

    return (
        <div className="fixed inset-0 z-[-10] w-full h-full bg-[#030014] overflow-hidden pointer-events-none">
            <Canvas camera={{ position: [0, 0, 10], fov: 60 }} style={{ pointerEvents: 'none' }} eventSource={document.body}>
                <ambientLight intensity={0.1} />
                <directionalLight position={[10, 10, 5]} intensity={1.5} color="#ffffff" />
                <pointLight position={[-10, -10, -10]} intensity={0.5} color="#4c1d95" />
                
                <Starfield isStatic={staticBackground} />
                
                <CameraRig isStatic={staticBackground} />
            </Canvas>
        </div>
    );
}
