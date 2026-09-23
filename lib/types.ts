export type RelationType =
  | "모티프"
  | "구조적 패러렐"
  | "인유"
  | "인용"
  | "영향";

export interface Book {
  id: string;
  title: string;
  titleOriginal: string;
  author: string;
  year: number;
  country: string;
  summary: string;
  themes?: string[];
  form?: string;
  context?: string;
  coverUrl?: string;
}

export interface Relation {
  source: string;
  target: string;
  type: RelationType;
  evidence: string;
  description: string;
}

export interface GraphNode extends Book {
  id: string;
  x?: number;
  y?: number;
  vx?: number;
  vy?: number;
  fx?: number;
  fy?: number;
  degree: number;
}

export interface GraphLink {
  source: string;
  target: string;
  type: RelationType;
  evidence: string;
  description: string;
}
