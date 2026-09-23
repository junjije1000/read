import { books, relations } from "./data";
import { GraphLink, GraphNode, RelationType } from "./types";

export function buildGraph(): { nodes: GraphNode[]; links: GraphLink[] } {
  const degree: Record<string, number> = {};
  relations.forEach((r) => {
    degree[r.source] = (degree[r.source] ?? 0) + 1;
    degree[r.target] = (degree[r.target] ?? 0) + 1;
  });

  const nodes: GraphNode[] = books.map((b) => ({
    ...b,
    degree: degree[b.id] ?? 0,
  }));

  const links: GraphLink[] = relations.map((r) => ({ ...r }));

  return { nodes, links };
}

export function formatYear(year: number): string {
  if (year < 0) return `기원전 ${Math.abs(year)}년`;
  return `${year}년`;
}

export const ALL_RELATION_TYPES: RelationType[] = [
  "모티프",
  "구조적 패러렐",
  "인유",
  "인용",
  "영향",
];

export function neighborsOf(
  id: string,
  links: GraphLink[]
): { neighborId: string; link: GraphLink }[] {
  const result: { neighborId: string; link: GraphLink }[] = [];
  links.forEach((l) => {
    const source = l.source;
    const target = l.target;
    if (source === id) result.push({ neighborId: target, link: l });
    if (target === id) result.push({ neighborId: source, link: l });
  });
  return result;
}

export function recommendBooks(
  nodes: GraphNode[],
  links: GraphLink[],
  shelfIds: Set<string>,
  limit = 3
): GraphNode[] {
  if (shelfIds.size === 0) return [];

  const connections = new Map<string, Set<string>>();
  const relationTypes = new Map<string, Set<RelationType>>();

  links.forEach((link) => {
    const sourceIsOnShelf = shelfIds.has(link.source);
    const targetIsOnShelf = shelfIds.has(link.target);
    if (sourceIsOnShelf === targetIsOnShelf) return;

    const candidateId = sourceIsOnShelf ? link.target : link.source;
    const shelfId = sourceIsOnShelf ? link.source : link.target;
    if (!connections.has(candidateId)) connections.set(candidateId, new Set());
    if (!relationTypes.has(candidateId)) relationTypes.set(candidateId, new Set());
    connections.get(candidateId)?.add(shelfId);
    relationTypes.get(candidateId)?.add(link.type);
  });

  return nodes
    .filter((node) => !shelfIds.has(node.id) && connections.has(node.id))
    .sort((a, b) => {
      const connectionScore =
        (connections.get(b.id)?.size ?? 0) - (connections.get(a.id)?.size ?? 0);
      if (connectionScore !== 0) return connectionScore;

      const relationVariety =
        (relationTypes.get(b.id)?.size ?? 0) - (relationTypes.get(a.id)?.size ?? 0);
      return relationVariety || b.degree - a.degree;
    })
    .slice(0, limit);
}
