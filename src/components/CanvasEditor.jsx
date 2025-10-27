import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Image as KonvaImage, Text, Rect, Circle, Line } from "react-konva";
import Konva from "konva";

export default function CanvasEditor({ image, setImage }) {
  const [konvaImage, setKonvaImage] = useState(null);
  const [brightness, setBrightness] = useState(0);
  const [contrast, setContrast] = useState(0);
  const [grayscale, setGrayscale] = useState(false);
  const [blur, setBlur] = useState(0);
  const [sharpen, setSharpen] = useState(0);
  const [invert, setInvert] = useState(false);
  
  // Shape drawing states
  const [shapes, setShapes] = useState([]);
  const [selectedTool, setSelectedTool] = useState('none'); // 'rectangle', 'circle', 'line', 'none'
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentShape, setCurrentShape] = useState(null);
  
  const stageRef = useRef();
  const imageRef = useRef();

  // Load uploaded image
  useEffect(() => {
    const img = new window.Image();
    img.src = image;
    img.crossOrigin = "anonymous"; // required for filters
    img.onload = () => setKonvaImage(img);
  }, [image]);

  // Apply filters whenever sliders change
  useEffect(() => {
    if (!imageRef.current) return;

    // Clear previous cache to reset filters
    imageRef.current.clearCache();
    
    const filters = [];
    
    // Add brightness filter
    if (brightness !== 0) {
      filters.push(Konva.Filters.Brighten);
    }
    
    // Add contrast filter
    if (contrast !== 0) {
      filters.push(Konva.Filters.Contrast);
    }
    
    // Add grayscale filter
    if (grayscale) {
      filters.push(Konva.Filters.Grayscale);
    }
    
    // Add blur filter
    if (blur > 0) {
      filters.push(Konva.Filters.Blur);
    }
    
    // Add sharpen filter (using Enhance filter for sharpening)
    if (sharpen > 0) {
      filters.push(Konva.Filters.Enhance);
    }
    
    // Add invert filter
    if (invert) {
      filters.push(Konva.Filters.Invert);
    }

    // Apply all filters
    imageRef.current.filters(filters);
    
    // Set filter property values
    imageRef.current.brightness(brightness);
    imageRef.current.contrast(contrast);
    imageRef.current.blurRadius(blur);
    imageRef.current.enhance(sharpen);
    
    // Cache and redraw to apply filters
    if (filters.length > 0) {
      imageRef.current.cache();
    }
    
    imageRef.current.getLayer().batchDraw();
  }, [brightness, contrast, grayscale, blur, sharpen, invert]);

  const addText = () => {
    const layer = stageRef.current.getLayers()[0];
    const text = new Text({
      text: "New Text",
      x: 50,
      y: 50,
      fontSize: 24,
      fill: "white",
      draggable: true,
    });
    layer.add(text);
    layer.draw();
  };

  // Shape drawing functions
  const handleMouseDown = (e) => {
    if (selectedTool === 'none') return;
    
    setIsDrawing(true);
    const pos = e.target.getStage().getPointerPosition();
    const id = Date.now().toString();
    
    let newShape;
    
    switch (selectedTool) {
      case 'rectangle':
        newShape = {
          id,
          type: 'rectangle',
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          fill: 'transparent',
          stroke: '#ff6b6b',
          strokeWidth: 2,
        };
        break;
      case 'circle':
        newShape = {
          id,
          type: 'circle',
          x: pos.x,
          y: pos.y,
          radius: 0,
          fill: 'transparent',
          stroke: '#4ecdc4',
          strokeWidth: 2,
        };
        break;
      case 'line':
        newShape = {
          id,
          type: 'line',
          points: [pos.x, pos.y, pos.x, pos.y],
          stroke: '#45b7d1',
          strokeWidth: 3,
        };
        break;
      default:
        return;
    }
    
    setCurrentShape(newShape);
    setShapes([...shapes, newShape]);
  };

  const handleMouseMove = (e) => {
    if (!isDrawing || !currentShape) return;
    
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    
    const updatedShapes = shapes.map(shape => {
      if (shape.id === currentShape.id) {
        switch (shape.type) {
          case 'rectangle':
            return {
              ...shape,
              width: point.x - shape.x,
              height: point.y - shape.y,
            };
          case 'circle':
            const radius = Math.sqrt(
              Math.pow(point.x - shape.x, 2) + Math.pow(point.y - shape.y, 2)
            );
            return {
              ...shape,
              radius,
            };
          case 'line':
            return {
              ...shape,
              points: [shape.points[0], shape.points[1], point.x, point.y],
            };
          default:
            return shape;
        }
      }
      return shape;
    });
    
    setShapes(updatedShapes);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setCurrentShape(null);
  };

  const clearShapes = () => {
    setShapes([]);
  };

  const downloadImage = () => {
    const uri = stageRef.current.toDataURL({ pixelRatio: 2 });
    const a = document.createElement("a");
    a.href = uri;
    a.download = "edited-image.png";
    a.click();
  };

  // Reset all filters to default values
  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setGrayscale(false);
    setBlur(0);
    setSharpen(0);
    setInvert(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Stage 
        width={600} 
        height={400} 
        ref={stageRef} 
        className="border"
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
      >
        <Layer>
          {konvaImage && (
            <KonvaImage
              image={konvaImage}
              ref={imageRef}
              width={600}
              height={400}
            />
          )}
          
          {/* Render shapes */}
          {shapes.map((shape) => {
            if (shape.type === 'rectangle') {
              return (
                <Rect
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  width={shape.width}
                  height={shape.height}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  draggable
                />
              );
            } else if (shape.type === 'circle') {
              return (
                <Circle
                  key={shape.id}
                  x={shape.x}
                  y={shape.y}
                  radius={shape.radius}
                  fill={shape.fill}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  draggable
                />
              );
            } else if (shape.type === 'line') {
              return (
                <Line
                  key={shape.id}
                  points={shape.points}
                  stroke={shape.stroke}
                  strokeWidth={shape.strokeWidth}
                  draggable
                />
              );
            }
            return null;
          })}
        </Layer>
      </Stage>

      {/* Filters */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <label className="flex justify-between items-center">
          Brightness: <span>{brightness.toFixed(2)}</span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={brightness}
            onChange={(e) => setBrightness(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Contrast: <span>{contrast.toFixed(2)}</span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={contrast}
            onChange={(e) => setContrast(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Grayscale:
          <input
            type="checkbox"
            checked={grayscale}
            onChange={(e) => setGrayscale(e.target.checked)}
            className="ml-2"
          />
        </label>

        <label className="flex justify-between items-center">
          Blur: <span>{blur.toFixed(1)}</span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={blur}
            onChange={(e) => setBlur(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Sharpen: <span>{sharpen.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sharpen}
            onChange={(e) => setSharpen(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Invert:
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => setInvert(e.target.checked)}
            className="ml-2"
          />
        </label>
      </div>

      {/* Shape Tools */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <h3 className="text-lg font-semibold text-center">Shape Tools</h3>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setSelectedTool('rectangle')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'rectangle'
                ? 'bg-red-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            📐 Rectangle
          </button>
          
          <button
            onClick={() => setSelectedTool('circle')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'circle'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ⭕ Circle
          </button>
          
          <button
            onClick={() => setSelectedTool('line')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            📏 Line
          </button>
          
          <button
            onClick={() => setSelectedTool('none')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'none'
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ✋ Select
          </button>
        </div>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={clearShapes}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition text-white"
          >
            🗑️ Clear Shapes
          </button>
          
          <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
            Shapes: {shapes.length}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={addText}
          className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Text
        </button>
        <button
          onClick={downloadImage}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Download
        </button>
        <button
          onClick={resetFilters}
          className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          Reset Filters
        </button>
        <button
          onClick={() => setImage(null)}
          className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Upload Another
        </button>
      </div>
    </div>
  );
}

  // Reset all filters to default values
  const resetFilters = () => {
    setBrightness(0);
    setContrast(0);
    setGrayscale(false);
    setBlur(0);
    setSharpen(0);
    setInvert(false);
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Stage width={600} height={400} ref={stageRef} className="border">
        <Layer>
          {konvaImage && (
            <KonvaImage
              image={konvaImage}
              ref={imageRef}
              width={600}
              height={400}
            />
          )}
        </Layer>
      </Stage>

      {/* Filters */}
      <div className="flex flex-col gap-2 w-full max-w-md">
        <label className="flex justify-between items-center">
          Brightness: <span>{brightness.toFixed(2)}</span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={brightness}
            onChange={(e) => setBrightness(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Contrast: <span>{contrast.toFixed(2)}</span>
          <input
            type="range"
            min={-1}
            max={1}
            step={0.01}
            value={contrast}
            onChange={(e) => setContrast(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Grayscale:
          <input
            type="checkbox"
            checked={grayscale}
            onChange={(e) => setGrayscale(e.target.checked)}
            className="ml-2"
          />
        </label>

        <label className="flex justify-between items-center">
          Blur: <span>{blur.toFixed(1)}</span>
          <input
            type="range"
            min={0}
            max={20}
            step={0.1}
            value={blur}
            onChange={(e) => setBlur(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Sharpen: <span>{sharpen.toFixed(2)}</span>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={sharpen}
            onChange={(e) => setSharpen(parseFloat(e.target.value))}
            className="w-full"
          />
        </label>

        <label className="flex justify-between items-center">
          Invert:
          <input
            type="checkbox"
            checked={invert}
            onChange={(e) => setInvert(e.target.checked)}
            className="ml-2"
          />
        </label>
      </div>

      {/* Shape Tools */}
      <div className="flex flex-col gap-3 w-full max-w-md">
        <h3 className="text-lg font-semibold text-center">Shape Tools</h3>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={() => setSelectedTool('rectangle')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'rectangle'
                ? 'bg-red-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            📐 Rectangle
          </button>
          
          <button
            onClick={() => setSelectedTool('circle')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'circle'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ⭕ Circle
          </button>
          
          <button
            onClick={() => setSelectedTool('line')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'line'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            📏 Line
          </button>
          
          <button
            onClick={() => setSelectedTool('none')}
            className={`px-4 py-2 rounded-lg transition ${
              selectedTool === 'none'
                ? 'bg-green-500 text-white'
                : 'bg-gray-300 text-gray-700 hover:bg-gray-400'
            }`}
          >
            ✋ Select
          </button>
        </div>
        
        <div className="flex gap-2 justify-center">
          <button
            onClick={clearShapes}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700 transition text-white"
          >
            🗑️ Clear Shapes
          </button>
          
          <span className="px-4 py-2 bg-gray-100 rounded-lg text-gray-700">
            Shapes: {shapes.length}
          </span>
        </div>
      </div>

      <div className="flex gap-3">
        <button
          onClick={addText}
          className="bg-blue-500 px-4 py-2 rounded-lg hover:bg-blue-600 transition"
        >
          Add Text
        </button>
        <button
          onClick={downloadImage}
          className="bg-green-500 px-4 py-2 rounded-lg hover:bg-green-600 transition"
        >
          Download
        </button>
        <button
          onClick={resetFilters}
          className="bg-purple-500 px-4 py-2 rounded-lg hover:bg-purple-600 transition"
        >
          Reset Filters
        </button>
        <button
          onClick={() => setImage(null)}
          className="bg-gray-600 px-4 py-2 rounded-lg hover:bg-gray-700 transition"
        >
          Upload Another
        </button>
      </div>
    </div>
  );
}
