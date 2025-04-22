import { useRef, useEffect, useMemo } from "react";
import { useFrame } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";

export default function Avatar({ isSpeaking }) {
  const group = useRef();
  const { scene } = useGLTF("/models/interviewer.glb");


  useEffect(() => {
    console.log("Scene Graph:", scene);
  }, [scene]);
  
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
  // useFrame(() => {
  //   if (isSpeaking && group.current) {
  //     group.current.rotation.y = Math.sin(Date.now() * 0.001) * 0.1;
  //   }
  // });

  useFrame(() => {
    if (group.current) {
      if (isSpeaking) {
        const time = Date.now() * 0.01;
        const scaleY = 1 + Math.sin(time) * 0.05;
        group.current.scale.y = scaleY;
        group.current.rotation.y = Math.sin(time * 0.1) * 0.1;
      } else {
        group.current.scale.y = 1;
        group.current.rotation.y = 0;
      }
    }
  });

  return (
    <group ref={group} dispose={null} position={[0, -0.7, 0]}>
       <primitive
  object={scene}
  scale={2.2}
  position={[0, -3, 0]}
  rotation={[0, Math.PI*1.5, 0]} // 👈 rotates the model to face forward
/>
    </group>
  );
}
