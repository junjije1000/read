"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import ForceGraph2D, {
  ForceGraphMethods,
  NodeObject,
  LinkObject,
} from "react-force-graph-2d";
import { GraphNode, GraphLink, RelationType } from "@/lib/types";

export const RELATION_COLORS: Record<RelationType, string> = {
  모티프: "#f2a541",
  "구조적 패러렐": "#5b9bd5",
  인유: "#b088e0",
  인용: "#4fb286",
  영향: "#e2694f",
};

interface GraphViewProps {
  nodes: GraphNode[];
  links: GraphLink[];
  selectedId: string | null;
  highlightedIds: Set<string> | null;
  onSelectNode: (id: string | null) => void;
}

export default function GraphView({
  nodes,
  links,
  selectedId,
  highlightedIds,
  onSelectNode,
}: GraphViewProps) {
  const fgRef = useRef<ForceGraphMethods<GraphNode, GraphLink> | undefined>(
    undefined
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState<{ width: number; height: number } | null>(
    null
  );

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const graphData = useMemo(
    () => ({
      nodes: nodes.map((n) => ({ ...n })),
      links: links.map((l) => ({ ...l })),
    }),
    [nodes, links]
  );

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(-260);
    fg.d3Force("link")?.distance(120);
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    const fg = fgRef.current;
    if (!fg) return;
    const node = graphData.nodes.find((n) => n.id === selectedId) as
      | (GraphNode & { x?: number; y?: number })
      | undefined;
    if (node && node.x !== undefined && node.y !== undefined) {
      fg.centerAt(node.x, node.y, 600);
    }
  }, [selectedId, graphData.nodes]);

  const isDimmed = useCallback(
    (id: string) => {
      if (!highlightedIds) return false;
      return !highlightedIds.has(id);
    },
    [highlightedIds]
  );

  const nodeCanvasObject = useCallback(
    (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D, scale: number) => {
      const n = node as GraphNode & { x: number; y: number };
      const label = n.title;
      const isSelected = n.id === selectedId;
      const dimmed = isDimmed(n.id);
      const baseRadius = 6 + Math.min(n.degree, 6) * 1.4;
      const radius = isSelected ? baseRadius + 3 : baseRadius;

      ctx.globalAlpha = dimmed ? 0.15 : 1;

      // node circle
      ctx.beginPath();
      ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false);
      ctx.fillStyle = isSelected ? "#f2c14e" : "#e9e2d0";
      ctx.fill();
      ctx.lineWidth = isSelected ? 2.5 : 1.2;
      ctx.strokeStyle = isSelected ? "#f2c14e" : "#8a7f68";
      ctx.stroke();

      // label: fixed size in graph-space units, so it naturally shrinks when
      // zoomed out and grows when zoomed in, without runaway values.
      const fontSize = 5.5;
      ctx.font = `${n.author.includes("무라카미") ? "600" : "500"} ${fontSize}px "Pretendard", "Noto Sans KR", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "top";
      ctx.fillStyle = dimmed ? "#7a7460" : "#2b2620";
      ctx.fillText(label, n.x, n.y + radius + 3);

      ctx.globalAlpha = 1;
    },
    [selectedId, isDimmed]
  );

  const linkColor = useCallback(
    (link: LinkObject<GraphNode, GraphLink>) => {
      const l = link as GraphLink & {
        source: string | GraphNode;
        target: string | GraphNode;
      };
      const sourceId =
        typeof l.source === "string" ? l.source : (l.source as GraphNode).id;
      const targetId =
        typeof l.target === "string" ? l.target : (l.target as GraphNode).id;
      const dimmed =
        highlightedIds &&
        (!highlightedIds.has(sourceId) || !highlightedIds.has(targetId));
      const color = RELATION_COLORS[l.type] ?? "#999";
      if (dimmed) return color + "22";
      return color;
    },
    [highlightedIds]
  );

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {dimensions && dimensions.width > 0 && dimensions.height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={dimensions.width}
          height={dimensions.height}
          graphData={graphData}
          nodeId="id"
          nodeLabel={() => ""}
          nodeCanvasObject={nodeCanvasObject}
          nodePointerAreaPaint={(node, color, ctx) => {
            const n = node as GraphNode & { x: number; y: number };
            const radius = 6 + Math.min(n.degree, 6) * 1.4 + 4;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(n.x, n.y, radius, 0, 2 * Math.PI, false);
            ctx.fill();
          }}
          linkColor={linkColor}
          linkWidth={(link) => {
            const l = link as GraphLink;
            return l.type === "인용" || l.type === "인유" ? 2.4 : 1.6;
          }}
          linkDirectionalArrowLength={5}
          linkDirectionalArrowRelPos={1}
          linkCurvature={0.12}
          backgroundColor="#161310"
          onNodeClick={(node) => {
            const n = node as GraphNode;
            onSelectNode(selectedId === n.id ? null : n.id);
          }}
          onBackgroundClick={() => onSelectNode(null)}
          cooldownTicks={100}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
        />
      )}
    </div>
  );
}
