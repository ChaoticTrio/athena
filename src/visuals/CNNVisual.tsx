import {
  ColumnHeightOutlined,
  DownloadOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  LineOutlined,
  StopOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { Edges, OrbitControls, OrthographicCamera } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { Button, Segmented, Tooltip } from "antd";
import { useEffect, useState } from "react";
import * as THREE from "three";
import {
  CNNDenseLayer,
  CNNDropoutLayer,
  CNNLayer,
  CNNLayerTypes,
  CNNOutputLayer,
  ConvLayer,
  FlattenLayer,
  InputLayer,
  PaddingLayer,
  PoolLayer,
  FlattenLayer,
  CNNDenseLayer,
  CNNDropoutLayer,
} from "../types/CNNTypes";

// array of objects with req properties below
// Input - {
//   size: [x, y, z]
// }
// CNN - {
//   size: output_channels as a number,
//   kernel_size: number for [x, x] or number[] for [x, y],
// }
// Pool - {
//   kernel_size: number for [x, x] or number[] for [x, y],
//   stride: number for [x, x] or number[] for [x, y]
// }
// Padding - {
//   padding: number for [x, x] or number[] for [x, y],
// }
// Dropout - {p} - TODO
// Normalization - {channels} - TODO

type V3 = { x: number; y: number; z: number };

type ConvertedLayer = {
  type:
    | "Input"
    | "Conv"
    | "Pool"
    | "Dropout"
    | "Normalization"
    | "Padding"
    | "Flatten"
    | "Dense"
    | "Output"
    | "Gap"
    | "CrossGap";
  size: V3;
  infoText: string;
  sizeText: string;
};

type LAYER_SCALE = "linear" | "log";

type SpriteProps = {
  msg: string;
  position: V3;
  fontSize?: number;
  fontFace?: string;
  fontWeight?: string;
  textColor?: string;
  textHeight?: number;
  borderThickness?: number;
  borderRad?: number;
  borderColor?: string;
  pad?: number;
  backgroundColor?: string;
  up?: boolean;
  angle?: number; // in radians
  line?: boolean;
};

function formatInputLayer(layer: InputLayer): ConvertedLayer[] {
  const size = { x: layer.size[0], y: layer.size[1], z: layer.size[2] };
  return [
    {
      type: "Input",
      size: size,
      infoText: `Input\n${layerSizeToString(size)}`,
      sizeText: layerSizeToString(size),
    },
  ];
}

function formatConvLayer(
  layer: ConvLayer,
  currSize: V3
): ConvertedLayer[] {
  const size = {
    x: layer.size,
    y: currSize.y - (layer.kernel[0] - 1),
    z: currSize.z - (layer.kernel[1] - 1),
  };
  return [
    {
      type: "Gap",
      size: { x: 1, y: 1, z: 1 },
      infoText: "Gap",
      sizeText: "",
    },
    {
      type: "Conv",
      size: size,
      infoText: `Conv\n${layer.size}x${layer.kernel[0]}x${layer.kernel[1]}`,
      sizeText: layerSizeToString(size),
    },
  ];
}

function formatPaddingLayer(
  layer: PaddingLayer,
  currSize: V3
): ConvertedLayer[] {
  const newSize = {
    x: currSize.x,
    y: currSize.y + 2 * layer.padding[0],
    z: currSize.z + 2 * layer.padding[1],
  };
  return [
    {
      type: "Padding",
      size: newSize,
      infoText: `Padding\n${layer.padding[0]}x${layer.padding[1]}`,
      sizeText: layerSizeToString(newSize),
    },
  ];
}

function formatPoolingLayer(
  layer: PoolLayer,
  currSize: V3
): ConvertedLayer[] {
  const size = {
    x: currSize.x,
    y: Math.floor((currSize.y - layer.kernel[0]) / layer.stride[0] + 1),
    z: Math.floor((currSize.z - layer.kernel[1]) / layer.stride[1] + 1),
  };
  return [
    {
      type: "Gap",
      size: { x: 1, y: 1, z: 1 },
      infoText: "Gap",
      sizeText: "",
    },
    {
      type: "Pool",
      size: size,
      infoText: `Pool\n${layer.kernel[0]}x${layer.kernel[1]}\n${layer.stride[0]}x${layer.stride[1]}`,
      sizeText: layerSizeToString(size),
    },
  ];
}

function formatFlattenLayer(
  layer: FlattenLayer,
  i: number,
  currSize: V3
): ConvertedLayer[] {
  return [
    {
      type: "Gap",
      size: { x: 1, y: 1, z: 1 },
      infoText: "Gap",
      sizeText: "",
    },
    {
      type: "Flatten",
      size: { x: 1, y: currSize.x * currSize.y * currSize.z, z: 1 },
      infoText: "Flatten",
      sizeText: (currSize.x * currSize.y * currSize.z).toString(),
    },
  ];
}

function formatDenseLayer(
  layer: CNNDenseLayer,
  i: number,
  currSize: V3
): ConvertedLayer[] {
  return [
    {
      type: "CrossGap",
      size: { x: 1, y: 1, z: 1 },
      infoText: "Gap",
      sizeText: "",
    },
    {
      type: "Dense",
      size: { x: 1, y: layer.size, z: 1 },
      infoText: `Dense\n${layer.size}`,
      sizeText: layer.size.toString(),
    },
  ];
}

function formatOutputLayer(
  layer: CNNOutputLayer,
  i: number,
  currSize: V3
): ConvertedLayer[] {
  return [
    {
      type: "CrossGap",
      size: { x: 1, y: 1, z: 1 },
      infoText: "Gap",
      sizeText: "",
    },
    {
      type: "Output",
      size: { x: 1, y: layer.size, z: 1 },
      infoText: `Output\n${layer.size}`,
      sizeText: layer.size.toString(),
    },
  ];
}

const layerFormatters: Record<
  CNNLayerTypes,
  (layer: any, index: number, prevSize: V3) => ConvertedLayer[]
> = {
  Input: formatInputLayer,
  Conv: formatConvLayer,
  Padding: formatPaddingLayer,
  Pool: formatPoolingLayer,
  // TODO: Add more layer formatters for Flatten, Dense, etc.
  Flatten: formatFlattenLayer,
  Dense: formatDenseLayer,
  Dropout: (layer: CNNDropoutLayer, i: number, currSize: V3) => {
    return [];
  },
  Output: formatOutputLayer,
} as const;

// source - https://github.com/vasturiano/three-spritetext/blob/master/src/index.js
function Sprite({
  msg,
  position,
  fontSize = 150,
  fontWeight = "bold",
  fontFace = "JetBrainsMono",
  textColor = "rgba(0, 0, 0, 1)",
  textHeight = 8,
  borderThickness = 0,
  borderRad = 0,
  borderColor = "rgba(0, 0, 0, 1)",
  pad = 0,
  backgroundColor = "",
  up = false,
  angle = 0,
  line = false,
}: SpriteProps) {
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d")!;

  const border = [borderThickness, borderThickness];
  const relBorder = border.map((b) => b * fontSize * 0.1);
  const borderRadius = [borderRad, borderRad, borderRad, borderRad];
  const relBorderRadius = borderRadius.map((b) => b * fontSize * 0.1);
  const padding = [pad, pad];
  const relPadding = padding.map((p) => p * fontSize * 0.1);

  const lines = msg.split("\n");
  const font = `${fontWeight} ${fontSize}px ${fontFace}`;
  context.font = font;

  const innerWidth = Math.max(
    ...lines.map((l) => context.measureText(l).width)
  );
  const innerHeight = fontSize * lines.length;
  canvas.width = innerWidth + 2 * relBorder[0] + 2 * relPadding[0];
  canvas.height = innerHeight + 2 * relBorder[1] + 2 * relPadding[1];

  if (borderThickness > 0) {
    context.strokeStyle = borderColor;

    if (relBorder[0]) {
      // left + right borders
      const half = relBorder[0] / 2;
      context.lineWidth = relBorder[0];
      context.beginPath();
      context.moveTo(half, relBorderRadius[0]);
      context.lineTo(half, canvas.height - relBorderRadius[3]);
      context.moveTo(canvas.width - half, relBorderRadius[1]);
      context.lineTo(canvas.width - half, canvas.height - relBorderRadius[2]);
      context.stroke();
    }

    if (relBorder[1]) {
      // top + bottom borders
      const half = relBorder[1] / 2;
      context.lineWidth = relBorder[1];
      context.beginPath();
      context.moveTo(Math.max(relBorder[0], relBorderRadius[0]), half);
      context.lineTo(
        canvas.width - Math.max(relBorder[0], relBorderRadius[1]),
        half
      );
      context.moveTo(
        Math.max(relBorder[0], relBorderRadius[3]),
        canvas.height - half
      );
      context.lineTo(
        canvas.width - Math.max(relBorder[0], relBorderRadius[2]),
        canvas.height - half
      );
      context.stroke();
    }

    if (borderRad > 0) {
      // strike rounded corners
      const cornerWidth = Math.max(...relBorder);
      const hb = cornerWidth / 2;
      context.lineWidth = cornerWidth;
      context.beginPath();
      [
        relBorderRadius[0]? [relBorderRadius[0], hb, hb, relBorderRadius[0]] : null,
        relBorderRadius[1]? [canvas.width - relBorderRadius[1], canvas.width - hb, hb, relBorderRadius[1]] : null,
        relBorderRadius[2]? [canvas.width - relBorderRadius[2], canvas.width - hb, canvas.height - hb, canvas.height - relBorderRadius[2]] : null,
        relBorderRadius[3]? [relBorderRadius[3], hb, canvas.height - hb, canvas.height - relBorderRadius[3]] : null,
      ]
      .filter((d): d is number[] => d!== null)
      .forEach(([x0, x1, y0, y1]) => {
        context.moveTo(x0, y0);
        context.quadraticCurveTo(x1, y0, x1, y1);
      });
      context.stroke();
    }
  }

  if (backgroundColor) {
    context.fillStyle = backgroundColor;
    if (borderRad === 0) {
      context.fillRect(
        relBorder[0],
        relBorder[1],
        canvas.width - relBorder[0] * 2,
        canvas.height - relBorder[1] * 2
      );
    } else {
      // fill with rounded corners
      context.beginPath();
      context.moveTo(relBorder[0], relBorderRadius[0]);
      [
        [
          relBorder[0],
          relBorderRadius[0],
          canvas.width - relBorderRadius[1],
          relBorder[1],
          relBorder[1],
          relBorder[1],
        ], // t
        [
          canvas.width - relBorder[0],
          canvas.width - relBorder[0],
          canvas.width - relBorder[0],
          relBorder[1],
          relBorderRadius[1],
          canvas.height - relBorderRadius[2],
        ], // r
        [
          canvas.width - relBorder[0],
          canvas.width - relBorderRadius[2],
          relBorderRadius[3],
          canvas.height - relBorder[1],
          canvas.height - relBorder[1],
          canvas.height - relBorder[1],
        ], // b
        [
          relBorder[0],
          relBorder[0],
          relBorder[0],
          canvas.height - relBorder[1],
          canvas.height - relBorderRadius[3],
          relBorderRadius[0],
        ], // t
      ].forEach(([x0, x1, x2, y0, y1, y2]) => {
        context.quadraticCurveTo(x0, y0, x1, y1);
        context.lineTo(x2, y2);
      });
      context.closePath();
      context.fill();
    }
  }

  context.translate(relBorder[0], relBorder[1]);
  context.translate(relPadding[0], relPadding[1]);

  context.font = font;
  context.fillStyle = textColor;
  context.textBaseline = "bottom";

  lines.forEach((line, i) => {
    const lineX = (innerWidth - context.measureText(line).width) / 2;
    const lineY = (i + 1) * fontSize;
    context.fillText(line, lineX, lineY);
  });

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  const yScale = textHeight * lines.length + border[1] * 2 + padding[1] * 2;
  const xScale = (yScale * canvas.width) / canvas.height;
  const absScale = yScale / canvas.height;
  // if (up) {
  //   position[0] -= ((canvas.width * absScale) / 2) * 0.707;
  //   position[1] += ((canvas.width * absScale) / 2) * 0.707;
  // } else {
  //   position[0] += ((canvas.width * absScale) / 2) * 0.707;
  //   position[1] -= ((canvas.width * absScale) /2) * 0.707;
  // }

  const offset = 20;
  const pos: [number, number, number] = [position.x, 0, position.z];
  pos[1] = (up ? 1 : -1) * (position.y / 2 + offset);
  const center = pos[1];
  if (angle !== 0) {
    if (up) {
      pos[0] +=
        ((canvas.width * absScale) / 2) * Math.sign(angle) * Math.cos(angle);
      pos[1] += ((canvas.width * absScale) / 2) * Math.abs(Math.sin(angle));
    } else {
      pos[0] -=
        ((canvas.width * absScale) / 2) * Math.sign(angle) * Math.cos(angle);
      pos[1] -= ((canvas.width * absScale) / 2) * Math.abs(Math.sin(angle));
    }
  }

  return (
    <>
      <sprite key="0" scale={[xScale, yScale, 0]} position={pos}>
        <spriteMaterial attach="material" map={texture} rotation={angle} />
      </sprite>
      {line && (
        <line key="1">
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  position.x,
                  (up ? 1 : -1) * (position.y / 2),
                  pos[2],
                  position.x,
                  center - (up ? 1 : -1) * ((canvas.height / 2) * absScale),
                  pos[2],
                ])
              }
              itemSize={3}
              onUpdate={(self) => {
                self.needsUpdate = true;
              }}
            />
          </bufferGeometry>
          <lineBasicMaterial color="black" linewidth={2} />
        </line>
      )}
    </>
  );
}

