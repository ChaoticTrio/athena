import { Edges, OrbitControls, OrthographicCamera, Outlines } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import { useState } from "react";

// array of objects with req properties below
// CNN - {output_channels, kernel_size, stride, padding}
// Pool - {kernel_size, stride, padding}
// Dropout - {p}
// Normalization - {channels}

function clipMinMax(x: number, min: number, max: number): number {
  if (x < min) return min;
  if (x > max) return max;
  return x;
}

type Layer = {
  type:
    | "Input"
    | "Conv"
    | "Pool"
    | "Dropout"
    | "Normalization"
    | "Padding"
    | "Flatten"
    | "Linear";
  size?: number | number[];
  kernel_size?: number | number[];
  stride?: number | number[];
  padding?: number | number[];
  p?: number;
  activation?: string;
};

function generateDataset(numOfCon?: number): Layer[] {
  let res: Layer[] = [{ type: "Input", size: [224, 224, 3] }];
  res = res.concat(
    Array.from(Array(numOfCon || 3).keys()).flatMap((e, i): Layer[] => {
      return [
        { type: "Padding", padding: 1 },
        { type: "Conv", size: Math.pow(2, Math.min(5 + i, 9)), kernel_size: 3 },
        { type: "Padding", padding: 1 },
        { type: "Conv", size: Math.pow(2, Math.min(5 + i, 9)), kernel_size: 3 },
        { type: "Pool", kernel_size: 2, stride: 2 },
      ];
    })
  );
  res.push({ type: "Flatten" });
  res.push({ type: "Linear", size: 64, activation: "ReLU" });
  res.push({ type: "Linear", size: 64, activation: "ReLU" });
  res.push({ type: "Linear", size: 6 });
  console.log(res);
  return res;
}

function formatInputLayer(layer: Layer, i: number): void {
  if (!Array.isArray(layer.size) || layer.size.length !== 3) {
    console.error("Invalid input layer size");
  }
  if (i !== 0) {
    console.error("Input layer must be the first layer");
  }
}

function formatConvLayer(layer: Layer): void {
  // check if layer.size is defined and is a number
  if (typeof layer.size !== "number") {
    throw new Error("Invalid conv layer size");
  }
  // check if kernel size is not undefined
  if (layer.kernel_size === undefined) {
    throw new Error("Kernel size is undefined");
  } else if (typeof layer.kernel_size === "number") {
    layer.kernel_size = [layer.kernel_size, layer.kernel_size];
  } else if (layer.kernel_size.length !== 2) {
    throw new Error("Invalid kernel size");
  }
}

function formatPaddingLayer(layer: Layer): void {
  if (layer.padding === undefined) {
    throw new Error("Padding value is undefined");
  } else if (typeof layer.padding === "number") {
    layer.padding = [layer.padding, layer.padding];
  } else if (layer.padding.length !== 2) {
    throw new Error("Invalid padding size");
  }
}

function formatPoolingLayer(layer: Layer): void {
  if (layer.kernel_size === undefined) {
    throw new Error("Kernel size is undefined");
  } else if (typeof layer.kernel_size === "number") {
    layer.kernel_size = [layer.kernel_size, layer.kernel_size];
  } else if (layer.kernel_size.length !== 2) {
    throw new Error("Invalid kernel size");
  }
  if (layer.stride === undefined) {
    throw new Error("Stride is undefined");
  } else if (typeof layer.stride === "number") {
    layer.stride = [layer.stride, layer.stride];
  } else if (layer.stride.length !== 2) {
    throw new Error("Invalid stride size");
  }
}

function calcChannelWidth(n: number): number {
  // return clipMinMax(Math.log2(n) / 10, 1, 5) / 4;
  // return Math.log2(n) / 10;
  return Math.log2(n) * 4;
}

type ConvertedLayer = {
  type:
    | "Input"
    | "Conv"
    | "Pool"
    | "Dropout"
    | "Normalization"
    | "Padding"
    | "Flatten"
    | "Linear";
  size: {
    x: number;
    y: number;
    z: number;
  };
};

