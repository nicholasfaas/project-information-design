import React, { useEffect, useRef, useState } from "react";
import {
  Sprout,
  Grid,
  CloudSun,
  PaintBucket,
  Eraser,
  Share,
  Clipboard,
  ClipboardCheck,
  QrCode,
  Printer,
  SquareArrowOutUpRight,
} from "lucide-react";

type TabKey = "filters" | "results";

interface BottomSheetProps {
  activeTab: TabKey;
  onTabChange: (tab: TabKey) => void;

  /** Drag config (vh fractions) */
  minHeight?: number;      // default 0.3
  maxHeight?: number;      // default 0.9  (90%)
  initialHeight?: number;  // default 0.3

  /** Plants */
  plants: Array<{ name: string; image: string }>;
  filteredPlantNames: string[];
  selectedPlant: string | null;
  onSelectPlant: (name: string) => void;
  eraseMode: boolean;
  onToggleErase: () => void;

  /** Garden area inputs */
  tempWidth: string;
  tempHeight: string;
  onChangeWidth: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onChangeHeight: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlurWidth: () => void;
  onBlurHeight: () => void;

  /** Sunlight filter */
  sunlightOptions: string[];
  selectedSunlight: string[];
  onToggleSunlight: (option: string) => void;

  /** Color filter */
  colorOptions: string[];
  selectedColors: string[];
  onToggleColor: (option: string) => void;

  /** Results */
  plantSummary: Record<string, { count: number }>;
  getSpecificColors: (plantName: string) => string[];
  getInfoUrl: (plantName: string) => string | undefined;

  /** Share actions */
  copied: boolean;
  onCopy: () => void;
  onShowQr: () => void;
  onPrint?: () => void;
}

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