function CNNLayerBox({
  layer,
  prevEdge,
}: {
  layer: ConvertedLayer;
  prevEdge: number;
}): JSX.Element {
  let color = "yellow";
  switch (layer.type) {
    case "Input":
      {
        color = "green";
        // <Sprite
        //   key={i + 100}
        //   msg={"Input"}
        //   position={[prevEdge, layer.size.y / 2 + 40, 0]}
        //   up={true}
        // />
      }
      break;
    case "Conv":
      {
        color = "yellow";
        // draw a line from [prevEdge + (layer.size.x / 2) * widthScale, 0, 0] to [prevEdge + (layer.size.x / 2) * widthScale, (-layer.size.y * heightScale) / 2 - 20, 0]
      }
      break;
    case "Padding":
      {
        color = "red";
      }
      break;
    case "Pool":
      {
        color = "blue";
      }
      break;
    case "Flatten":
      {
        color = "cyan";
      }
      break;
    case "Dense":
      {
        color = "purple";
      }
      break;
    case "Output":
      {
        color = "red";
      }
      break;
    default:
      break;
  }
  return (
    <mesh position={[prevEdge + layer.size.x / 2, 0, 0]} key={0}>
      <boxGeometry args={[layer.size.x, layer.size.y, layer.size.z]} />
      <meshStandardMaterial
        color={color}
        // wireframe={isWireframe}
        wireframeLinewidth={1}
        opacity={0.5}
        transparent={true}
      />
      <Edges threshold={15} color={"black"} />
    </mesh>
  );
}

