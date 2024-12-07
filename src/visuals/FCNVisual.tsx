import * as d3 from "d3";
import { useEffect, useRef } from "react";
import { FCNLayer, FCNLayerTypes } from "../types/FCNTypes";

type Layer = {
  type: string;
  size: number; // always display size
  label?: string; // "Input", activation function, "Dropout", "Output"
};

type Point = {
  x: number;
  y: number;
};

type Path = {
  s: Point;
  t: Point;
};

function getNodeCenter(layerInd: number, nodeNum: number): Point {
  return { x: layerInd * 300 + 100, y: nodeNum * 75 + 25 };
}

function getLayerNodes(layer: Layer, layerInd: number) {
  const nodes: Point[] = [];
  for (let i = 0; i < layer.size; i++) {
    nodes.push(getNodeCenter(layerInd, i));
  }
  const layerCenter = {
    x: (nodes[0].x + nodes[layer.size - 1].x) / 2,
    y: (nodes[0].y + nodes[layer.size - 1].y) / 2,
  };
  return { nodes, layerCenter };
}

// useful for declarative method of creating elements
function getCircleElement(node: Point) {
  return (
    <circle
      cx={node.x}
      cy={node.y}
      r="20"
      stroke="black"
      stroke-width="2"
      fill="white"
      pathLength={0}
    />
  );
}

// useful for declarative method of creating elements
function getConnectionPath(
  sX: number,
  sY: number,
  tX: number,
  tY: number,
  isBezier: boolean
) {
  if (isBezier) {
    const cp1 = [(sX + tX) / 2, sY];
    const cp2 = [(sX + tX) / 2, tY];

    return (
      <path
        strokeWidth={Math.random() * 0.8}
        strokeOpacity={1}
        stroke="rgb(0, 0, 0)"
        fill="none"
        pathLength={0}
        d={
          "M" +
          sX +
          "," +
          sY +
          "C" +
          cp1[0] +
          "," +
          cp1[1] +
          " " +
          cp2[0] +
          "," +
          cp2[1] +
          " " +
          tX +
          "," +
          tY
        }
      />
    );
  } else {
    return (
      <path
        strokeWidth={Math.random()}
        strokeOpacity={1}
        stroke="rgb(0, 0, 0)"
        fill="none"
        pathLength={0}
        d={"M" + sX + "," + sY + "L" + tX + "," + tY}
      />
    );
  }
}

// useful for declarative method of creating elements
function generateDiagram(dataset: Layer[], svgViewport: number) {
  const centers: Point[][] = [];
  const elements: JSX.Element[] = [];
  let minX: number = Number.MAX_SAFE_INTEGER;
  let maxX: number = Number.MIN_SAFE_INTEGER;
  const xCenter = svgViewport / 2;
  const yCenter = svgViewport / 2;
  dataset.forEach((layer, layerInd) => {
    const { nodes, layerCenter } = getLayerNodes(layer, layerInd);
    const yShift = yCenter - layerCenter.y;
    centers.push(
      nodes.map((node) => {
        node.y += yShift;
        return node;
      })
    );
    minX = Math.min(minX, layerCenter.x);
    maxX = Math.max(maxX, layerCenter.x);
  });
  const xShift = xCenter - (minX + maxX) / 2;
  centers.forEach((layer, index) => {
    if (index === 0) {
      return;
    }
    centers[index - 1].forEach((prevNode) => {
      layer.forEach((currNode) => {
        elements.push(
          getConnectionPath(
            prevNode.x + xShift,
            prevNode.y,
            currNode.x + xShift,
            currNode.y,
            true
          )
        );
      });
    });
  });
  centers.forEach((layer) => {
    layer.forEach((node) => {
      node.x += xShift;
      elements.push(getCircleElement(node));
    });
  });
  return elements;
}

function getPathAndNodeData(dataset: Layer[], svgViewport: number) {
  const centers: Point[][] = [];
  const paths: Path[] = [];
  const nodes: Point[] = [];
  let minX: number = Number.MAX_SAFE_INTEGER;
  let maxX: number = Number.MIN_SAFE_INTEGER;
  const xCenter = svgViewport / 2;
  const yCenter = svgViewport / 2;
  dataset.forEach((layer, layerInd) => {
    const { nodes, layerCenter } = getLayerNodes(layer, layerInd);
    const yShift = yCenter - layerCenter.y;
    centers.push(
      nodes.map((node) => {
        node.y += yShift;
        return node;
      })
    );
    minX = Math.min(minX, layerCenter.x);
    maxX = Math.max(maxX, layerCenter.x);
  });
  const xShift = xCenter - (minX + maxX) / 2;
  centers.forEach((layer, index) => {
    if (index === 0) {
      return;
    }
    centers[index - 1].forEach((prevNode) => {
      layer.forEach((currNode) => {
        paths.push({
          s: { x: prevNode.x + xShift, y: prevNode.y },
          t: { x: currNode.x + xShift, y: currNode.y },
        });
      });
    });
  });
  centers.forEach((layer) => {
    layer.forEach((node) => {
      node.x += xShift;
      nodes.push(node);
    });
  });
  return { paths, nodes };
}

