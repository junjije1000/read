"use client";

import { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { buildGraph, ALL_RELATION_TYPES } from "@/lib/graph";
import { RelationType } from "@/lib/types";
import SearchFilter from "@/components/SearchFilter";
import DetailPanel from "@/components/DetailPanel";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="graph-loading">그래프를 그리는 중…</div>
  ),
});

export default function Home() {
  const { nodes, links } = useMemo(() => buildGraph(), []);
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<RelationType>>(
    new Set(ALL_RELATION_TYPES)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filteredLinks = useMemo(
    () => links.filter((l) => activeTypes.has(l.type)),
    [links, activeTypes]
  );

  const matchedIds = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    return new Set(
      nodes
        .filter(
          (n) =>
            n.title.toLowerCase().includes(q) ||
            n.titleOriginal.toLowerCase().includes(q) ||
            n.author.toLowerCase().includes(q)
        )
        .map((n) => n.id)
    );
  }, [nodes, query]);

  const highlightedIds = useMemo(() => {
    if (selectedId) {
      const connected = new Set<string>([selectedId]);
      filteredLinks.forEach((l) => {
        const s = typeof l.source === "string" ? l.source : (l.source as any).id;
        const t = typeof l.target === "string" ? l.target : (l.target as any).id;
        if (s === selectedId) connected.add(t);
        if (t === selectedId) connected.add(s);
      });
      return connected;
    }
    return matchedIds;
  }, [selectedId, matchedIds, filteredLinks]);

  const selectedNode = nodes.find((n) => n.id === selectedId) ?? null;

  const toggleType = (t: RelationType) => {
    setActiveTypes((prev) => {
      const next = new Set(prev);
      if (next.has(t)) {
        next.delete(t);
      } else {
        next.add(t);
      }
      if (next.size === 0) return new Set(ALL_RELATION_TYPES);
      return next;
    });
  };

  return (
    <main className="app-shell">
      <header className="app-header">
        <div>
          <h1 className="app-title">상호텍스트 지도</h1>
          <p className="app-subtitle">
            소설 속에 숨은 다른 소설들 — 모티프와 인용으로 연결된 문학의 그물
          </p>
        </div>
        <p className="app-hint">
          점을 클릭해 관계를 살펴보고, 검색으로 원하는 책을 찾아보세요.
        </p>
      </header>

      <div className="app-body">
        <aside className="sidebar">
          <SearchFilter
            query={query}
            onQueryChange={(q) => {
              setQuery(q);
              setSelectedId(null);
            }}
            activeTypes={activeTypes}
            onToggleType={toggleType}
            onResetTypes={() => setActiveTypes(new Set(ALL_RELATION_TYPES))}
            resultCount={matchedIds?.size ?? 0}
          />
          <div className="book-list">
            <h3 className="book-list-title">전체 작품 ({nodes.length})</h3>
            <ul>
              {nodes
                .slice()
                .sort((a, b) => b.degree - a.degree)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      className={`book-list-item ${
                        selectedId === n.id ? "book-list-item--active" : ""
                      }`}
                      onClick={() =>
                        setSelectedId(selectedId === n.id ? null : n.id)
                      }
                    >
                      <span className="book-list-item-title">{n.title}</span>
                      <span className="book-list-item-author">
                        {n.author}
                      </span>
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        </aside>

        <section className="graph-area">
          <GraphView
            nodes={nodes}
            links={filteredLinks}
            selectedId={selectedId}
            highlightedIds={highlightedIds}
            onSelectNode={setSelectedId}
          />
        </section>

        <DetailPanel
          node={selectedNode}
          allNodes={nodes}
          links={filteredLinks}
          onSelectNode={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </main>
  );
}