function GapLayerBox({
  prevLayer,
  nextLayer,
}: {
  prevLayer: V3;
  nextLayer: V3;
}): JSX.Element[] {
  const res: JSX.Element[] = [];
  let k = 0;
  for (let i = -0.5; i < 1; i += 1) {
    for (let j = -0.5; j < 1; j += 1) {
      res.push(
        <line key={k++}>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  prevLayer.x,
                  prevLayer.y * i,
                  prevLayer.z * j,
                  nextLayer.x,
                  nextLayer.y * i,
                  nextLayer.z * j,
                ])
              }
              itemSize={3}
              onUpdate={(self) => {
                self.needsUpdate = true;
              }}
            />
          </bufferGeometry>
          <lineBasicMaterial color="black" linewidth={2} />
        </line>
      );
    }
  }
  return res;
}

function CrossGapLayerBox({
  prevLayer,
  nextLayer,
}: {
  prevLayer: V3;
  nextLayer: V3;
}): JSX.Element[] {
  const res: JSX.Element[] = [];
  let k = 0;

  for (let i = -0.5; i < 1; i += 1) {
    for (let j = -0.5; j < 1; j += 1) {
      res.push(
        <line key={k++}>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  prevLayer.x,
                  prevLayer.y * i,
                  prevLayer.z * j,
                  nextLayer.x,
                  nextLayer.y * i,
                  nextLayer.z * j,
                ])
              }
              itemSize={3}
              onUpdate={(self) => {
                self.needsUpdate = true;
              }}
            />
          </bufferGeometry>
          <lineBasicMaterial color="black" linewidth={2} />
        </line>
      );
      res.push(
        <line key={k++}>
          <bufferGeometry>
            <float32BufferAttribute
              attach="attributes-position"
              count={2}
              array={
                new Float32Array([
                  prevLayer.x,
                  prevLayer.y * i,
                  prevLayer.z * j,
                  nextLayer.x,
                  nextLayer.y * -i,
                  nextLayer.z * j,
                ])
              }
              itemSize={3}
              onUpdate={(self) => {
                self.needsUpdate = true;
              }}
            />
          </bufferGeometry>
          <lineBasicMaterial color="black" linewidth={2} />
        </line>
      );
    }
  }
  return res;
}

