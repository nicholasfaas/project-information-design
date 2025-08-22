import React, { useState } from "react";
import { Edges } from "@react-three/drei";
import PlantModel from "./PlantModel";

interface BlockProps {
  position: [number, number, number];
  selectedPlant: string | null;
  onBlockClick: (position: [number, number, number]) => void;
  plantsData: Array<{ name: string; modelPath: string; plantsPerBlock: number }>;
  onHoverIn?: (plantName: string, e: any) => void;
  onHoverMove?: (e: any) => void;
  onHoverOut?: () => void;
}

const Block: React.FC<BlockProps> = ({
  position,
  selectedPlant,
  onBlockClick,
  plantsData,
  onHoverIn,
  onHoverMove,
  onHoverOut,
}) => {
  const [hovered, setHovered] = useState(false);

  const plantInfo = selectedPlant
    ? plantsData.find((p) => p.name === selectedPlant)
    : undefined;

  const modelPath = plantInfo?.modelPath;
  const plantsPerBlock = plantInfo?.plantsPerBlock ?? 0;

  const makeCenteredPositions = (n: number): Array<[number, number, number]> => {
    if (n <= 0) return [];
    const cols = Math.ceil(Math.sqrt(n));
    const rows = Math.ceil(n / cols);
    const positions: Array<[number, number, number]> = [];
    let placed = 0;

    const zStep = 1 / (rows + 1);
    for (let r = 0; r < rows; r++) {
      const remaining = n - placed;
      const countInRow = Math.min(cols, remaining);
      const xStep = 1 / (countInRow + 1);
      const z = -0.5 + zStep * (r + 1);
      for (let k = 0; k < countInRow; k++) {
        const x = -0.5 + xStep * (k + 1);
        positions.push([x, 0.5, z]);
      }
      placed += countInRow;
    }
    return positions;
  };

  const instances = modelPath ? makeCenteredPositions(plantsPerBlock) : [];

  return (
    <group position={position}>
      {/* Gras (bovenlaag) */}
      <mesh
        position={[0, 0.45, 0]}
        onClick={() => onBlockClick(position)}
        onPointerOver={(e) => {
          e.stopPropagation();
          setHovered(true); // highlighten
          if (selectedPlant && onHoverIn) {
            onHoverIn(selectedPlant, e);
          }
        }}
        onPointerMove={(e) => {
          e.stopPropagation();
          if (onHoverMove) onHoverMove(e);
        }}
        onPointerOut={(e) => {
          e.stopPropagation();
          setHovered(false); // reset highlight
          if (onHoverOut) onHoverOut();
        }}
      >
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={hovered ? "#8FB93E" : "#A1CC47"} />
        <Edges>
          <lineBasicMaterial linewidth={1} />
        </Edges>
      </mesh>

      {/* Plantmodellen */}
      {modelPath &&
        instances.map((pos, idx) => (
          <PlantModel key={idx} modelPath={modelPath} position={pos} />
        ))}

      {/* Grond (onderlaag) */}
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
