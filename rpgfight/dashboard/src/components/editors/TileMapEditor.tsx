"use client";

import { useState, useEffect, useRef, useCallback } from "react";

const COLS = 32;
const ROWS = 18;

interface TileTypeDef {
  code: number;
  name: string;
  color: string;
}

interface Props {
  stageId: number;
  tileMap: number[][];
  onSave: () => void;
}

export default function TileMapEditor({ stageId, tileMap, onSave }: Props) {
  const [grid, setGrid] = useState<number[][]>(tileMap);
  const [tileTypes, setTileTypes] = useState<TileTypeDef[]>([]);
  const [selectedTile, setSelectedTile] = useState(0);
  const [saving, setSaving] = useState(false);
  const [isPainting, setIsPainting] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    fetch("/api/tile-types").then((r) => r.json()).then(setTileTypes);
  }, []);

  const colorMap = useCallback(() => {
    const map: Record<number, string> = {};
    for (const t of tileTypes) {
      map[t.code] = t.color;
    }
    return map;
  }, [tileTypes]);

  const drawGrid = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || tileTypes.length === 0) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const cellW = canvas.width / COLS;
    const cellH = canvas.height / ROWS;
    const colors = colorMap();

    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const code = grid[r]?.[c] ?? 0;
        ctx.fillStyle = colors[code] || "#1a1a2e";
        ctx.fillRect(c * cellW, r * cellH, cellW, cellH);
        ctx.strokeStyle = "#333";
        ctx.strokeRect(c * cellW, r * cellH, cellW, cellH);
      }
    }
  }, [grid, tileTypes, colorMap]);

  useEffect(() => {
    drawGrid();
  }, [drawGrid]);

  function getCellFromEvent(e: React.MouseEvent<HTMLCanvasElement>) {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const col = Math.floor((x / rect.width) * COLS);
    const row = Math.floor((y / rect.height) * ROWS);
    if (row >= 0 && row < ROWS && col >= 0 && col < COLS) return { row, col };
    return null;
  }

  function paintCell(row: number, col: number) {
    setGrid((prev) => {
      const newGrid = prev.map((r) => [...r]);
      newGrid[row][col] = selectedTile;
      return newGrid;
    });
  }

  function handleMouseDown(e: React.MouseEvent<HTMLCanvasElement>) {
    setIsPainting(true);
    const cell = getCellFromEvent(e);
    if (cell) paintCell(cell.row, cell.col);
  }

  function handleMouseMove(e: React.MouseEvent<HTMLCanvasElement>) {
    if (!isPainting) return;
    const cell = getCellFromEvent(e);
    if (cell) paintCell(cell.row, cell.col);
  }

  function handleMouseUp() {
    setIsPainting(false);
  }

  async function handleSave() {
    setSaving(true);
    const res = await fetch(`/api/stages/${stageId}/tilemap`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tileMap: grid }),
    });
    if (res.ok) onSave();
    else alert("Failed to save tile map");
    setSaving(false);
  }

  return (
    <div>
      <div className="flex gap-4 mb-4">
        <div className="flex gap-1 flex-wrap">
          {tileTypes.map((t) => (
            <button
              key={t.code}
              onClick={() => setSelectedTile(t.code)}
              className={`px-3 py-1.5 rounded text-xs font-medium transition-colors ${
                selectedTile === t.code
                  ? "ring-2 ring-amber-400 text-white"
                  : "text-gray-400 hover:text-gray-200"
              }`}
              style={{ backgroundColor: t.color + "40", borderColor: t.color }}
              title={t.name}
            >
              {t.code}: {t.name}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 inline-block">
        <canvas
          ref={canvasRef}
          width={960}
          height={540}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          className="cursor-crosshair rounded"
          style={{ imageRendering: "pixelated" }}
        />
      </div>

      <div className="mt-4">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-gray-900 font-semibold rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save Tile Map"}
        </button>
      </div>
    </div>
  );
}