function layerSizeToString(size: V3): string {
  return `${size.x}x${size.y}x${size.z}`;
}

function calcBoxSize(type: string, size: V3, layerScaling: LAYER_SCALE) {
  switch (type) {
    case "Input":
    case "Conv":
    case "Pool":
    case "Padding":
      {
        if (layerScaling === "linear") {
          size.x = Math.max(size.x, 10);
        } else if (layerScaling === "log") {
          size.x = Math.log2(size.x);
          size.y = Math.log2(size.y);
          size.z = Math.log2(size.z);
        }
      }
      return;
    case "Gap":
      size.x = Math.max(size.x, 15);
      return;
    case "Dropout":
      return;
    case "CrossGap":
      size.x = Math.max(size.x, 20);
      return;
    case "Dense":
    case "Output":
    case "Flatten":
      size.x = Math.max(size.x, 5);
      size.y = Math.log2(size.y) * 10;
      size.z = Math.max(size.z, 5);
      return;
  }
}

function getMeshes(
  dataset: CNNLayer[],
  width: number,
  height: number,
  config: {
    layerScaling: LAYER_SCALE;
    showText: "none" | "slantDown" | "alt" | "slant";
    showLines: boolean;
  } = {
    layerScaling: "linear",
    showText: "none",
    showLines: true,
  }
): { res: JSX.Element[]; zoom: number } {
  const res: JSX.Element[] = [];
  const isWireframe: boolean = false;
  let k = 0;

  // First pass - validate and convert layers into standard format
  // Current size of the layer, used to calculate the size of the next layer
  let currSize: V3 = { x: 0, y: 0, z: 0 };
  const convertedLayers: ConvertedLayer[] = dataset.flatMap(
    (layer): ConvertedLayer[] => {
      const formatter = layerFormatters[layer.type as keyof LayerFormatters];

      if (!formatter || !layer) {
        // throw new Error(`Invalid layer type: ${layer.type}`);
        // TODO: ignore for now
        // return [];
      }

      const currLayers = formatter(layer, i, currSize);
      if (currLayers.length === 0) {
        return [];
      }
      currSize = currLayers[currLayers.length - 1].size;
      return currLayers;
    }
  );

  // Second pass - set the box sizes
  convertedLayers.forEach((layer) => {
    calcBoxSize(layer.type, layer.size, config.layerScaling);
  });

  // Third pass - calculate total width and max height of the layers
  let totalWidth: number = 0;
  let maxY: number = 0;
  convertedLayers.forEach((layer) => {
    totalWidth += layer.size.x;
    maxY = Math.max(maxY, layer.size.y);
  });

  // Fourth pass - create the meshes for layers
  let prevLayerEndX = -totalWidth / 2;
  const postLayers: { vec: V3; text: string }[] = convertedLayers.flatMap(
    (layer, i) => {
      if (layer.type === "Gap") {
        if (i === 0 || i === convertedLayers.length - 1) {
          return [];
        }
        res.push(
          <GapLayerBox
            key={k++}
            prevLayer={{
              x: prevLayerEndX,
              y: convertedLayers[i - 1].size.y,
              z: convertedLayers[i - 1].size.z,
            }}
            nextLayer={{
              x: prevLayerEndX + layer.size.x,
              y: convertedLayers[i + 1].size.y,
              z: convertedLayers[i + 1].size.z,
            }}
          />
        );
      } else if (layer.type === "CrossGap") {
        res.push(
          <CrossGapLayerBox
            key={k++}
            prevLayer={{
              x: prevLayerEndX,
              y: convertedLayers[i - 1].size.y,
              z: convertedLayers[i - 1].size.z,
            }}
            nextLayer={{
              x: prevLayerEndX + layer.size.x,
              y: convertedLayers[i + 1].size.y,
              z: convertedLayers[i + 1].size.z,
            }}
          />
        );
      } else if (layer.type !== "Dropout") {
        res.push(
          <CNNLayerBox key={k++} layer={layer} prevEdge={prevLayerEndX} />
        );
      }

      prevLayerEndX += layer.size.x;
      return layer.type === "Gap" ||
        layer.type === "CrossGap" ||
        layer.type === "Dropout"
        ? []
        : [
            {
              vec: {
                x: prevLayerEndX - layer.size.x / 2,
                y: layer.size.y,
                z: 0,
              },
              text: layer.sizeText,
            },
          ];
    }
  );

  // Fifth pass - create the sprites for the layers
  if (config.showText !== "none") {
    postLayers.forEach((layer, i) => {
      res.push(
        <Sprite
          key={k++}
          msg={layer.text}
          position={layer.vec}
          up={
            // switch between up and down if alt
            // If up or slant, put up. If down, put down
            config.showText === "alt"
              ? i % 2 === 0
              : config.showText === "slant"
          }
          angle={
            config.showText === "slant"
              ? Math.PI / 6
              : config.showText === "slantDown"
              ? -Math.PI / 6
              : 0
          }
          line={config.showLines}
        />
      );
    });
  }

  const widthScale = (width * 0.9) / totalWidth;
  const heightScale = (height * 0.6) / maxY;
  const minScale = Math.min(widthScale, heightScale);

  return { res, zoom: minScale };
}