function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateDataset(numOfLayers?: number): Layer[] {
  const res = Array.from(Array(numOfLayers || 3).keys()).map((_) => {
    return { type: "linear", size: getRandomInt(1, 8) };
  });
  console.log(res);
  return res;
}

// Entry point, might need to replace dataset with a prop or return an update function
function FCNVisual({ fcnLayers }: { fcnLayers: FCNLayer[] }): JSX.Element {
  const nodeRef = useRef();
  const pathRef = useRef();
  const svgViewport = 1000;
  const transitionDuration = 500;

  useEffect(() => {
    console.log("updating fcn visual");
    let prevSize = 0;
    const layers: Layer[] = fcnLayers.map((layer) => {
      switch (layer.type) {
        case FCNLayerTypes.Input:
          prevSize = layer.size;
          return {
            type: layer.type as string,
            size: layer.size,
            label: "Input",
          };
        case FCNLayerTypes.Dense:
          prevSize = layer.size;
          return {
            type: layer.type as string,
            size: layer.size,
            label: layer.activation,
          };
        case FCNLayerTypes.Dropout:
          return {
            type: layer.type as string,
            size: prevSize,
            label: layer.rate.toString(),
          };
        case FCNLayerTypes.Output:
          return {
            type: layer.type as string,
            size: layer.size,
            label: "Output",
          };
        default:
          return { type: "", size: 0 };
      }
    });
    const { paths, nodes } = getPathAndNodeData(layers, 1000);
    d3.select(pathRef.current)
      .selectAll("path")
      .data(paths)
      .join(
        (enter) =>
          enter
            .append("path")
            .attr("d", (d) => {
              const cp1 = [(d.s.x + d.t.x) / 2, d.s.y];
              const cp2 = [(d.s.x + d.t.x) / 2, d.t.y];
              return (
                "M" +
                d.s.x +
                "," +
                d.s.y +
                "C" +
                cp1[0] +
                "," +
                cp1[1] +
                " " +
                cp2[0] +
                "," +
                cp2[1] +
                " " +
                d.t.x +
                "," +
                d.t.y
              );
            })
            .attr("stroke", "black")
            .attr("stroke-width", (d) => Math.random() * 0.8)
            .attr("fill", "none")
            .attr("stroke-opacity", 0)
            .call((enter) =>
              enter
                .transition()
                .duration(transitionDuration)
                .attr("stroke-opacity", 1)
            ),
        (update) =>
          update
            .attr("stroke", "black")
            .attr("stroke-opacity", 1)
            .attr("stroke-width", (d) => Math.random() * 0.8)
            .call((update) =>
              update
                .transition()
                .duration(transitionDuration)
                .attr("d", (d) => {
                  const cp1 = [(d.s.x + d.t.x) / 2, d.s.y];
                  const cp2 = [(d.s.x + d.t.x) / 2, d.t.y];
                  return (
                    "M" +
                    d.s.x +
                    "," +
                    d.s.y +
                    "C" +
                    cp1[0] +
                    "," +
                    cp1[1] +
                    " " +
                    cp2[0] +
                    "," +
                    cp2[1] +
                    " " +
                    d.t.x +
                    "," +
                    d.t.y
                  );
                })
            ),
        (exit) =>
          exit.call((exit) =>
            exit
              .transition()
              .duration(transitionDuration)
              .attr("stroke-opacity", 0)
              .remove()
          )
      );
    d3.select(nodeRef.current)
      .selectAll("circle")
      .data(nodes)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 0)
            .attr("fill", "white")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .call((enter) =>
              enter.transition().duration(transitionDuration).attr("r", 15)
            ),
        (update) =>
          update
            .attr("fill", "white")
            .attr("r", 15)
            .call((update) =>
              update
                .transition()
                .duration(transitionDuration)
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
            ),
        (exit) =>
          exit
            .attr("fill", "white")
            .call((exit) =>
              exit
                .transition()
                .duration(transitionDuration)
                .attr("r", 0)
                .style("opacity", 0)
                .remove()
            )
      );
  }, [fcnLayers]);

  return (
    <div className="h-fit overflow-auto">
      <svg
        viewBox={"0 0 " + svgViewport + " " + svgViewport}
        width="750"
        height="750"
      >
        <rect
          x="0"
          y="0"
          width={svgViewport}
          height={svgViewport}
          fill="none"
          stroke="black"
        />
        <g ref={pathRef}></g>
        <g ref={nodeRef}></g>
      </svg>
    </div>
  );
}

export default FCNVisual;
