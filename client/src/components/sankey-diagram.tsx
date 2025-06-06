import { useEffect, useRef } from "react";
import * as d3 from "d3";
import { type FunnelData } from "@shared/schema";

interface SankeyDiagramProps {
  data: FunnelData;
  width?: number;
  height?: number;
}

export function SankeyDiagram({ data, width = 800, height = 400 }: SankeyDiagramProps) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    if (!svgRef.current || !data.nodes.length) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Create a simple node-link diagram since D3 sankey is complex
    const margin = { top: 20, right: 120, bottom: 20, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Position nodes in columns based on their type
    const nodePositions = new Map();
    
    // Define node positions
    const discoveryNodes = data.nodes.filter(n => n.name.includes("Discovery"));
    const closingNodes = data.nodes.filter(n => n.name.includes("Closing"));
    const outcomeNodes = data.nodes.filter(n => n.name === "Won" || n.name === "Lost");

    const columnWidth = innerWidth / 4;
    const nodeHeight = 40;
    const nodeSpacing = (innerHeight - discoveryNodes.length * nodeHeight) / (discoveryNodes.length + 1);

    // Position discovery nodes
    discoveryNodes.forEach((node, i) => {
      nodePositions.set(node.id, {
        x: 0,
        y: nodeSpacing + i * (nodeHeight + nodeSpacing),
        width: 150,
        height: nodeHeight
      });
    });

    // Position closing nodes
    closingNodes.forEach((node, i) => {
      nodePositions.set(node.id, {
        x: columnWidth * 2,
        y: nodeSpacing + i * (nodeHeight + nodeSpacing),
        width: 150,
        height: nodeHeight
      });
    });

    // Position outcome nodes
    outcomeNodes.forEach((node, i) => {
      nodePositions.set(node.id, {
        x: columnWidth * 3,
        y: innerHeight / 4 + i * (innerHeight / 2),
        width: 100,
        height: nodeHeight
      });
    });

    // Draw links
    data.links.forEach(link => {
      const sourcePos = nodePositions.get(link.source);
      const targetPos = nodePositions.get(link.target);
      
      if (sourcePos && targetPos) {
        const path = d3.path();
        path.moveTo(sourcePos.x + sourcePos.width, sourcePos.y + sourcePos.height / 2);
        
        const controlPointX = (sourcePos.x + sourcePos.width + targetPos.x) / 2;
        path.bezierCurveTo(
          controlPointX, sourcePos.y + sourcePos.height / 2,
          controlPointX, targetPos.y + targetPos.height / 2,
          targetPos.x, targetPos.y + targetPos.height / 2
        );

        g.append("path")
          .attr("d", path.toString())
          .attr("stroke", "#CBD5E1")
          .attr("stroke-width", Math.max(2, link.value * 2))
          .attr("fill", "none")
          .attr("opacity", 0.6);
      }
    });

    // Draw nodes
    data.nodes.forEach(node => {
      const pos = nodePositions.get(node.id);
      if (!pos || node.value === 0) return;

      const nodeColor = 
        node.name === "Won" ? "#10B981" :
        node.name === "Lost" ? "#EF4444" :
        node.name.includes("Discovery") ? "#2563EB" :
        "#F59E0B";

      g.append("rect")
        .attr("x", pos.x)
        .attr("y", pos.y)
        .attr("width", pos.width)
        .attr("height", pos.height)
        .attr("fill", nodeColor)
        .attr("rx", 6)
        .attr("opacity", 0.8);

      g.append("text")
        .attr("x", pos.x + pos.width / 2)
        .attr("y", pos.y + pos.height / 2 - 5)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "12px")
        .attr("font-weight", "500")
        .text(node.name);

      g.append("text")
        .attr("x", pos.x + pos.width / 2)
        .attr("y", pos.y + pos.height / 2 + 10)
        .attr("text-anchor", "middle")
        .attr("fill", "white")
        .attr("font-size", "11px")
        .text(`${node.value}`);
    });

  }, [data, width, height]);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="min-w-full"
      />
    </div>
  );
}
