import React, { useState } from "react";
import { Edges } from "@react-three/drei";
import PlantModel from "./PlantModel";

interface BlockProps {
  position: [number, number, number];
  selectedPlant: string | null;
  onBlockClick: (position: [number, number, number]) => void;
  plantsData: Array<{ name: string; modelPath: string; plantsPerBlock: number }>;
  // Hover/tooltip (optioneel)
  onHoverIn?: (plantName: string, e: PointerEvent) => void;
  onHoverMove?: (e: PointerEvent) => void;
  onHoverOut?: () => void;
  enableHover?: boolean; // alleen desktop
}

const Block: React.FC<BlockProps> = ({
  position,
  selectedPlant,
  onBlockClick,
  plantsData,
  onHoverIn,
  onHoverMove,
  onHoverOut,
  enableHover = true,
}) => {
  const [hovered, setHovered] = useState(false);

  const plantInfo = selectedPlant
    ? plantsData.find((p) => p.name === selectedPlant)
    : undefined;

  const modelPath = plantInfo?.modelPath;
  const plantsPerBlock = plantInfo?.plantsPerBlock ?? 0;

  // Handmatige offsets voor specifieke modellen
  const MODEL_OFFSETS: Record<string, [number, number, number]> = {
    "Cosmos (pink)": [-0.35, 0, 0],
    "Cosmos (orange)": [-0.25, 0, 0],
    "Cosmos (red)": [-0.35, 0, 0],
    "Dyer's Chamomile": [0, 0, -0.15],
    "Marigold": [0.2, 0, 0],
    "Safflower": [0, 0, 0.3],
    "Sawwort": [0, 0, 0.35],
    "St John's Wort": [-0.65, 0, 0.05],
    "Yarrow": [0, 0, 0.3],
  };

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

  // hover handlers (alleen desktop)
  const handleOver = (e: any) => {
    if (!enableHover) return;
    e.stopPropagation();
    setHovered(true);
    if (selectedPlant && onHoverIn) onHoverIn(selectedPlant, e);
  };
  const handleMove = (e: any) => {
    if (!enableHover) return;
    e.stopPropagation();
    if (onHoverMove) onHoverMove(e);
  };
  const handleOut = (e: any) => {
    if (!enableHover) return;
    e.stopPropagation();
    setHovered(false);
    if (onHoverOut) onHoverOut();
  };

  return (
    <group position={position}>
      {/* Gras (bovenlaag) */}
      <mesh
        position={[0, 0.45, 0]}
        onClick={() => onBlockClick(position)}
        onPointerOver={handleOver}
        onPointerMove={handleMove}
        onPointerOut={handleOut}
      >
        <boxGeometry args={[1, 0.1, 1]} />
        <meshStandardMaterial color={enableHover && hovered ? "#8FB93E" : "#A1CC47"} />
        <Edges>
          <lineBasicMaterial linewidth={1} />
        </Edges>
      </mesh>

      {/* Plantmodellen */}
      {modelPath &&
        instances.map((pos, idx) => {
          const offset = MODEL_OFFSETS[selectedPlant || ""] || [0, 0, 0];
          return (
            <PlantModel
              key={idx}
              modelPath={modelPath}
              position={[
                pos[0] + offset[0],
                pos[1] + offset[1],
                pos[2] + offset[2],
              ]}
            />
          );
        })}

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
