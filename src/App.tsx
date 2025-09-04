import React, { useEffect, useMemo, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Block from "./Block";
import waag from "./assets/waag-futurelab.svg";
import localcolor from "./assets/localcolor.svg";
import localcolorFuturelab from "./assets/localcolor-futurelab.svg";
import {
  Grid,
  PaintBucket,
  CloudSun,
  Sprout,
  Eraser,
  SquareArrowOutUpRight,
  Share,
  Clipboard,
  ClipboardCheck,
  QrCode,
  Printer,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import BottomSheet from "./BottomSheet";

type Plant = {
  name: string;
  sunlight: string[];
  colors: string[];
  image: string;
  plantsPerBlock: number;
  modelPath: string;
  specificColors?: string[];
};

type SharedState = {
  w: number;
  h: number;
  blocks: { [key: string]: string };
  sSun: string[];
  sCol: string[];
};

const sunlightOptions = ["Partial Sun", "Full Sun"] as const;
const colorOptions = [
  "Yellow",
  "Orange",
  "Red",
  "Pink",
  "Purple",
  "Blue",
  "Green",
  "Brown",
  "Grey",
  "Black",
] as const;

const PLANT_URLS: Record<string, string> = {
  Coreopsis: "https://localcolor.amsterdam/plant/coreopsis/",
  "Cosmos (pink)": "https://localcolor.amsterdam/plant/cosmos-bipinnatus/",
  "Cosmos (orange)": "https://localcolor.amsterdam/plant/sulfur-cosmos/",
  "Cosmos (red)": "https://localcolor.amsterdam/plant/chocolat-cosmos/",
  "Dyer's Chamomile": "https://localcolor.amsterdam/plant/dyers-chamomile/",
  Hollyhock: "https://localcolor.amsterdam/plant/hollyhock/",
  "Japanese Indigo": "https://localcolor.amsterdam/plant/japanese-indigo/",
  Madder: "https://localcolor.amsterdam/plant/madder/",
  Marigold: "https://localcolor.amsterdam/plant/marigold/",
  Safflower: "https://localcolor.amsterdam/plant/safflower/",
  Sawwort: "https://localcolor.amsterdam/plant/saw-wort/",
  Goldenrod: "https://localcolor.amsterdam/plant/solidago/",
  "St John's Wort": "https://localcolor.amsterdam/plant/st-johns-wort/",
  Tansy: "https://localcolor.amsterdam/plant/tansy/",
  Weld: "https://localcolor.amsterdam/plant/weld/",
  Woad: "https://localcolor.amsterdam/plant/woad/",
  Yarrow: "https://localcolor.amsterdam/plant/yarrow/",
};

const App: React.FC = () => {
  // ---------- core state ----------
  const [width, setWidth] = useState<number>(2);
  const [height, setHeight] = useState<number>(2);
  const [tempWidth, setTempWidth] = useState<string>("2");
  const [tempHeight, setTempHeight] = useState<string>("2");

  const [selectedSunlight, setSelectedSunlight] = useState<string[]>([]);
  const [selectedColors, setSelectedColors] = useState<string[]>([]);

  const [selectedBlocks, setSelectedBlocks] = useState<{ [key: string]: string }>({});
  const [plant, setPlant] = useState<string | null>(null);
  const [plants, setPlants] = useState<Plant[]>([]);
  const [eraseMode, setEraseMode] = useState(false);

  const [activeTab, setActiveTab] = useState<"filters" | "results">("filters");

  // Tooltip alleen op desktop
  const [tooltip, setTooltip] = useState<{ show: boolean; x: number; y: number; text: string }>({
    show: false,
    x: 0,
    y: 0,
    text: "",
  });

  const handleCellHoverIn = (plantName: string, e: PointerEvent) => {
    if (isMobile) return;
    setTooltip({ show: true, x: (e as any).clientX, y: (e as any).clientY, text: plantName });
  };
  const handleCellHoverMove = (e: PointerEvent) => {
    if (isMobile) return;
    setTooltip((t) => (t.show ? { ...t, x: (e as any).clientX, y: (e as any).clientY } : t));
  };
  const handleCellHoverOut = () => {
    if (isMobile) return;
    setTooltip((t) => ({ ...t, show: false }));
  };

  // share / qr
  const [copied, setCopied] = useState(false);
  const [showQr, setShowQr] = useState(false);

  // url restore gating
  const [restored, setRestored] = useState(false);

  // mobile detection
  const [isMobile, setIsMobile] = useState<boolean>(
    typeof window !== "undefined" ? window.matchMedia("(max-width: 900px)").matches : false
  );
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 900px)");
    const fn = () => setIsMobile(mq.matches);
    fn();
    mq.addEventListener?.("change", fn);
    return () => mq.removeEventListener?.("change", fn);
  }, []);

  // haptics
  const vibe = (ms = 15) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (navigator as any)?.vibrate?.(ms);
    } catch {}
  };

  // ---------- fetch plants ----------
  useEffect(() => {
    fetch("/assets/plants.json")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to fetch plant data");
        return r.json();
      })
      .then((data: Plant[]) => setPlants(data))
      .catch((e) => console.error(e));
  }, []);

  // ---------- filters ----------
  const handleSunlightSelection = (opt: string) =>
    setSelectedSunlight((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]));

  const handleColorSelection = (opt: string) =>
    setSelectedColors((prev) => (prev.includes(opt) ? prev.filter((v) => v !== opt) : [...prev, opt]));

  const filteredPlants = useMemo(() => {
    return plants.filter((p) => {
      const sunOk = selectedSunlight.length === 0 || selectedSunlight.some((s) => p.sunlight.includes(s));
      const colOk = selectedColors.length === 0 || selectedColors.some((c) => p.colors.includes(c));
      return sunOk && colOk;
    });
  }, [plants, selectedSunlight, selectedColors]);

  // ---------- garden size inputs ----------
  const handleWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTempWidth(v);
    if (v !== "") setWidth(Math.max(1, parseInt(v, 10) || 1));
  };
  const handleHeightChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setTempHeight(v);
    if (v !== "") setHeight(Math.max(1, parseInt(v, 10) || 1));
  };
  const handleBlurWidth = () => tempWidth === "" && setTempWidth(String(width));
  const handleBlurHeight = () => tempHeight === "" && setTempHeight(String(height));

  // ---------- placing / erasing ----------
  const handlePlantSelection = (pname: string) => {
    setEraseMode(false);
    setPlant((prev) => (prev === pname ? null : pname));
  };

  const handleBlockClick = (pos: [number, number, number]) => {
    const key = pos.join(",");

    setSelectedBlocks((prev) => {
      const next = { ...prev };

      if (eraseMode) {
        if (next[key]) {
          delete next[key];
          vibe(12);
        }
        return next;
      }

      if (plant) {
        next[key] = plant;
        vibe(12);
      }

      return next;
    });
  };

  // verwijder planten buiten nieuwe grid
  useEffect(() => {
    setSelectedBlocks((prev) => {
      const next: { [key: string]: string } = {};
      for (const k of Object.keys(prev)) {
        const [xStr, _yStr, zStr] = k.split(",");
        const x = Number(xStr);
        const z = Number(zStr);
        if (x < width && z < height) next[k] = prev[k];
      }
      return next;
    });
  }, [width, height]);

  // ---------- results ----------
  const plantSummary = useMemo(() => {
    const sum: { [key: string]: { count: number } } = {};
    Object.values(selectedBlocks).forEach((plantName) => {
      const info = plants.find((p) => p.name === plantName);
      if (info) {
        if (!sum[plantName]) sum[plantName] = { count: 0 };
        sum[plantName].count += info.plantsPerBlock;
      }
    });
    return sum;
  }, [selectedBlocks, plants]);

  // ---------- share url ----------
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

  const copyShareURL = async () => {
    const url = buildShareURL();
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error("Clipboard write failed", e);
      window.prompt("Copy this URL:", url);
    }
  };

  // Verplaatst bovenaan bij je andere const-variabelen in App.tsx:
  const resultsPanel = (opts: { showTitle: boolean; includeShare: boolean }) => {
    const { showTitle, includeShare } = opts;

    return (
      <>
        {showTitle && <h2 style={{ fontSize: "2em", margin: 0 }}>Results</h2>}

        {Object.entries(plantSummary).length > 0 ? (
          <>
            {Object.entries(plantSummary).map(([plantName, data]) => {
              const plantInfo = plants.find((p) => p.name === plantName);
              const specific: string[] = plantInfo?.specificColors ?? [];
              const infoUrl = PLANT_URLS[plantName];

              return (
                <div
                  key={plantName}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "3.5fr 1fr 3fr 2.5fr", // Name | Amount | Dye | More
                    gap: "0.75em",
                    alignItems: "start",
                    textAlign: "left",
                    padding: "1em",
                    backgroundColor: "#eee",
                    borderRadius: 8,
                    margin: "1em 0",
                  }}
                >
                  {/* Name */}
                  <div style={{ minWidth: 0 }}>
                    <p style={{ margin: "0 0 2px 0", fontSize: 12 }}>Name</p>
                    <h4
                      style={{
                        margin: 0,
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        wordBreak: "break-word",
                        hyphens: "auto",
                      }}
                      title={plantName}
                    >
                      {plantName}
                    </h4>
                  </div>

                  {/* Amount */}
                  <div>
                    <p style={{ margin: "0 0 2px 0", fontSize: 12 }}>Amount</p>
                    <h4 style={{ margin: 0 }}>{data.count}</h4>
                  </div>

                  {/* Dye color */}
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 12 }}>Dye color</p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {specific.length > 0 ? (
                        specific.map((hex) => (
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
                              flex: "0 0 auto"
                            }}
                          />
                        ))
                      ) : (
                        <span style={{ fontSize: 12, color: "#666" }}>—</span>
                      )}
                    </div>
                  </div>

                  {/* More info */}
                  <div>
                    <p style={{ margin: "0 0 4px 0", fontSize: 12 }}>More info</p>
                    {infoUrl ? (
                      <a
                        href={infoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "flex-start",
                          width: 20,
                          height: 20,
                          textDecoration: "none",
                        }}
                      >
                        <SquareArrowOutUpRight size={20} color="#000" />
                      </a>
                    ) : (
                      <span style={{ fontSize: 12, color: "#666" }}>—</span>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        ) : (
          <p style={{ fontSize: 14, color: "#666" }}>Place plants on your garden to see results.</p>
        )}

        {/* Share (alleen meenemen als includeShare = true, dus op mobiel) */}
        {includeShare && (
          <div style={{ borderTop: "1px solid #E8E8E8", padding: "1em 0 2em 0", margin: "1em 0" }}>
            <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
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
              Copy the link, scan the QR-code or print your garden using the buttons below.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5em", textAlign: "center" }}>
              <div
                onClick={copyShareURL}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? copyShareURL() : null)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}
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
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}
              >
                <QrCode size={28} color="#000" />
                <span style={{ fontSize: 12 }}>Scan QR-code</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}>
                <Printer size={28} color="#000" />
                <span style={{ fontSize: 12 }}>Print</span>
              </div>
            </div>
          </div>
        )}
      </>
    );
  };

  // ---------- restore / persist hash ----------
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
    setTempWidth(String(width));
    setTempHeight(String(height));
    setRestored(true);
  }, []);

  useEffect(() => {
    if (!restored) return;
    const encoded = encodeURIComponent(
      JSON.stringify({
        w: width,
        h: height,
        blocks: selectedBlocks,
        sSun: selectedSunlight,
        sCol: selectedColors,
      } as SharedState)
    );
    history.replaceState(null, "", `${window.location.pathname}#state=${encoded}`);
  }, [restored, width, height, selectedBlocks, selectedSunlight, selectedColors]);

  // ---------- layout ----------
  const leftPanel = (
    <>
      <h2 style={{ fontSize: "2em", fontWeight: 700, margin: 0 }}>Design your dye garden</h2>
      <p style={{ fontSize: 14, color: "#666" }}>
        Set up your garden and preferences below. Use filters to find suitable plants, select them and click on a grid
        cell in the garden to place them.
      </p>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Garden area */}
      <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
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
          <Grid size={20} color="#fff" />
        </span>
        Garden area
      </h3>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>Select the size of your garden area in m².</p>

      <div style={{ display: "flex", flexDirection: "column", gap: ".5em", width: "100%" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <label style={{ flex: ".5" }}>Width:</label>
          <input
            type="number"
            min="1"
            value={tempWidth}
            onChange={handleWidthChange}
            onBlur={handleBlurWidth}
            style={{ background: "transparent", border: "1px solid #aaa", height: "2em", flex: "2", padding: "0 0.5em", borderRadius: 4 }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "0.5em" }}>
          <label style={{ flex: ".5" }}>Length:</label>
          <input
            type="number"
            min="1"
            value={tempHeight}
            onChange={handleHeightChange}
            onBlur={handleBlurHeight}
            style={{ background: "transparent", border: "1px solid #aaa", height: "2em", flex: "2", padding: "0 0.5em", borderRadius: 4 }}
          />
        </div>
      </div>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Sunlight */}
      <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
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
          <CloudSun size={20} color="#fff" />
        </span>
        Sunlight
      </h3>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>Select one or more sunlight conditions for your garden.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: "0.5em" }}>
        {sunlightOptions.map((opt) => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5em", cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={selectedSunlight.includes(opt)}
              onChange={() => handleSunlightSelection(opt)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f73900" }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Colors */}
      <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
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
          <PaintBucket size={20} color="#fff" />
        </span>
        Dye color
      </h3>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>Select one or multiple dye colors you want your plant(s) to produce.</p>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5em 1.5em" }}>
        {colorOptions.map((opt) => (
          <label key={opt} style={{ display: "flex", alignItems: "center", gap: "0.5em", cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedColors.includes(opt)}
              onChange={() => handleColorSelection(opt)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f73900" }}
            />
            <span>{opt}</span>
          </label>
        ))}
      </div>
    </>
  );

  const plantsGrid = (
    <>
      <h3 style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: '1em 0' }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: "0.5em", fontWeight: 600 }}>
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
          }}
        />
      </h3>
      <p style={{ fontSize: 14, color: "#666", margin: "0 0 16px" }}>
        Tap a plant to select it. Then tap a grid cell to place it. Use the eraser to remove plants.
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
                cursor: "pointer",
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
              <span style={{ fontSize: "0.95em", textAlign: "center" }}>{name}</span>
            </div>
          );
        })}
      </div>
    </>
  );

  return (
    <div style={{ display: "flex", flexDirection: "row", height: "100vh", width: "100vw", backgroundColor: "#fff" }}>
      {/* LEFT (desktop) */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "24em",
            height: "100vh",
            backgroundColor: "#fff",
            padding: "1em",
            boxSizing: "border-box",
            color: "#000",
            boxShadow: "0px 4px 10px rgba(0,0,0,0.5)",
            zIndex: 1,
            overflow: "auto",
          }}
        >
          {leftPanel}
          <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />
          {plantsGrid}
        </div>
      )}

      {/* CANVAS */}
      <div
        style={{
          width: "100vw",
          height: "100vh",
          backgroundColor: '#fff',
          backgroundSize: "cover",
          backgroundPosition: "center",
          cursor: eraseMode ? "url(/cursor/eraser.png) 16 16, pointer" : "default",
        }}
      >
        <Canvas style={{ width: "100%", height: "100%" }} camera={{ position: [width * 2, Math.max(width, height) * 2, height * 2], fov: 50 }}>
          <ambientLight intensity={0.5} />
          <directionalLight position={[10, 10, 10]} intensity={1} />
          <OrbitControls
            target={[width / 2 - 0.5, 0, height / 2 - 0.5]}
            enablePan={!isMobile}
            enableZoom
            enableRotate
          />
          {Array.from({ length: height }).map((_, r) =>
            Array.from({ length: width }).map((_, c) => (
              <Block
                key={`${r}-${c}`}
                position={[c, 0, r]}
                selectedPlant={selectedBlocks[`${c},0,${r}`] || null}
                onBlockClick={handleBlockClick}
                plantsData={plants}
                enableHover={!isMobile}
                onHoverIn={handleCellHoverIn}
                onHoverMove={handleCellHoverMove}
                onHoverOut={handleCellHoverOut}
              />
            ))
          )}
        </Canvas>

        {!isMobile && tooltip.show && (
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

        {/* Logos + header copy */}
        {isMobile ? (
          <div
            style={{
              position: "absolute",
              top: "1em",
              left: "50%",
              width: '100%',
              padding: '0 1em',
              transform: "translateX(-50%)",
              textAlign: "center",
              zIndex: 2,
              pointerEvents: "none",
            }}
          >
            <img
              src={localcolorFuturelab}
              style={{ height: "3em", marginBottom: "2em" }}
            />
            <div style={{ pointerEvents: "auto" }}>
              <h2 style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px 0' }}>
                Design your dye garden
              </h2>
              <p style={{ fontSize: 14, color: "#666", margin: 0 }}>
                Set up your garden. Use filters to find suitable plants, select them and click on a grid cell to place them.
              </p>
            </div>
          </div>
        ) : (
          <>
            <img
              src={waag}
              alt="Waag Futurlab"
              style={{
                position: "absolute",
                top: "1em",
                left: "50%",
                transform: "translateX(-50%)",
                height: "4em",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
            <img
              src={localcolor}
              alt="Local Color"
              style={{
                position: "absolute",
                bottom: "1em",
                left: "50%",
                transform: "translateX(-50%)",
                height: "6em",
                pointerEvents: "none",
                zIndex: 2,
              }}
            />
          </>
        )}
      </div>

      {/* RIGHT (desktop results) */}
      {!isMobile && (
        <div
          style={{
            position: "fixed",
            top: 0,
            right: 0,
            width: "24em",
            height: "100vh",
            color: "#000",
            backgroundColor: "#fff",
            padding: "1em",
            boxShadow: "0px 0px 10px rgba(0,0,0,0.5)",
            zIndex: 1,

            // make it a 2-row grid: [scrollable results] + [footer]
            display: "grid",
            gridTemplateRows: "1fr auto",
            rowGap: "1em",
          }}
        >
          {/* Scrollable results area */}
          <div style={{ overflowY: "auto", padding: "0 8px 0 0" }}>
            {resultsPanel({ showTitle: true, includeShare: false })}
          </div>

          {/* Footer stays visible and doesn’t overlap scrollbar */}
          <div style={{ paddingBottom: "2em", borderTop: "1px solid #E8E8E8", background: "#fff" }}>
            <h3 style={{ fontWeight: 600, display: "flex", alignItems: "center", gap: "0.5em" }}>
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
            <p style={{ fontSize: 14, color: "#666", marginBottom: "2em" }}>
              Copy the link, scan the QR-code or print your garden using the buttons below.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5em", textAlign: "center" }}>
              <div
                onClick={copyShareURL}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? copyShareURL() : null)}
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}
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
                style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}
              >
                <QrCode size={28} color="#000" />
                <span style={{ fontSize: 12 }}>Scan QR-code</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.25em", cursor: "pointer" }}>
                <Printer size={28} color="#000" />
                <span style={{ fontSize: 12 }}>Print</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* QR overlay */}
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
              borderRadius: 12,
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

      {isMobile && (
        <BottomSheet
          // tabs
          activeTab={activeTab}
          onTabChange={setActiveTab}

          // minHeight={0}
          // maxHeight={0.9}
          // initialHeight={0.3}

          // plants + selectie
          plants={plants}
          filteredPlantNames={filteredPlants.map(p => p.name)}
          selectedPlant={plant}
          onSelectPlant={(name) => { setEraseMode(false); setPlant(prev => prev === name ? null : name); }}
          eraseMode={eraseMode}
          onToggleErase={() => { setEraseMode(v => !v); setPlant(null); }}

          // garden area inputs
          tempWidth={tempWidth}
          tempHeight={tempHeight}
          onChangeWidth={handleWidthChange}
          onChangeHeight={handleHeightChange}
          onBlurWidth={handleBlurWidth}
          onBlurHeight={handleBlurHeight}

          // sunlight
          sunlightOptions={sunlightOptions as unknown as string[]}
          selectedSunlight={selectedSunlight}
          onToggleSunlight={handleSunlightSelection}

          // colors
          colorOptions={colorOptions as unknown as string[]}
          selectedColors={selectedColors}
          onToggleColor={handleColorSelection}

          // results
          plantSummary={plantSummary}
          getSpecificColors={(name) => plants.find(p => p.name === name)?.specificColors ?? []}
          getInfoUrl={(name) => PLANT_URLS[name]}

          // share acties
          copied={copied}
          onCopy={copyShareURL}
          onShowQr={() => setShowQr(true)}
          onPrint={() => window.print()}
        />
      )}
    </div>
  );
};

export default App;