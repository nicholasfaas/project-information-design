import React, { useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Block from "./Block";
import Background from './assets/background.png';
import { Grid, PaintBucket, CloudSun, Sprout, Eraser, SquareArrowOutUpRight, Share, Clipboard, ClipboardCheck, QrCode, Printer } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";

const App: React.FC = () => {
  const [width, setWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(2);
  const [tempWidth, setTempWidth] = useState<string>(width.toString());
  const [tempHeight, setTempHeight] = useState<string>(height.toString());
  const sunlightOptions = ["Partial Sun", "Full Sun"] as const;
  const [selectedSunlight, setSelectedSunlight] = useState<string[]>([]); 
  const colorOptions = ["Yellow","Orange","Red","Pink","Purple","Blue","Green","Brown","Grey","Black"] as const;
  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedBlocks, setSelectedBlocks] = useState<{ [key: string]: string }>({});
  const [plant, setPlant] = useState<string | null>(null);
  const [plants, setPlants] = useState<any[]>([]);
  const [eraseMode, setEraseMode] = useState<boolean>(false);
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [restored, setRestored] = useState(false);

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

  const handleSunlightSelection = (option: string) => {
    setSelectedSunlight(prev =>
      prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option]
    );
  };

  const handleColorSelection = (option: string) => {
    setSelectedColors(prev =>
      prev.includes(option) ? prev.filter(v => v !== option) : [...prev, option]
    );
  };

  const handlePlantSelection = (selectedPlant: string) => {
    setEraseMode(false); // uit zodra je een plant kiest
    setPlant((prev) => (prev === selectedPlant ? null : selectedPlant));
  };

  const handleBlockClick = (position: [number, number, number]) => {
    const key = position.join(",");
    const hadPlant = !!selectedBlocks[key];

    setSelectedBlocks((prev) => {
      const next = { ...prev };

      if (eraseMode) {
        if (next[key]) delete next[key];
        return next;
      }

      if (plant) next[key] = plant;
      return next;
    });

    if ((eraseMode && hadPlant) || plant) {
      setTooltip((t) => (t.show ? { ...t, show: false } : t));
    }
  };

  const filteredPlants = plants.filter(plant => {
    const sunlightMatch =
      selectedSunlight.length === 0 || // geen filter → altijd match
      selectedSunlight.some(s => plant.sunlight.includes(s));

    const colorMatch =
      selectedColors.length === 0 || // geen filter → altijd match
      selectedColors.some(c => plant.colors.includes(c));

    return sunlightMatch && colorMatch;
  });

  const calculatePlantSummary = () => {
    const summary: { [key: string]: { count: number } } = {};

    Object.values(selectedBlocks).forEach((plantName) => {
      const plantInfo = plants.find((p) => p.name === plantName);
      if (plantInfo) {
        if (!summary[plantName]) {
          summary[plantName] = { count: 0 };
        }
        summary[plantName].count += plantInfo.plantsPerBlock;
      }
    });

    return summary;
  };
  
  const plantSummary = calculatePlantSummary();

  const PLANT_URLS: Record<string, string> = {
    "Coreopsis": "https://localcolor.amsterdam/plant/coreopsis/",
    "Cosmos (pink)": "https://localcolor.amsterdam/plant/cosmos-bipinnatus/",
    "Cosmos (orange)": "https://localcolor.amsterdam/plant/sulfur-cosmos/",
    "Cosmos (red)": "https://localcolor.amsterdam/plant/chocolat-cosmos/",
    "Dyer's chamomile": "https://localcolor.amsterdam/plant/dyers-chamomile/",
    "Hollyhock": "https://localcolor.amsterdam/plant/hollyhock/",
    "Japanese Indigo": "https://localcolor.amsterdam/plant/japanese-indigo/",
    "Madder": "https://localcolor.amsterdam/plant/madder/",
    "Marigold": "https://localcolor.amsterdam/plant/marigold/",
    "Safflower": "https://localcolor.amsterdam/plant/safflower/",
    "Sawwort": "https://localcolor.amsterdam/plant/saw-wort/",
    "Goldenrod": "https://localcolor.amsterdam/plant/solidago/",
    "St John's Wort": "https://localcolor.amsterdam/plant/st-johns-wort/",
    "Tansy": "https://localcolor.amsterdam/plant/tansy/",
    "Weld": "https://localcolor.amsterdam/plant/weld/",
    "Woad": "https://localcolor.amsterdam/plant/woad/",
    "Yarrow": "https://localcolor.amsterdam/plant/yarrow/"
  };

  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; text: string }>({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  // Handlers die we aan Block doorgeven
  const handleCellHoverIn = (plantName: string, e: any) => {
    setTooltip({ show: true, x: e.clientX, y: e.clientY, text: plantName });
  };
  const handleCellHoverMove = (e: any) => {
    setTooltip((t) => (t.show ? { ...t, x: e.clientX, y: e.clientY } : t));
  };
  const handleCellHoverOut = () => {
    setTooltip((t) => ({ ...t, show: false }));
  };

  const copyShareURL = async () => {
    const url = buildShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset na 2s
    } catch (e) {
      console.error("Clipboard write failed", e);
      window.prompt("Copy this URL:", url); // fallback
    }
  };

  // --- SHARE / RESTORE helpers ---
  type SharedState = {
    w: number;
    h: number;
    blocks: { [key: string]: string };
    sSun: string[];
    sCol: string[];
  };

  // bouw een deelbare URL met huidige staat in de hash
  const buildShareURL = (): string => {
    const state: SharedState = {
      w: width,
      h: height,
      blocks: selectedBlocks,
      sSun: selectedSunlight,
      sCol: selectedColors,
    };
    const encoded = encodeURIComponent(JSON.stringify(state));
    return `${window.location.origin}${window.location.pathname}#state=${encoded}`;
  };

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

  // herstel uit URL-hash bij eerste load
  useEffect(() => {
    const match = window.location.hash.match(/state=(.*)$/);
    if (match) {
      try {
        const obj = JSON.parse(decodeURIComponent(match[1])) as SharedState;
        if (typeof obj.w === "number") setWidth(obj.w);
        if (typeof obj.h === "number") setHeight(obj.h);
        if (obj.blocks && typeof obj.blocks === "object") setSelectedBlocks(obj.blocks);
        if (Array.isArray(obj.sSun)) setSelectedSunlight(obj.sSun);
        if (Array.isArray(obj.sCol)) setSelectedColors(obj.sCol);
      } catch (e) {
        console.error("Failed to restore shared state:", e);
      }
    }
    setRestored(true);
  }, []);

  // schrijf alleen naar URL als de restore klaar is
  useEffect(() => {
    if (!restored) return; // skip de eerste keer
    const encoded = encodeURIComponent(JSON.stringify({
      w: width,
      h: height,
      blocks: selectedBlocks,
      sSun: selectedSunlight,
      sCol: selectedColors,
    } as SharedState));
    history.replaceState(null, "", `${window.location.pathname}#state=${encoded}`);
  }, [restored, width, height, selectedBlocks, selectedSunlight, selectedColors]);

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
          color: "#000",
          boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.5)",
          zIndex: "1",
          overflow: "auto"
        }}
      >
        <h2 style={{ fontSize: "2em", fontWeight: "700", margin: 0 }}>Design your dye garden</h2>
        <p style={{ fontSize: 14, color: '#666' }}>
          Set up your garden and preferences below. Use filters to find suitable plants, select them and click on a grid cell in the garden to place them.
        </p>

        <div
          style={{
            height: "1px",
            backgroundColor: "#E8E8E8",
            borderRadius: "1px",
            margin: "2em 0",
            width: "100%"
          }}
        ></div>
 
        {/* Garden Area */}
        <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#000"
            }}
          >
            <Grid size={20} color="#fff" />
          </span>
          Garden area
        </h3>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
          Select the size of your garden area in square meters.
        </p>

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
                fontFamily: "'Montserrat', sans-serif", 
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
                border: "1px solid #aaa",
                color: "#000",
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
                fontFamily: "'Montserrat', sans-serif", 
                color: "#000",
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
                border: "1px solid #aaa",
                color: "#000",
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
        <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#000"
            }}
          >
            <CloudSun size={20} color="#fff" />
          </span>
          Sunlight
        </h3>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
          Select one or more sunlight conditions in your garden.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
          {sunlightOptions.map((option) => (
            <label
              key={option}
              style={{ display: "flex", alignItems: "center", gap: "0.5em", cursor: "pointer", userSelect: "none" }}
            >
              <input
                type="checkbox"
                checked={selectedSunlight.includes(option)}
                onChange={() => handleSunlightSelection(option)}
                style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f73900" }}
              />
              <span style={{ color: "#000" }}>{option}</span>
            </label>
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

        {/* Color Filter */}
        <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              width: 32,
              height: 32,
              borderRadius: "50%",
              backgroundColor: "#000"
            }}
          >
            <PaintBucket size={20} color="#fff" />
          </span>
          Dye color
        </h3>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
          Select one or multiple dye colors you want your plant(s) to produce.
        </p>
        
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "0.5em 1.5em",
          }}
        >
          {colorOptions.map((option) => (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.5em",
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(option)}
                onChange={() => handleColorSelection(option)}
                style={{
                  width: 16,
                  height: 16,
                  cursor: "pointer",
                  accentColor: "#f73900", // rood
                }}
              />
              <span style={{ color: "#000" }}>{option}</span>
            </label>
          ))}
        </div>

        <div
          style={{
            height: "1px",
            backgroundColor: "#E8E8E8",
            borderRadius: "1px",
            margin: "2em 0",
            width: "100%",
          }}
        ></div>

        {/* Plants */}
        <h3
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}
        >
          <span
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5em",
              fontWeight: 600,
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#000",
              }}
            >
              <Sprout size={20} color="#fff" />
            </span>
            <span>Plants</span>
          </span>

          <Eraser
            size={20}
            color={eraseMode ? "#f73900" : "#000"}
            style={{ cursor: "pointer" }}
            onClick={() => {
              setEraseMode((v) => !v);
              setPlant(null);
              setTooltip((t) => (t.show ? { ...t, show: false } : t));
            }}
          />
        </h3>
        <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
          Click on a plant to select it. Then place it in the garden by clicking on a grid cell. Remove a plant by clicking on the erase icon above and then on the grid cell of the plant to remove it.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1em" }}>
          {plants.map(({ name, image }) => {
            const isSelected = plant === name;
            const isVisible = filteredPlants.some((p) => p.name === name);

            return (
              <div
                key={name}
                onClick={() => handlePlantSelection(name)}
                style={{
                  display: isVisible ? "flex" : "none",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5em",
                  background: "transparent",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  outline: "none",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") handlePlantSelection(name);
                }}
              >
                <img
                  src={image}
                  alt={name}
                  style={{
                    width: "100%",
                    aspectRatio: "1 / 1",
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: isSelected ? "4px solid #f73900" : "4px solid transparent",
                    boxShadow: isSelected ? "0 0 0 2px #fff" : "none",
                  }}
                />
                <span style={{ color: "#000", fontSize: "0.95em", textAlign: "center" }}>
                  {name}
                </span>
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
          cursor: eraseMode
            ? "url(/cursor/eraser.png) 16 16, pointer"
            : "default",
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
                onHoverIn={handleCellHoverIn}
                onHoverMove={handleCellHoverMove}
                onHoverOut={handleCellHoverOut}
              />
            ))
          )}
        </Canvas>
        {tooltip.show && (
          <div
            style={{
              position: "fixed",
              left: tooltip.x + 12,
              top: tooltip.y + 12,
              pointerEvents: "none",
              background: "#000",
              color: "#fff",
              fontSize: 12,
              padding: "6px 8px",
              borderRadius: 6,
              boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
              zIndex: 9999,
              maxWidth: 220,
              whiteSpace: "nowrap",
            }}
          >
            {tooltip.text}
          </div>
        )}
      </div>
 
      {/* Popup aan de rechterkant */}
      <div
        style={{
          position: "fixed",
          top: "0",
          right: "0",
          width: "24em",
          height: "100vh",
          color: "#000",
          backgroundColor: "#fff",
          padding: "1em",
          boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.5)",
          zIndex: "1",
          display: "flex",
          flexDirection: "column"
        }}
      >
        <div style={{ flex: 1, overflowY: "auto" }}>
          <h2 style={{ fontSize: "2em", margin: 0 }}>Results</h2>
          {Object.entries(plantSummary).length > 0 ? (
            <>
              {Object.entries(plantSummary).map(([plantName, data]) => {
                const plantInfo = plants.find(p => p.name === plantName);
                const specific: string[] = plantInfo?.specificColors ?? [];
                const infoUrl = PLANT_URLS[plantName];

                return (
                  <div
                    key={plantName}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      textAlign: "left",
                      padding: "1em",
                      backgroundColor: "#eee",
                      borderRadius: "8px",
                      margin: "1em 0",
                    }}
                  >
                    {/* Name */}
                    <div style={{ flex: 2, textAlign: "left", margin: "0 8px 0 0" }}>
                      <p style={{ margin: "0 0 2px 0", fontSize: 12 }}>Name</p>
                      <h3 style={{ margin: 0 }}>{plantName}</h3>
                    </div>

                    {/* Amount */}
                    <div style={{ flex: 1, textAlign: "left", margin: "0 8px" }}>
                      <p style={{ margin: "0 0 2px 0", fontSize: 12 }}>Amount</p>
                      <h3 style={{ margin: 0 }}>{data.count}</h3>
                    </div>

                    {/* Dye color */}
                    <div style={{ flex: 3, textAlign: "left", margin: "0 8px" }}>
                      <p style={{ margin: "0 0 4px 0", fontSize: 12 }}>Dye color</p>
                      <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                        {specific.length > 0 ? (
                          specific.map((hex: string) => (
                            <span
                              key={hex}
                              title={hex}
                              style={{
                                display: "inline-block",
                                width: 20,
                                height: 20,
                                borderRadius: 4,
                                backgroundColor: hex,
                                border: "1px solid rgba(0,0,0,0.15)",
                              }}
                            />
                          ))
                        ) : (
                          <span style={{ fontSize: 12, color: "#666" }}>—</span>
                        )}
                      </div>
                    </div>

                    {/* Info page */}
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "flex-end",
                        margin: "0 0 0 8px",
                      }}
                    >
                      {infoUrl && (
                        <a
                          href={infoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            display: "inline-flex",
                            alignItems: "center",
                            justifyContent: "center",
                            width: 20,
                            height: 20,
                            textDecoration: "none",
                          }}
                        >
                          <SquareArrowOutUpRight size={20} color="#000" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p style={{ fontSize: 14, color: "#666" }}>
              Place plants on your garden to see results.
            </p>
          )}
        </div>

        {/* Footer onderaan */}
        <div style={{ borderTop: "1px solid #E8E8E8", padding: "1em 0 2em 0", margin: "1em 0" }}>
          <h3
            style={{
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              gap: "0.5em",
            }}
          >
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                width: 32,
                height: 32,
                borderRadius: "50%",
                backgroundColor: "#000",
              }}
            >
              <Share size={20} color="#fff" />
            </span>
            Share your garden
          </h3>
          <p style={{ fontSize: 14, color: "#666", margin: "0 0 2em" }}>
            Copy the link, scan the QR-code or print your garden by using the buttons below.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "0.5em",
              textAlign: "center",
            }}
          >
            <div
              onClick={copyShareURL}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? copyShareURL() : null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25em",
                cursor: "pointer",
              }}
            >
              {copied ? (
                <>
                  <ClipboardCheck size={28} color="#000" />
                  <span style={{ fontSize: 12 }}>Copied</span>
                </>
              ) : (
                <>
                  <Clipboard size={28} color="#000" />
                  <span style={{ fontSize: 12 }}>Copy link</span>
                </>
              )}
            </div>

            <div
              onClick={() => setShowQr(true)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? setShowQr(true) : null)}
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25em",
                cursor: "pointer",
              }}
            >
              <QrCode size={28} color="#000" />
              <span style={{ fontSize: 12 }}>Scan QR-code</span>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "0.25em",
                cursor: "pointer",
              }}
            >
              <Printer size={28} color="#000" />
              <span style={{ fontSize: 12 }}>Print</span>
            </div>
          </div>
        </div>
      </div>

      {showQr && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.6)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 2000,
          }}
          onClick={() => setShowQr(false)}
        >
          <div
            style={{
              background: "#fff",
              padding: "2em",
              borderRadius: "12px",
              boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <QRCodeCanvas value={buildShareURL()} size={300} />
          </div>
        </div>
      )}
    </div>
  );
};
 
export default App;