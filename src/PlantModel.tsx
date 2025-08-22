import React from "react";
import { useGLTF } from "@react-three/drei";

interface PlantModelProps {
  modelPath: string;
  position: [number, number, number];
  scale?: [number, number, number];
}

const PlantModel: React.FC<PlantModelProps> = ({ modelPath, position, scale = [0.5, 0.5, 0.5] }) => {
  const { scene } = useGLTF(modelPath);

  return <primitive object={scene.clone()} position={position} scale={scale} />;
};

export default PlantModel;
