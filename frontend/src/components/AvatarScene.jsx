import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls } from "@react-three/drei";
import Avatar from "./Avatar";

export default function AvatarScene({ isSpeaking }) {
  return (
    <div className="w-64 h-64 bg-white rounded-lg overflow-hidden shadow-lg">
      <Canvas
        camera={{ position: [0, 1.3, 3.5], fov: 30 }}
        gl={{ preserveDrawingBuffer: true, localClippingEnabled: true }}
      >
        <Suspense fallback={null}>
          <ambientLight intensity={0.6} />
          <spotLight position={[10, 10, 10]} angle={0.2} penumbra={1} />
          <pointLight position={[-10, -10, -10]} />

          <Avatar isSpeaking={isSpeaking} />

          <Environment preset="studio" />

          <OrbitControls
            enableZoom={false}
            enablePan={false}
            minPolarAngle={Math.PI / 4}
            maxPolarAngle={Math.PI / 2}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
