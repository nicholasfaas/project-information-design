import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Block from "./Block";
import Background from './assets/background.png';
import { Grid, PaintBucket, CloudSun, Sprout, Timer } from "lucide-react";

const App: React.FC = () => {
  const [width, setWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(2);
  const [colors, setColors] = useState<string[]>([]);
  const sunlightOptions = ["Shadow", "Both", "Partial Sun", "Full Sun"];
  const [selectedSunlight, setSelectedSunlight] = useState<number[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<{ [key: string]: string }>({});
  const [plant, setPlant] = useState<string | null>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [tempWidth, setTempWidth] = useState<string>(width.toString());
  const [tempHeight, setTempHeight] = useState<string>(height.toString());

  useEffect(() => {
    fetch("/assets/plants.json")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch plant data");
        }
        return response.json(); 
      })
      .then((data) => {
        setPlants(data);
      })
      .catch((error) => {
        console.error("Error loading plant data:", error);
      });
  }, []);

  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempWidth(value);
    if (value !== "") {
      setWidth(Math.max(1, parseInt(value, 10) || 1));
    }
  };

  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setTempHeight(value);
    if (value !== "") {
      setHeight(Math.max(1, parseInt(value, 10) || 1));
    }
  };

  const handleBlurWidth = () => {
    if (tempWidth === "") {
      setTempWidth(width.toString());
    }
  };

  const handleBlurHeight = () => {
    if (tempHeight === "") {
      setTempHeight(height.toString());
    }
  };

  const handleSunlightSelection = (index: number) => {
    setSelectedSunlight((prev) =>
      prev.includes(index) 
        ? prev.filter((item) => item !== index)  // Verwijder de geselecteerde optie
        : [...prev, index]  // Voeg toe aan de geselecteerde opties
    );
  };  

  const handleColorSelection = (selectedColor: string) => {
    setColors((prevColors) =>
      prevColors.includes(selectedColor)
        ? prevColors.filter((color) => color !== selectedColor)
        : [...prevColors, selectedColor]
    );
  };

  const handlePlantSelection = (selectedPlant: string) => {
    setPlant((prevPlant) => (prevPlant === selectedPlant ? null : selectedPlant));
  };

  const handleBlockClick = (position: [number, number, number]) => {
    if (plant) {
      setSelectedBlocks((prev) => ({
        ...prev,
        [position.join(",")]: plant,
      }));
    }
  };

  const filteredPlants = plants.filter(
    (plant) =>
      (colors.length === 0 || colors.includes(plant.color)) &&
      (selectedSunlight.length === 0 || selectedSunlight.some((index) => sunlightOptions[index] === plant.sunlight))
  );  

  const calculatePlantSummary = () => {
    const summary: { [key: string]: { count: number; totalGrams: number; color: string } } = {};
  
    Object.values(selectedBlocks).forEach((plantName) => {
      const plantInfo = plants.find((p) => p.name === plantName);
      if (plantInfo) {
        if (!summary[plantName]) {
          summary[plantName] = {
            count: 0,
            totalGrams: 0,
            color: plantInfo.color,
          };
        }
        summary[plantName].count += plantInfo.plantsPerBlock;
        summary[plantName].totalGrams += plantInfo.plantsPerBlock * plantInfo.gramsPerPlant;
      }
    });
  
    return summary;
  };

  const plantSummary = calculatePlantSummary();
  const totalPlants = Object.values(plantSummary).reduce((sum, item) => sum + item.count, 0);
  const totalGrams = Object.values(plantSummary).reduce((sum, item) => sum + item.totalGrams, 0);

 
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "row",
        height: "100vh",
        width: "100vw",
        backgroundColor: "#fff",
      }}
    >
      {/* Left menu */}
      <div
        style={{
          position: "fixed",
          top: "0",
          left: "0",
          width: "24em",
          height: "100vh",
          backgroundColor: "#fff",
          padding: "1em",
          boxSizing: "border-box",
          color: "#1E4D3B",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          zIndex: "1",
          overflow: "auto"
        }}
      >
        <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", fontSize: "2em", fontWeight: "700" }}>Select your garden conditions</h2>
 
        {/* Garden Area */}
        <h3 style={{ fontFamily: "'Hind Madurai', sans-serif", display: "flex", alignItems: "center", gap: "0.5em", color: "#00A264", marginBottom: "8px" }}>
          <Grid size={20} color="#00A264" /> Garden Area (m²)
        </h3>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: ".5em",
            width: "100%"
          }}
        >
          {/* Width */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5em",
            }}
          >
            <label
              style={{
                fontFamily: "'Hind Madurai', sans-serif", 
                color: "#1E4D3B",
                flex: ".5",
              }}
            >
              Width:
            </label>
            <input
              type="number"
              min="1"
              value={tempWidth}
              onChange={handleWidthChange}
              onBlur={handleBlurWidth}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #1E4D3B",
                color: "#1E4D3B",
                height: "2em",
                flex: "2",
                padding: "0 0.5em",
                borderRadius: "4px",
              }}
            />
          </div>
 
          {/* Length */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "0.5em",
            }}
          >
            <label
              style={{
                fontFamily: "'Hind Madurai', sans-serif", 
                color: "#1E4D3B",
                flex: ".5",
              }}
            >
              Length:
            </label>
            <input
              type="number"
              min="1"
              value={tempHeight}
              onChange={handleHeightChange}
              onBlur={handleBlurHeight}
              style={{
                backgroundColor: "transparent",
                border: "1px solid #1E4D3B",
                color: "#1E4D3B",
                height: "2em",
                flex: "2",
                padding: "0 0.5em",
                borderRadius: "4px",
              }}
            />
          </div>
        </div>
 
        <div
          style={{
            height: "1px",
            backgroundColor: "#E8E8E8",
            borderRadius: "1px",
            margin: "2em 0",
            width: "100%"
          }}
        ></div>
 
        {/* Sunlight Filter */}
        <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em", color: "#00A264", marginBottom: "8px" }}>
          <CloudSun size={20} color="#00A264" /> Sunlight
        </h3>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5em"
          }}
        >
          {sunlightOptions.map((option, index) => (
            <button
              key={option}
              onClick={() => handleSunlightSelection(index)}
              style={{
                flex: 1,
                padding: "0.5em",
                border: "1px solid #1E4D3B",
                borderRadius: "4px",
                backgroundColor: selectedSunlight.includes(index) ? "#1E4D3B" : "#fff",
                color: selectedSunlight.includes(index) ? "#fff" : "#1E4D3B",
                fontSize: "1em",
                fontWeight: "normal",
                cursor: "pointer",
                outline: "none",
                textAlign: "center",
              }}
            >
              {option}
            </button>
          ))}
        </div>
 
        <div
          style={{
            height: "1px",
            backgroundColor: "#E8E8E8",
            borderRadius: "1px",
            margin: "2em 0",
            width: "100%"
          }}
        ></div>
 
        {/* Choose Your Plant */}
        <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", fontSize: "2em" }}>Customize your garden</h2>

        {/* Color Filter */}
        <h3 style={{ fontFamily: "'Hind Madurai', sans-serif", display: "flex", alignItems: "center", gap: "0.5em", color: "#00A264", marginBottom: "8px" }}>
          <PaintBucket size={20} color="#00A264" /> Color
        </h3>
        <div
          style={{
            display: "flex",
            gap: "12px",
            width: "100%"
          }}
        >
          {["#FFE908", "#FF7F51", "red", "#5463A1"].map((color) => (
            <div
              key={color}
              onClick={() => handleColorSelection(color)}
              style={{
                flex: "1",
                height: "2em",
                borderRadius: "4px",
                backgroundColor: color,
                boxShadow: colors.includes(color) ? "0 0 0 2px #fff, 0 0 0 4px #1E4D3B" : "none",
                cursor: "pointer",
              }}
            />
          ))}
        </div>
 
        <div
          style={{
            height: "1px",
            backgroundColor: "#E8E8E8",
            borderRadius: "1px",
            margin: "2em 0",
            width: "100%"
          }}
        ></div>

        <h3 style={{ fontFamily: "'Hind Madurai', sans-serif", display: "flex", alignItems: "center", gap: "0.5em", color: "#00A264", marginBottom: "8px" }}>
          <Sprout size={20} color="#00A264" /> Plants
        </h3>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em" }}>
        {plants.map(({ name, image, bloomTime }) => {
          const isSelected = plant === name;
          return (
            <div
              key={name}
              onClick={() => handlePlantSelection(name)}
              style={{
                display: filteredPlants.some((filteredPlant) => filteredPlant.name === name) ? "block" : "none",
                position: "relative",
                width: "100%",
                height: "12em",
                borderRadius: "6px",
                overflow: "hidden",
                outline: isSelected ? "4px solid #00A264" : "none",
                cursor: "pointer",
              }}
            >
              <img
                src={image}
                alt={name}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: "100%",
                  background: "linear-gradient(rgba(0, 0, 0, 0) 50%,rgb(0, 0, 0) 100%)",
                }}
              />
              <div
                style={{
                  fontFamily: "'Hind Madurai', sans-serif", 
                  position: "absolute",
                  left: "0.5em",
                  bottom: "0.5em",
                  color: "#fff",
                  fontSize: "1em",
                }}
              >
                {name}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <Timer size={16} color="#fff" />
                  <span style={{ fontSize: "1em", fontWeight: "lighter" }}>{bloomTime}</span>
                </div>
              </div>
            </div>
          );
        })}
        </div>
      </div>
 
      {/* Canvas */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundImage: `url(${Background})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <Canvas
          style={{
            width: "100%",
            height: "100%",
          }}
          camera={{
            position: [width * 2, Math.max(width, height) * 2, height * 2],
            fov: 50,
          }}
        >
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls target={[width / 2 - 0.5, 0, height / 2 - 0.5]} />
          {Array.from({ length: height }).map((_, rowIndex) =>
            Array.from({ length: width }).map((_, colIndex) => (
              <Block
                key={`${rowIndex}-${colIndex}`}
                position={[colIndex, 0, rowIndex]}
                selectedPlant={selectedBlocks[`${colIndex},0,${rowIndex}`] || null}
                onBlockClick={handleBlockClick}
                plantsData={plants}
              />
            ))
          )}
        </Canvas>
      </div>
 
      {/* Popup aan de rechterkant */}
      <div
        style={{
          position: "fixed",
          top: "0",
          right: "0",
          width: "24em",
          height: "100vh",
          color: "#1E4D3B",
          backgroundColor: "#fff",
          padding: "1em",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
          zIndex: "1",
        }}
      >
        <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", fontSize: "2em" }}>Results</h2>
        {Object.entries(plantSummary).length > 0 ? (
          <>
            {Object.entries(plantSummary).map(([plantName, data]) => (
              <div
                key={plantName}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  textAlign: "left",
                  padding: "1em",
                  backgroundColor: "rgba(30, 77, 59, 0.1)",
                  borderRadius: "8px",
                  marginBottom: "1em",
                }}
              >
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0 0 .5em 0", fontSize: "12px" }}>Color</p>
                  <span
                    style={{
                      width: "2em",
                      height: "2em",
                      borderRadius: "4px",
                      backgroundColor: data.color,
                      display: "inline-block",
                    }}
                  ></span>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0", fontSize: "12px" }}>Plants</p>
                  <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0" }}>{data.count}</h2>
                </div>
                <div style={{ flex: 1, textAlign: "left" }}>
                  <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0", fontSize: "12px" }}>Grams of fabric</p>
                  <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0" }}>{data.totalGrams.toLocaleString()} g</h2>
                </div>
              </div>
            ))}

            {/* Totaal aantal planten en grams */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                textAlign: "left",
                padding: "1em",
                marginTop: "1em",
                borderTop: "1px solid #1E4D3B",
              }}
            >
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0", fontSize: "12px" }}>Total colors</p>
                <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0" }}>{new Set(Object.values(plantSummary).map(item => item.color)).size}</h2>
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0", fontSize: "12px" }}>Total plants</p>
                <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0" }}>{totalPlants}</h2>
              </div>
              <div style={{ flex: 1, textAlign: "left" }}>
                <p style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0", fontSize: "12px" }}>Total grams of fabric</p>
                <h2 style={{ fontFamily: "'Hind Madurai', sans-serif", margin: "0" }}>{totalGrams.toLocaleString()} g</h2>
              </div>
            </div>
          </>
        ) : (
          <p style={{ fontFamily: "'Hind Madurai', sans-serif" }}>Place plants on your garden to see results.</p>
        )}
        <div
          style={{
            position: "absolute",
            bottom: "3em",
            left: "1em",
            right: "1em",
            textAlign: "center",
          }}
        >
          <a
            href="/handleiding.pdf"
            download="handleiding.pdf"
            style={{
              fontFamily: "'Hind Madurai', sans-serif", 
              display: "inline-block",
              width: "100%",
              padding: "12px 0",
              backgroundColor: "#1E4D3B",
              color: "#fff",
              fontSize: "20px",
              textDecoration: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
          >
            Download PDF
          </a>
        </div>
      </div>
    </div>
  );
};
 
export default App;