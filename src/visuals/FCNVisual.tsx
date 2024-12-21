import {
  DownloadOutlined,
  DownOutlined,
  FullscreenExitOutlined,
  FullscreenOutlined,
  StopOutlined,
  UpOutlined,
} from "@ant-design/icons";
import { Button, Segmented, Tooltip } from "antd";
import * as d3 from "d3";
import { useEffect, useRef, useState } from "react";
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

type Annotation = {
  x: number;
  y: number;
  text: string;
};

function getNodeCenter(layerInd: number, nodeNum: number): Point {
  return { x: layerInd * 300 + 100, y: nodeNum * 75 + 25 };
}

function getCollapsedCenters(a: Point, b: Point): Point[] {
  const collapsed: Point[] = [];
  collapsed.push({ x: a.x, y: (a.y + b.y) / 2 });
  collapsed.push({ x: a.x, y: collapsed[0].y - 20 });
  collapsed.push({ x: a.x, y: collapsed[0].y + 20 });
  return collapsed;
}

const SPLIT_THRESHOLD = 10; // Keep this even
function getLayerNodes(
  layer: Layer,
  layerInd: number
): {
  nodes: Point[];
  layerCenter: Point;
  collapsed: Point[];
  annotation: string;
} {
  const nodes: Point[] = [];
  const collapsed: Point[] = [];
  if (layer.size > SPLIT_THRESHOLD) {
    for (let i = 0; i < SPLIT_THRESHOLD; i++) {
      nodes.push(getNodeCenter(layerInd, i < SPLIT_THRESHOLD / 2 ? i : i + 1));
    }
    collapsed.push(
      ...getCollapsedCenters(
        nodes[SPLIT_THRESHOLD / 2 - 1],
        nodes[SPLIT_THRESHOLD / 2]
      )
    );
  } else {
    for (let i = 0; i < layer.size; i++) {
      nodes.push(getNodeCenter(layerInd, i));
    }
  }
  const layerCenter = {
    x: (nodes[0].x + nodes[nodes.length - 1].x) / 2,
    y: (nodes[0].y + nodes[nodes.length - 1].y) / 2,
  };
  return { nodes, layerCenter, collapsed, annotation: layer.size.toString() };
}


function getPathAndNodeData(
  dataset: Layer[],
  xViewBox: number,
  yViewBox: number
): {
  paths: Path[];
  nodes: Point[];
  collapsed: Point[];
  annotations: Annotation[];
} {
  const centers: Point[][] = [];
  const paths: Path[] = [];
  const nodes: Point[] = [];
  const collapsedByLayer: Point[][] = [];
  const annotations: Annotation[] = [];
  let minX: number = Number.MAX_SAFE_INTEGER;
  let maxX: number = Number.MIN_SAFE_INTEGER;
  let maxY: number = Number.MIN_SAFE_INTEGER;
  const xCenter = xViewBox / 2;
  const yCenter = yViewBox / 2;
  dataset.forEach((layer, layerInd) => {
    const { nodes, layerCenter, collapsed, annotation } = getLayerNodes(
      layer,
      layerInd
    );
    const yShift = yCenter - layerCenter.y;
    // Y-shift and add nodes by layer
    centers.push(
      nodes.map((node) => {
        node.y += yShift;
        return node;
      })
    );
    // Y-shift and add collapsed nodes by layer
    collapsedByLayer.push(
      collapsed.map((node) => {
        node.y += yShift;
        return node;
      })
    );
    annotations.push({ x: layerCenter.x, y: 0, text: annotation });
    minX = Math.min(minX, layerCenter.x);
    maxX = Math.max(maxX, layerCenter.x);
    maxY = Math.max(maxY, nodes[nodes.length - 1].y);
  });
  const xShift = xCenter - (minX + maxX) / 2;
  // Generate x-shifted paths
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
  // X-shift and add nodes
  centers.forEach((layer) => {
    layer.forEach((node) => {
      node.x += xShift;
      nodes.push(node);
    });
  });
  // X-shift and add collapsed nodes
  const collapsed: Point[] = [];
  collapsedByLayer.forEach((layer) => {
    layer.forEach((node) => {
      node.x += xShift;
      collapsed.push(node);
    });
  });
  annotations.forEach((annotation) => {
    annotation.x += xShift;
    annotation.y = maxY + 70;
  });
  return { paths, nodes, collapsed, annotations };
}