const BottomSheet: React.FC<BottomSheetProps> = ({
  activeTab,
  onTabChange,
  minHeight = 0.05,
  maxHeight = 0.9,          // 90% open
  initialHeight = 0.3,      // 30% half-open

  plants,
  filteredPlantNames,
  selectedPlant,
  onSelectPlant,
  eraseMode,
  onToggleErase,

  tempWidth,
  tempHeight,
  onChangeWidth,
  onChangeHeight,
  onBlurWidth,
  onBlurHeight,

  sunlightOptions,
  selectedSunlight,
  onToggleSunlight,

  colorOptions,
  selectedColors,
  onToggleColor,

  plantSummary,
  getSpecificColors,
  getInfoUrl,

  copied,
  onCopy,
  onShowQr,
  onPrint,
}) => {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const startY = useRef(0);
  const startHeight = useRef(initialHeight);
  const [height, setHeight] = useState<number>(minHeight);
  const [dragging, setDragging] = useState(false);
  const didDrag = useRef(false);  // nieuw
  const EPS = 0.005;              // nieuw

  useEffect(() => {
    if (!sheetRef.current) return;
    sheetRef.current.style.height = `${height * 100}vh`;
  }, [height]);

  // drag
  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    setDragging(true);
    didDrag.current = false; // reset bij begin drag/tap
    (e.target as HTMLDivElement).setPointerCapture(e.pointerId);
    startY.current = e.clientY;
    startHeight.current = height;
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragging) return;
    const deltaY = e.clientY - startY.current;
    if (Math.abs(deltaY) > 4) didDrag.current = true; // markeer als echte drag
    const deltaVH = deltaY / window.innerHeight;
    const next = clamp(startHeight.current - deltaVH, minHeight, maxHeight);
    setHeight(next);
  };

  const onPointerUp = () => {
    if (!dragging) return;
    setDragging(false);

    // Snap naar dichtstbijzijnde punt: min, half (initialHeight) of max
    setHeight((h) => {
      const points = [minHeight, initialHeight, maxHeight];
      let nearest = points[0];
      let best = Math.abs(h - points[0]);

      for (let i = 1; i < points.length; i++) {
        const d = Math.abs(h - points[i]);
        if (d < best) {
          best = d;
          nearest = points[i];
        }
      }
      return nearest;
    });
  };

  const renderFiltersTab = () => (
    <div className="sheet__content">


      {/* Garden Area */}
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em", margin: '12px 0' }}>
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
      <p style={{ fontSize: 16, color: "#666", marginBottom: '12px' }}>
        Select the size of your garden area in m².
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 16 }}>Width</span>
          <input
            type="number"
            min={1}
            value={tempWidth}
            onChange={onChangeWidth}
            onBlur={onBlurWidth}
            style={{
              background: "transparent",
              border: "1px solid #aaa",
              color: "#000",
              height: "2.4em",
              padding: "0 0.6em",
              borderRadius: 6,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 4 }}>
          <span style={{ fontSize: 16 }}>Length</span>
          <input
            type="number"
            min={1}
            value={tempHeight}
            onChange={onChangeHeight}
            onBlur={onBlurHeight}
            style={{
              background: "transparent",
              border: "1px solid #aaa",
              color: "#000",
              height: "2.4em",
              padding: "0 0.6em",
              borderRadius: 6,
            }}
          />
        </label>
      </div>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Sunlight */}
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em", margin: '12px 0' }}>
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
      <p style={{ fontSize: 14, color: "#666", marginBottom: '12px' }}>
        Select one or more sunlight conditions in your garden.
      </p>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {sunlightOptions.map((option) => (
          <label key={option} className="filter-row" style={{ cursor: "pointer", userSelect: "none" }}>
            <input
              type="checkbox"
              checked={selectedSunlight.includes(option)}
              onChange={() => onToggleSunlight(option)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f73900" }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Dye color */}
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em", margin: '12px 0' }}>
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
      <p style={{ fontSize: 14, color: "#666", marginBottom: '12px' }}>
        Select one or multiple dye colors you want your plant(s) to produce.
      </p>
      <div className="filter-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {colorOptions.map((option) => (
          <label key={option} className="filter-row" style={{ cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={selectedColors.includes(option)}
              onChange={() => onToggleColor(option)}
              style={{ width: 16, height: 16, cursor: "pointer", accentColor: "#f73900" }}
            />
            <span>{option}</span>
          </label>
        ))}
      </div>

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Plants */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", margin: '12px 0' }}>
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
          <h3 style={{ margin: 0 }}>Plants</h3>
        </span>

        <Eraser
          size={20}
          color={eraseMode ? "#f73900" : "#000"}
          style={{ cursor: "pointer" }}
          onClick={onToggleErase}
        />
      </div>
      <p style={{ fontSize: 14, color: "#666", marginBottom: '12px' }}>
        Tap a plant to select it. Then tap a grid cell to place it. Use the eraser to remove plants.
      </p>

      {/* 3 kolommen */}
      <div
        className="plants-grid"
        style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1em" }}
      >
        {plants.map(({ name, image }) => {
          const isVisible = filteredPlantNames.includes(name);
          const isSelected = selectedPlant === name;
          if (!isVisible) return null;

          return (
            <div
              key={name}
              className={`plant-card ${isSelected ? "plant-card--selected" : ""}`}
              onClick={() => onSelectPlant(name)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? onSelectPlant(name) : null)}
            >
              <img src={image} alt={name} />
              <span style={{ fontSize: 16, color: '#000'}}>{name}</span>
            </div>
          );
        })}
      </div>

    </div>
  );

  const renderResultsTab = () => (
    <div className="sheet__content">
      {Object.entries(plantSummary).length === 0 ? (
        <p style={{ fontSize: 14, color: "#666" }}>Place plants on your garden to see results.</p>
      ) : (
        <>
          {Object.entries(plantSummary).map(([plantName, data]) => {
            const specific = getSpecificColors(plantName) || [];
            const infoUrl = getInfoUrl(plantName);

            return (
              <div key={plantName} className="result-card">
                <div className="result-col" style={{ flex: 3, marginRight: 8, minWidth: 0 }}>
                  <p>Name</p>
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
                <div className="result-col" style={{ flex: 1, margin: "0 8px" }}>
                  <p>Amount</p>
                  <h4 style={{ margin: 0 }}>{data.count}</h4>
                </div>
                <div className="result-col" style={{ flex: 3, margin: "0 8px" }}>
                  <p>Dye color</p>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {specific.length > 0 ? (
                      specific.map((hex) => (
                        <span key={hex} className="color-swatch" title={hex} style={{ backgroundColor: hex }} />
                      ))
                    ) : (
                      <span style={{ fontSize: 12, color: "#666" }}>—</span>
                    )}
                  </div>
                </div>
                <div className="result-col" style={{ flex: 2, marginLeft: 8 }}>
                  <p>More info</p>
                  {infoUrl ? (
                    <a
                      href={infoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: "inline-flex", width: 20, height: 20, textDecoration: "none" }}
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
      )}

      <div style={{ height: 1, background: "#E8E8E8", borderRadius: 1, margin: "2em 0" }} />

      {/* Share footer */}
      <h3 style={{ display: "flex", alignItems: "center", gap: "0.5em", margin: '16px 0' }}>
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
        Copy the link, scan the QR-code or print your garden using the options below.
      </p>

      <div className="share-grid">
        <div
          className="share-action"
          onClick={onCopy}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? onCopy() : null)}
        >
          {copied ? <ClipboardCheck size={28} color="#000" /> : <Clipboard size={28} color="#000" />}
          <span style={{ fontSize: 12 }}>{copied ? "Copied" : "Copy link"}</span>
        </div>

        <div
          className="share-action"
          onClick={onShowQr}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? onShowQr() : null)}
        >
          <QrCode size={28} color="#000" />
          <span style={{ fontSize: 12 }}>Scan QR-code</span>
        </div>

        <div
          className="share-action"
          onClick={() => onPrint?.()}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === "Enter" || e.key === " " ? onPrint?.() : null)}
        >
          <Printer size={28} color="#000" />
          <span style={{ fontSize: 12 }}>Print</span>
        </div>
      </div>
    </div>
  );

  // rood voor active tab
  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    flex: 1,
    padding: "10px 12px",
    borderRadius: 20,
    border: active ? "none" : "1px solid #ddd",
    background: active ? "#f73900" : "#fff",
    color: active ? "#fff" : "#000",
    fontFamily: "'Montserrat', sans-serif",
    fontWeight: 600,
    cursor: "pointer",
  });

  return (
    <div
      ref={sheetRef}
      className="sheet"
      style={{
        height: `${initialHeight * 100}vh`,
        transition: dragging ? "none" : "height .2s ease-in-out",
      }}
    >
      {/* Drag handle */}
      <div
        className="sheet__dragzone"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
      >
        <div className="sheet__handle" />
      </div>

      {height > minHeight + EPS && (
        <>
          {/* Tabs */}
          <div className="sheet__tabs">
            <button
              style={tabBtnStyle(activeTab === "filters")}
              onClick={() => onTabChange("filters")}
            >
              Filters
            </button>
            <button
              style={tabBtnStyle(activeTab === "results")}
              onClick={() => onTabChange("results")}
            >
              Results
            </button>
          </div>

          {/* Content */}
          {activeTab === "filters" ? renderFiltersTab() : renderResultsTab()}
        </>
      )}
    </div>
  );
};

export default BottomSheet;