type AnnotationAlignment = "none" | "alt" | "slant" | "slantDown";

// Entry point for CNN visual, takes in width and height of the canvas, needs to be replaced with a prop or return a update function
function CNNVisual({
  configRef,
  dlRef,
  layers,
  toggleMaximize,
  maximizeState,
  width,
  height,
}: {
  configRef: React.MutableRefObject<null>;
  dlRef: React.MutableRefObject<null>;
  layers: CNNLayer[];
  toggleMaximize: () => void;
  maximizeState: boolean;
  width: number;
  height: number;
}) {
  const [showText, setShowText] = useState<AnnotationAlignment>("alt");
  const [showLines, setShowLines] = useState(true);
  const layerScaling = "linear";
  const [zoomState, setZoomState] = useState(1);
  const [resState, setResState] = useState<JSX.Element[]>([]);

  const downloadSceneAsImage = () => {
    const canvas = document.querySelector("canvas") as HTMLCanvasElement;

    if (canvas) {
      requestAnimationFrame(() => {
        const link = document.createElement("a");
        link.setAttribute("download", `cnn-viz.png`);
        link.setAttribute("href", canvas.toDataURL("image/png"));
        link.click();
        link.remove();
      });
    } else {
      console.error("Canvas element not found");
    }
  };

  useEffect(() => {
    const { res, zoom } =
      layers.length > 0
        ? getMeshes(layers, width, height, {
            layerScaling: layerScaling,
            showText: showText,
            showLines: showLines,
          })
        : { res: [], zoom: 1 };
    setResState(res);
    setZoomState(zoom);
  }, [layers, showLines, showText]);

  return (
    <div
      id="canvas-container"
      className="relative"
      style={{
        overflow: "hidden",
        // width: full ? innerWidth : '100%',
        width: "100%",
        // height: full ? innerHeight : '100%',
        height: "100%",
        backgroundColor: "white",
        border: "2px solid black",
        transition: "all 0.3s ease",
        // zIndex: full ? 20 : 0,
      }}
    >
      <Segmented
        ref={configRef}
        key={1}
        className="absolute m-2 z-10 border-slate-500 border-2"
        vertical
        options={[
          { value: "none", icon: <StopOutlined /> },
          { value: "alt", icon: <SwapOutlined /> },
          { value: "slant", icon: <LineOutlined rotate={-30} /> },
          { value: "slantDown", icon: <LineOutlined rotate={30} /> },
        ]}
        value={showText}
        onChange={(value) => {
          setShowText(value as AnnotationAlignment);
        }}
      />
      <Segmented
        key={2}
        className="absolute left-14 m-2 z-10 border-slate-500 border-2"
        vertical
        options={[
          { value: "false", icon: <StopOutlined /> },
          { value: "true", icon: <ColumnHeightOutlined /> },
        ]}
        disabled={showText === "none"}
        value={showLines ? "true" : "false"}
        onChange={(value) => {
          setShowLines(value === "true");
        }}
        // style={{ visibility: showText === "none" ? "hidden" : "visible" }}
      />

      <Tooltip key={3} placement="left" title="Download">
        <Button
          ref={dlRef}
          className="absolute z-10 right-10 m-2 border-2 border-slate-500 "
          icon={<DownloadOutlined />}
          size="middle"
          variant="outlined"
          onClick={downloadSceneAsImage}
        />
      </Tooltip>
      <Tooltip
        key={4}
        placement="bottomRight"
        title={maximizeState ? "Minimize" : "Maximize"}
      >
        <Button
          className="absolute z-10 right-0 m-2 border-2 border-slate-500"
          icon={
            maximizeState ? <FullscreenExitOutlined /> : <FullscreenOutlined />
          }
          size="middle"
          variant="outlined"
          onClick={toggleMaximize}
        />
      </Tooltip>
      <Canvas
        key={5}
        className="z-0"
        onCreated={(state) => {
          state.gl.setClearColor("white");
          state.scene.background = new THREE.Color("#f0f0f0");
        }}
      >
        <ambientLight intensity={2} />
        {/* <directionalLight color="red" position={[1, 1, 5]} /> */}
        <OrthographicCamera
          makeDefault
          zoom={zoomState}
          top={height / 2}
          bottom={-height / 2}
          left={-width / 2 + 0}
          right={width / 2 + 0}
          near={0.1}
          far={100000}
          position={[0, 0, Math.max(width, height)]}
        />
        <OrbitControls />
        {resState}
      </Canvas>
    </div>
  );
}

export default CNNVisual;
