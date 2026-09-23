"use client";

import { GraphNode, GraphLink } from "@/lib/types";
import { formatYear, neighborsOf } from "@/lib/graph";
import { RELATION_COLORS } from "./GraphView";

interface DetailPanelProps {
  node: GraphNode | null;
  allNodes: GraphNode[];
  links: GraphLink[];
  onSelectNode: (id: string) => void;
  onClose: () => void;
}

export default function DetailPanel({
  node,
  allNodes,
  links,
  onSelectNode,
  onClose,
}: DetailPanelProps) {
  if (!node) {
    return (
      <aside className="detail-panel detail-panel--empty">
        <p className="detail-empty-text">
          그래프에서 책을 클릭하면
          <br />
          상세 정보와 연결된 작품들이 여기에 표시됩니다.
        </p>
      </aside>
    );
  }

  const neighbors = neighborsOf(node.id, links);
  const nodeMap = new Map(allNodes.map((n) => [n.id, n]));

  return (
    <aside className="detail-panel">
      <button className="detail-close" onClick={onClose} aria-label="닫기">
        ✕
      </button>
      <div className="detail-header">
        <p className="detail-country">
          {node.country} · {formatYear(node.year)}
        </p>
        <h2 className="detail-title">{node.title}</h2>
        <p className="detail-original">{node.titleOriginal}</p>
        <p className="detail-author">{node.author}</p>
      </div>

      <p className="detail-summary">{node.summary}</p>

      <div className="detail-relations">
        <h3 className="detail-relations-title">
          연결된 작품 ({neighbors.length})
        </h3>
        <ul className="relation-list">
          {neighbors.map(({ neighborId, link }, i) => {
            const neighbor = nodeMap.get(neighborId);
            if (!neighbor) return null;
            const color = RELATION_COLORS[link.type];
            return (
              <li key={i} className="relation-item">
                <button
                  className="relation-item-header"
                  onClick={() => onSelectNode(neighborId)}
                >
                  <span
                    className="relation-badge"
                    style={{ backgroundColor: color }}
                  >
                    {link.type}
                  </span>
                  <span className="relation-neighbor-title">
                    {neighbor.title}
                  </span>
                </button>
                <p className="relation-evidence">근거: {link.evidence}</p>
                <p className="relation-description">{link.description}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
