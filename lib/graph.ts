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
    const source = typeof l.source === "string" ? l.source : (l.source as any).id;
    const target = typeof l.target === "string" ? l.target : (l.target as any).id;
    if (source === id) result.push({ neighborId: target, link: l });
    if (target === id) result.push({ neighborId: source, link: l });
  });
  return result;
}
