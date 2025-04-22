import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./Avatar";

export default function AvatarScene({ isSpeaking }) {
  return (
    <div style={{ width: "100%", height: "400px" }}>
  <Canvas camera={{ position: [0, 0, 5], fov: 45 }}>
  <ambientLight intensity={2} />
  <directionalLight intensity={1.5} position={[5, 10, 5]} />
  <spotLight position={[0, 10, 10]} angle={0.3} penumbra={1} intensity={2} />
  <pointLight position={[-10, 0, -10]} intensity={1} />
  
  <Suspense fallback={null}>
    <Avatar />
  </Suspense>

  <OrbitControls enableZoom={false} enableRotate={false} />
</Canvas>

</div>

  );
}
