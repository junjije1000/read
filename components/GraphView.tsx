"use client";

import { useCallback, useMemo, useRef, useEffect, useState } from "react";
import type { ComponentType, Ref } from "react";
import dynamic from "next/dynamic";
import type {
  ForceGraphMethods,
  ForceGraphProps,
  NodeObject,
  LinkObject,
} from "react-force-graph-2d";
import type { Force } from "d3-force";
import { GraphNode, GraphLink, RelationType } from "@/lib/types";

const ForceGraph2D = dynamic<ForceGraphProps<GraphNode, GraphLink>>(
  () => import("react-force-graph-2d"),
  {
    ssr: false,
  }
) as unknown as ComponentType<
  ForceGraphProps<GraphNode, GraphLink> & {
    ref?: Ref<ForceGraphMethods<GraphNode, GraphLink> | undefined>;
  }
>;

export const RELATION_COLORS: Record<RelationType, string> = {
  모티프: "#f2a541",
  "구조적 패러렐": "#5b9bd5",
  인유: "#b088e0",
  인용: "#4fb286",
  영향: "#e2694f",
};

function createCoverCollisionForce(): Force<GraphNode, undefined> {
  let forceNodes: GraphNode[] = [];
  const force = (() => {
    for (let i = 0; i < forceNodes.length; i += 1) {
      const first = forceNodes[i];
      if (first.x === undefined || first.y === undefined) continue;
      const firstRadius = 42 + Math.min(first.degree, 5) * 1.5;

      for (let j = i + 1; j < forceNodes.length; j += 1) {
        const second = forceNodes[j];
        if (second.x === undefined || second.y === undefined) continue;
        const secondRadius = 42 + Math.min(second.degree, 5) * 1.5;
        const dx = second.x - first.x;
        const dy = second.y - first.y;
        const distance = Math.sqrt(dx * dx + dy * dy) || 0.01;
        const minimumDistance = firstRadius + secondRadius;

        if (distance >= minimumDistance) continue;
        const push = ((minimumDistance - distance) / distance) * 0.5;
        const offsetX = dx * push;
        const offsetY = dy * push;
        first.vx = (first.vx ?? 0) - offsetX;
        first.vy = (first.vy ?? 0) - offsetY;
        second.vx = (second.vx ?? 0) + offsetX;
        second.vy = (second.vy ?? 0) + offsetY;
      }
    }
  }) as Force<GraphNode, undefined>;

  force.initialize = (nodes) => {
    forceNodes = nodes;
  };
  return force;
}

