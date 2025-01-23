import React from "react";
import { Edges } from "@react-three/drei";
import PlantModel from "./PlantModel";

interface BlockProps {
  position: [number, number, number];
  selectedPlant: string | null;
  onBlockClick: (position: [number, number, number]) => void;
  plantsData: Array<{ name: string; modelPath: string }>;
}

const Block: React.FC<BlockProps> = ({ position, selectedPlant, onBlockClick, plantsData }) => {
  const plantModels: Record<string, string> = Object.fromEntries(
    plantsData.map((plant) => [plant.name, plant.modelPath])
  );

  return (
    <group position={position}>
      {/* Gras */}
      <mesh position={[0, 0.45, 0]} onClick={() => onBlockClick(position)}>
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color="#A1CC47" />
        <Edges>
          <lineBasicMaterial linewidth={1} />
        </Edges>
      </mesh>

      {/* 9 Plant Models in a 3x3 grid */}
      {selectedPlant && plantModels[selectedPlant] && (
        Array.from({ length: selectedPlant === "Phytolacca" ? 2 : selectedPlant === "Dyer's rocket" ? 4 : 3 }).map((_, rowIndex) =>
          Array.from({ length: selectedPlant === "Phytolacca" ? 2 : selectedPlant === "Dyer's rocket" ? 4 : 3 }).map((_, colIndex) => {
            let xOffset = -(1 / 3) + colIndex * (selectedPlant === "Phytolacca" ? 0.5 : selectedPlant === "Dyer's rocket" ? 0.25 : 0.33);
            let zOffset = -0.04 + rowIndex * (selectedPlant === "Phytolacca" ? 0.5 : selectedPlant === "Dyer's rocket" ? 0.25 : 0.33);

            // Pas de positie aan voor specifieke planten
            if (selectedPlant === "Dyer's rocket") {
              xOffset -= 0.04;
              zOffset -= 0.335;
            }

            if (selectedPlant === "Madder") {
              xOffset -= -0.01;
              zOffset -= 0.3;
            }

            if (selectedPlant === "Phytolacca") {
              xOffset -= -0.08;
              zOffset += 0.35;
            }

            // Bepaal de schaal per plant
            const scale: [number, number, number] =
            ["Dyer's rocket", "Phytolacca"].includes(selectedPlant)
              ? [0.15, 0.3, 0.15]
              : [0.15, 0.15, 0.15];

            return (
              <PlantModel
                key={`${rowIndex}-${colIndex}`}
                modelPath={plantModels[selectedPlant]}
                position={[xOffset, 0.5, zOffset]}
                scale={scale}
              />
            );
          })
        )
      )}

      {/* Grond */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[1, 0.4, 1]} />
        <meshStandardMaterial color="#A06E48" />
        <Edges>
          <lineBasicMaterial linewidth={1} />
        </Edges>
      </mesh>
    </group>
  );
};

export default Block;