function getMeshes(
  dataset: Layer[],
  width: number,
  height: number
): JSX.Element[] {
  const res: JSX.Element[] = [];
  const isWireframe: boolean = false;

  let currSize: { x: number; y: number; z: number } = { x: 0, y: 0, z: 0 };

  const convertedLayers: ConvertedLayer[] = dataset.flatMap(
    (layer, i): ConvertedLayer[] => {
      switch (layer.type) {
        case "Input": {
          formatInputLayer(layer, i);
          currSize = {
            x: layer.size[2],
            y: layer.size[0],
            z: layer.size[1],
          };
          return [
            {
              type: "Input",
              size: { ...currSize },
            },
          ];
        }
        case "Conv": {
          formatConvLayer(layer);
          currSize = {
            x: layer.size,
            y: currSize.y - (layer.kernel_size[0] - 1),
            z: currSize.z - (layer.kernel_size[1] - 1),
          };
          return [
            {
              type: "Conv",
              size: { ...currSize },
            },
          ];
        }
        case "Padding": {
          formatPaddingLayer(layer);
          currSize = {
            x: currSize.x,
            y: currSize.y + 2 * layer.padding[0],
            z: currSize.z + 2 * layer.padding[1],
          };
          return [
            {
              type: "Padding",
              size: { ...currSize },
            },
          ];
        }
        case "Pool": {
          formatPoolingLayer(layer);
          currSize = {
            x: currSize.x,
            y: Math.floor(
              (currSize.y - layer.kernel_size[0]) / layer.stride[0] + 1
            ),
            z: Math.floor(
              (currSize.z - layer.kernel_size[1]) / layer.stride[1] + 1
            ),
          };
          return [
            {
              type: "Pool",
              size: { ...currSize },
            },
          ];
        }
        default:
          return [];
      }
    }
  );
  let totalWidth: number = 0;
  let maxYZ: number = 0;
  convertedLayers.forEach((layer) => {
    totalWidth += layer.size.x;
    maxYZ = Math.max(maxYZ, layer.size.y, layer.size.z);
  });
  const widthScale = (width * 0.9) / totalWidth;
  const heightScale = (height * 0.6) / maxYZ;
  let prevEdge: number = -totalWidth / 2;
  convertedLayers.forEach((layer, i) => {
    switch (layer.type) {
      case "Input":
        {
          res.push(
            <mesh
              position={[(prevEdge + layer.size.x / 2) * widthScale, 0, 0]}
              key={i}
            >
              <boxGeometry
                args={[
                  layer.size.x * widthScale,
                  layer.size.y * heightScale,
                  layer.size.z * heightScale,
                ]}
              />

              <meshStandardMaterial
                color="green"
                wireframe={isWireframe}
                wireframeLinewidth={1}
                opacity={0.5}
                transparent={true}
              />
              <Edges linewidth={2} threshold={15} color={"black"} />
            </mesh>
          );
        }
        break;
      case "Conv":
        {
          res.push(
            <mesh
              position={[(prevEdge + layer.size.x / 2) * widthScale, 0, 0]}
              key={i}
            >
              <boxGeometry
                args={[
                  layer.size.x * widthScale,
                  layer.size.y * heightScale,
                  layer.size.z * heightScale,
                ]}
              />
              <meshStandardMaterial
                color="yellow"
                wireframe={isWireframe}
                wireframeLinewidth={1}
                opacity={0.5}
                transparent={true}
              />
              <Edges linewidth={2} threshold={15} color={"black"} />
            </mesh>
          );
        }
        break;
      case "Padding":
        {
          res.push(
            <mesh
              position={[(prevEdge + layer.size.x / 2) * widthScale, 0, 0]}
              key={i}
            >
              <boxGeometry
                args={[
                  layer.size.x * widthScale,
                  layer.size.y * heightScale,
                  layer.size.z * heightScale,
                ]}
              />
              <meshStandardMaterial
                color="red"
                wireframe={isWireframe}
                wireframeLinewidth={1}
                opacity={0.5}
                transparent={true}
              />
              <Edges linewidth={2} threshold={15} color={"black"} />
            </mesh>
          );
        }
        break;
      case "Pool":
        {
          res.push(
            <mesh
              position={[(prevEdge + layer.size.x / 2) * widthScale, 0, 0]}
              key={i}
            >
              <boxGeometry
                args={[
                  layer.size.x * widthScale,
                  layer.size.y * heightScale,
                  layer.size.z * heightScale,
                ]}
              />
              <meshStandardMaterial
                color="blue"
                wireframe={isWireframe}
                wireframeLinewidth={1}
                opacity={0.5}
                transparent={true}
              />
              <Edges linewidth={2} threshold={15} color={"black"} />
            </mesh>
          );
        }
        break;
      case "Flatten":
        break;
      case "Linear":
        break;
      default:
        break;
    }
    prevEdge += layer.size.x;
  });
  //   let currWidth: number = 0;
  //   switch (layer.type) {
  //     case "Input":
  //       {
  //         formatInputLayer(layer, i);
  //         currWidth = calcChannelWidth(layer.size[2]);
  //         res.push(
  //           <mesh position={[prevEdge + currWidth / 2, 0, 0]} key={i}>
  //             <boxGeometry
  //               args={[currWidth, layer.size[0] / scale, layer.size[1] / scale]}
  //             />
  //             <meshStandardMaterial
  //               color="green"
  //               wireframe={isWireframe}
  //               wireframeLinewidth={1}
  //             />
  //           </mesh>
  //         );
  //         currSize = { x: layer.size[2], y: layer.size[0], z: layer.size[1] };
  //         console.log([
  //           currWidth,
  //           layer.size[0] / scale,
  //           layer.size[1] / scale,
  //         ]);
  //       }
  //       break;
  //     case "Conv":
  //       {
  //         formatConvLayer(layer);
  //         currWidth = calcChannelWidth(layer.size);
  //         const newY = currSize.y - (layer.kernel_size[0] - 1);
  //         const newZ = currSize.z - (layer.kernel_size[1] - 1);
  //         res.push(
  //           <mesh position={[prevEdge + currWidth / 2, 0, 0]} key={i}>
  //             <boxGeometry args={[currWidth, newY / scale, newZ / scale]} />
  //             <meshStandardMaterial
  //               color="yellow"
  //               wireframe={isWireframe}
  //               wireframeLinewidth={1}
  //             />
  //           </mesh>
  //         );
  //         currSize = { x: layer.size, y: newY, z: newZ };
  //       }
  //       break;
  //     case "Padding":
  //       {
  //         formatPaddingLayer(layer);
  //         currWidth = calcChannelWidth(currSize.x);
  //         const newY = currSize.y + 2 * layer.padding[0];
  //         const newZ = currSize.z + 2 * layer.padding[1];
  //         res.push(
  //           <mesh position={[prevEdge + currWidth / 2, 0, 0]} key={i}>
  //             <boxGeometry args={[currWidth, newY / scale, newZ / scale]} />
  //             <meshStandardMaterial
  //               color="red"
  //               wireframe={isWireframe}
  //               wireframeLinewidth={1}
  //             />
  //           </mesh>
  //         );
  //         currSize.y = newY;
  //         currSize.z = newZ;
  //       }
  //       break;
  //     case "Pool":
  //       {
  //         formatPoolingLayer(layer);
  //         currWidth = calcChannelWidth(currSize.x);
  //         const newY = Math.floor(
  //           (currSize.y - layer.kernel_size[0]) / layer.stride[0] + 1
  //         );
  //         const newZ = Math.floor(
  //           (currSize.z - layer.kernel_size[1]) / layer.stride[1] + 1
  //         );
  //         res.push(
  //           <mesh position={[prevEdge + currWidth / 2, 0, 0]} key={i}>
  //             <boxGeometry args={[currWidth, newY / scale, newZ / scale]} />
  //             <meshStandardMaterial
  //               color="blue"
  //               wireframe={isWireframe}
  //               wireframeLinewidth={1}
  //             />
  //           </mesh>
  //         );
  //         currSize.y = newY;
  //         currSize.z = newZ;
  //       }
  //       break;
  //     case "Flatten":
  //       break;
  //     case "Linear":
  //       break;
  //     default:
  //       break;
  //   }
  //   prevEdge += currWidth;
  // });
  return res;
}

// Entry point for CNN visual, takes in width and height of the canvas, needs to be replaced with a prop or return a update function
function CNNVisual({ width, height }: { width: number; height: number }) {
  const [dataset, setDataset] = useState(generateDataset());

  return (
    <div
      id="canvas-container"
      className=""
      style={{
        overflow: "hidden",
        width: width,
        height: height,
        backgroundColor: "white",
        border: "2px solid black",
      }}
    >
      <Canvas>
        <ambientLight intensity={2} />
        {/* <directionalLight color="red" position={[1, 1, 5]} /> */}
        <OrthographicCamera
          makeDefault
          zoom={1}
          top={height / 2}
          bottom={height / -2}
          left={width / -2}
          right={width / 2}
          near={0}
          far={100000000}
          position={[0, 0, Math.max(width, height)]}
        />
        <OrbitControls />
        {getMeshes(dataset, width, height)}
      </Canvas>
    </div>
  );
}

export default CNNVisual;
