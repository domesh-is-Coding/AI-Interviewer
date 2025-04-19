import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar({ isSpeaking }) {
  const group = useRef();
  const { scene } = useGLTF("/models/interviewer.glb");

  // Clipping plane to hide lower half (Y < 1.1)
  const clippingPlane = useMemo(
    () => new THREE.Plane(new THREE.Vector3(0, 1, 0), -1.1),
    []
  );

  useEffect(() => {
    scene.traverse((child) => {
      if (child.isMesh && child.material) {
        child.material.clippingPlanes = [clippingPlane];
        child.material.clipShadows = true;
        child.material.needsUpdate = true;
      }
    });
  }, [scene, clippingPlane]);

  // Add subtle head movement while speaking
  useFrame(() => {
    if (isSpeaking && group.current) {
      group.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -0.7, 0]}>
      {/* ↓ lowered by 0.7 units */}
      <primitive
        object={scene}
        scale={1}
        rotation={[0, Math.PI, 0]}
      />
    </group>
  );
}
