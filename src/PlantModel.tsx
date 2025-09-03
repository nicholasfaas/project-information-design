import React from "react";
import { useGLTF } from "@react-three/drei";

interface PlantModelProps {
  modelPath: string;
  position: [number, number, number];
  scale?: [number, number, number];
}

const PlantModel: React.FC<PlantModelProps> = ({
  modelPath,
  position,
  scale = [0.5, 0.5, 0.5],
}) => {
  // Laad GLTF model
  const { scene } = useGLTF(modelPath, true);

  if (!scene) {
    console.error(`⚠️ Failed to load model: ${modelPath}`);
    return null;
  }

  return (
    <primitive
      object={scene.clone()}
      position={position}
      scale={scale}
    />
  );
};

export default PlantModel;