// Entry point, might need to replace dataset with a prop or return an update function
function FCNVisual({
  configRef,
  dlRef,
  fcnLayers,
  toggleMaximize,
  maximizeState,
}: {
  configRef: React.MutableRefObject<null>;
  dlRef: React.MutableRefObject<null>;
  fcnLayers: FCNLayer[];
  toggleMaximize: () => void;
  maximizeState: boolean;
}): JSX.Element {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<SVGGElement>(null);
  const pathRef = useRef<SVGGElement>(null);
  const nodeRef = useRef<SVGGElement>(null);
  const collapsedRef = useRef<SVGGElement>(null);
  const annotationRef = useRef<SVGGElement>(null);
  const xViewBox = 300 * fcnLayers.length,
    yViewBox = 1200;
  const transitionDuration = 500;

  const downloadSceneAsImage = () => {
    const svg = document.querySelector("#fcn-visual") as SVGElement;

    if (svg) {
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svg);
      const svgBlob = new Blob([svgData], {
        type: "image/svg+xml;charset=utf-8",
      });
      const svgUrl = URL.createObjectURL(svgBlob);

      const canvas = document.createElement("canvas");
      const img = new Image();
      const width = xViewBox;
      const height = yViewBox;
      canvas.width = width;
      canvas.height = height;

      img.onload = () => {
        const context = canvas.getContext("2d");
        if (context) {
          context.clearRect(0, 0, width, height);
          context.drawImage(img, 0, 0, width, height);

          const pngUrl = canvas.toDataURL("image/png");

          const link = document.createElement("a");
          link.setAttribute("download", "fcn-viz.png");
          link.setAttribute("href", pngUrl);
          link.click();
          URL.revokeObjectURL(svgUrl);
        }
      };

      img.src = svgUrl;
    } else {
      console.error("SVG element not found");
    }
  };

  useEffect(() => {
    if (!wrapperRef.current || !groupRef.current) return;
    const layers: Layer[] = fcnLayers.flatMap((layer) => {
      switch (layer.type) {
        case FCNLayerTypes.Input:
          return [{
            type: layer.type as string,
            size: layer.size,
            label: "Input",
          }];
        case FCNLayerTypes.Dense:
          prevSize = layer.size;
          return [
            {
              type: layer.type as string,
              size: layer.size,
              label: layer.activation,
            },
          ];
        case FCNLayerTypes.Dropout:
          return [];
        case FCNLayerTypes.Output:
          return {
            type: layer.type as string,
            size: layer.size,
            label: "Output",
          };
        default:
          return [];
      }
    });
    const wrapper = d3.select(wrapperRef.current);
    const zoomGroup = d3.select(groupRef.current);
    const zoomBehavior = d3.zoom<HTMLDivElement, unknown>()
      .scaleExtent([0.5, 3]) // Zoom limits
      .on("zoom", (event) => {
        // Apply the transform to the parent `<g>`
        zoomGroup.attr("transform", event.transform);
      });
    wrapper.call(zoomBehavior as d3.ZoomBehavior<HTMLDivElement, unknown>);
    const { paths, nodes, collapsed, annotations } = getPathAndNodeData(
      layers,
      xViewBox,
      yViewBox
    );
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
            .attr("stroke-width", () => Math.random() * 0.8)
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
            // .attr("stroke-width", (d) => Math.random() * 0.8)
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
    d3.select(collapsedRef.current)
      .selectAll("circle")
      .data(collapsed)
      .join(
        (enter) =>
          enter
            .append("circle")
            .attr("cx", (d) => d.x)
            .attr("cy", (d) => d.y)
            .attr("r", 0)
            .attr("fill", "black")
            .attr("stroke", "black")
            .attr("stroke-width", 2)
            .call((enter) =>
              enter.transition().duration(transitionDuration).attr("r", 5)
            ),
        (update) =>
          update
            .attr("fill", "black")
            .attr("r", 5)
            .call((update) =>
              update
                .transition()
                .duration(transitionDuration)
                .attr("cx", (d) => d.x)
                .attr("cy", (d) => d.y)
            ),
        (exit) =>
          exit
            // .attr("fill", "white")
            // .attr("stroke", "white")
            .call((exit) =>
              exit
                .transition()
                .duration(transitionDuration)
                .attr("r", 0)
                .style("opacity", 0)
                .remove()
            )
      );
    d3.select(annotationRef.current)
      .selectAll("text")
      .data(annotations)
      .join(
        // Enter: Add new text elements
        (enter) =>
          enter
            .append("text")
            .attr("x", (d) => d.x)
            .attr("y", (d) => (showText === "down" ? d.y : yViewBox - d.y))
            .attr("fill", "black")
            .attr("opacity", 0)
            .attr("font-size", 30)
            .attr("font-family", "JetBrainsMono, monospace")
            .attr("text-anchor", "middle")
            .text((d) => d.text)
            .call((enter) =>
              enter
                .transition()
                .duration(transitionDuration)
                .attr("opacity", showText === "none" ? 0 : 1)
            ),
        // Update: Modify existing text elements
        (update) =>
          update
            .text((d) => d.text)
            .call((update) =>
              update
                .transition()
                .duration(transitionDuration)
                .attr("opacity", showText === "none" ? 0 : 1)
                .attr("x", (d) => d.x)
                .attr("y", (d) => (showText === "down" ? d.y : yViewBox - d.y))
            ),
        // Exit: Remove unused text elements
        (exit) =>
          exit.call((exit) =>
            exit
              .transition()
              .duration(transitionDuration)
              .attr("opacity", 0)
              .remove()
          )
      );
    return () => {
      wrapper.on(".zoom", null); // Clean up zoom behavior on unmount
    };
  }, [fcnLayers, showText]);

  return (
    <div
      className="h-full w-full overflow-clip relative border-2 border-black"
      style={{ background: "#f0f0f0" }}
      ref={wrapperRef}
    >
      <Segmented
        ref={configRef}
        key={1}
        className="absolute m-2 z-10 border-slate-500 border-2"
        vertical
        options={[
          { value: "none", icon: <StopOutlined /> },
          { value: "up", icon: <UpOutlined /> },
          { value: "down", icon: <DownOutlined /> },
        ]}
        value={showText}
        onChange={(value) => {
          setShowText(value as AnnotationAlignment);
        }}
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
      <svg
        viewBox={"0 0 " + xViewBox + " " + yViewBox}
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        className="z-0"
        id="fcn-visual"
      >
        <rect x="0" y="0" width="100%" height="100%" fill="#f0f0f0" />
        <g className="zoom-group" ref={groupRef}>
          <g ref={pathRef}></g>
          <g ref={nodeRef}></g>
          <g ref={collapsedRef}></g>
          <g ref={annotationRef}></g>
        </g>
      </svg>
    </div>
  );
}

export default FCNVisual;