function createRadialLayoutForce(
  selectedId: string,
  links: GraphLink[],
  isMobile: boolean
): Force<GraphNode, undefined> {
  let forceNodes: GraphNode[] = [];
  const force = (() => {
    const center = forceNodes.find((node) => node.id === selectedId);
    if (!center || center.x === undefined || center.y === undefined) return;

    const directIds = new Set<string>();
    links.forEach((link) => {
      const source = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
      const target = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
      if (source === selectedId) directIds.add(target);
      if (target === selectedId) directIds.add(source);
    });

    const directNodes = forceNodes.filter((node) => directIds.has(node.id));
    const secondDegreeNodes = forceNodes.filter(
      (node) => node.id !== selectedId && !directIds.has(node.id)
    );
    const radius = isMobile
      ? Math.max(105, directNodes.length * 17)
      : Math.max(150, directNodes.length * 25);
    const centerX = center.x;
    const centerY = center.y;
    directNodes.forEach((node, index) => {
      if (node.x === undefined || node.y === undefined) return;
      const angle = (index / Math.max(directNodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const targetX = centerX + Math.cos(angle) * radius;
      const targetY = centerY + Math.sin(angle) * radius;
      node.vx = (node.vx ?? 0) + (targetX - node.x) * 0.06;
      node.vy = (node.vy ?? 0) + (targetY - node.y) * 0.06;
    });

    secondDegreeNodes.forEach((node, index) => {
      if (node.x === undefined || node.y === undefined) return;
      const parentIds = new Set<string>();
      links.forEach((link) => {
        const source = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
        const target = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
        if (source === node.id && directIds.has(target)) parentIds.add(target);
        if (target === node.id && directIds.has(source)) parentIds.add(source);
      });
      const parentId = [...parentIds][index % Math.max(parentIds.size, 1)];
      const parentIndex = directNodes.findIndex((directNode) => directNode.id === parentId);
      const parentAngle = (parentIndex / Math.max(directNodes.length, 1)) * Math.PI * 2 - Math.PI / 2;
      const outerRadius = radius + (isMobile ? 65 : 105);
      const targetX = centerX + Math.cos(parentAngle) * outerRadius;
      const targetY = centerY + Math.sin(parentAngle) * outerRadius;
      node.vx = (node.vx ?? 0) + (targetX - node.x) * 0.045;
      node.vy = (node.vy ?? 0) + (targetY - node.y) * 0.045;
    });
  }) as Force<GraphNode, undefined>;

  force.initialize = (nodes) => {
    forceNodes = nodes;
    const center = nodes.find((node) => node.id === selectedId);
    if (center) {
      center.fx = 0;
      center.fy = 0;
    }
  };
  return force;
}

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
  const isMobile = (dimensions?.width ?? Infinity) <= 600;
  const imageCache = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imagesLoaded, setImagesLoaded] = useState(0);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      setDimensions({ width: rect.width, height: rect.height });
    };

    update();
    if (typeof ResizeObserver === "undefined") return;
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
    nodes.forEach((node) => {
      if (!node.coverUrl || imageCache.current.has(node.id)) return;
      const image = new Image();
      image.crossOrigin = "anonymous";
      image.onload = () => {
        imageCache.current.set(node.id, image);
        setImagesLoaded((count) => count + 1);
      };
      image.src = node.coverUrl;
    });
  }, [nodes]);

  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force("charge")?.strength(isMobile ? -360 : -650);
    fg.d3Force("link")?.distance(isMobile ? 72 : 120);
    fg.d3Force("collide", createCoverCollisionForce());
    fg.d3Force(
      "radial",
      selectedId ? createRadialLayoutForce(selectedId, graphData.links, isMobile) : null
    );
    fg.d3ReheatSimulation();
  }, [graphData.links, isMobile, selectedId]);

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
    (node: NodeObject<GraphNode>, ctx: CanvasRenderingContext2D) => {
      void imagesLoaded;
      const n = node as GraphNode & { x: number; y: number };
      const isSelected = n.id === selectedId;
      const dimmed = isDimmed(n.id);
      const isDirectlyConnected = selectedId
        ? links.some((link) => {
            const source = typeof link.source === "string" ? link.source : (link.source as GraphNode).id;
            const target = typeof link.target === "string" ? link.target : (link.target as GraphNode).id;
            return (source === selectedId && target === n.id) || (target === selectedId && source === n.id);
          })
        : true;
      const width = (isSelected ? 34 : 28) + Math.min(n.degree, 5) * 1.5;
      const height = width * 1.45;
      const image = imageCache.current.get(n.id);

      ctx.globalAlpha = dimmed ? 0.15 : isDirectlyConnected || isSelected ? 1 : 0.38;

      ctx.fillStyle = "#2b2520";
      ctx.fillRect(n.x - width / 2 - 2, n.y - height / 2 - 2, width + 4, height + 4);
      if (image) {
        ctx.drawImage(image, n.x - width / 2, n.y - height / 2, width, height);
      } else {
        ctx.fillStyle = isSelected ? "#f2c14e" : "#e9e2d0";
        ctx.fillRect(n.x - width / 2, n.y - height / 2, width, height);
      }
      ctx.lineWidth = isSelected ? 2.5 : 1;
      ctx.strokeStyle = isSelected ? "#f2c14e" : "#8a7f68";
      ctx.strokeRect(n.x - width / 2, n.y - height / 2, width, height);

      ctx.globalAlpha = 1;
    },
    [selectedId, isDimmed, imagesLoaded, links]
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
            const width = 28 + Math.min(n.degree, 5) * 1.5 + 8;
            const height = width * 1.45;
            ctx.fillStyle = color;
            ctx.fillRect(n.x - width / 2, n.y - height / 2, width, height);
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
            onSelectNode(n.id);
          }}
          onBackgroundClick={() => onSelectNode(null)}
          cooldownTicks={160}
          onEngineStop={() => fgRef.current?.zoomToFit(400, 60)}
        />
      )}
    </div>
  );
}
