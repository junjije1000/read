"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import dynamic from "next/dynamic";
import { buildGraph, ALL_RELATION_TYPES, recommendBooks } from "@/lib/graph";
import { RelationType } from "@/lib/types";
import SearchFilter from "@/components/SearchFilter";
import DetailPanel from "@/components/DetailPanel";

const GraphView = dynamic(() => import("@/components/GraphView"), {
  ssr: false,
  loading: () => (
    <div className="graph-loading">그래프를 그리는 중…</div>
  ),
});

const LIBRARY_STORAGE_KEY = "intertext-library";
const LIBRARY_CHANGE_EVENT = "intertext-library-change";

function subscribeToViewport(onChange: () => void) {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
}

function getIsMobileSnapshot() {
  return window.innerWidth <= 600;
}

function subscribeToLibrary(onChange: () => void) {
  window.addEventListener("storage", onChange);
  window.addEventListener(LIBRARY_CHANGE_EVENT, onChange);
  return () => {
    window.removeEventListener("storage", onChange);
    window.removeEventListener(LIBRARY_CHANGE_EVENT, onChange);
  };
}

function getLibrarySnapshot() {
  try {
    return window.localStorage.getItem(LIBRARY_STORAGE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
}

function parseLibraryIds(snapshot: string): Set<string> {
  try {
    const savedIds = JSON.parse(snapshot) as unknown;
    return Array.isArray(savedIds)
      ? new Set(savedIds.filter((id): id is string => typeof id === "string"))
      : new Set();
  } catch {
    return new Set();
  }
}

export default function Home() {
  const { nodes, links } = useMemo(() => buildGraph(), []);
  const [query, setQuery] = useState("");
  const [activeTypes, setActiveTypes] = useState<Set<RelationType>>(
    new Set(ALL_RELATION_TYPES)
  );
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [mobileListOpen, setMobileListOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(true);
  const isMobile = useSyncExternalStore(
    subscribeToViewport,
    getIsMobileSnapshot,
    () => false
  );
  const librarySnapshot = useSyncExternalStore(
    subscribeToLibrary,
    getLibrarySnapshot,
    () => "[]"
  );
  const shelfIds = useMemo(() => parseLibraryIds(librarySnapshot), [librarySnapshot]);

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

  const visibleNodes = useMemo(() => {
    if (selectedId) {
      const directIds = new Set<string>();
      filteredLinks.forEach((link) => {
        const source = link.source;
        const target = link.target;
        if (source === selectedId) directIds.add(target);
        if (target === selectedId) directIds.add(source);
      });

      const secondDegreeRelevance = new Map<string, number>();
      filteredLinks.forEach((link) => {
        const source = link.source;
        const target = link.target;
        if (directIds.has(source) && target !== selectedId && !directIds.has(target)) {
          secondDegreeRelevance.set(target, (secondDegreeRelevance.get(target) ?? 0) + 1);
        }
        if (directIds.has(target) && source !== selectedId && !directIds.has(source)) {
          secondDegreeRelevance.set(source, (secondDegreeRelevance.get(source) ?? 0) + 1);
        }
      });

      const directNodes = nodes.filter((node) => directIds.has(node.id));
      const secondDegreeNodes = nodes
        .filter((node) => secondDegreeRelevance.has(node.id))
        .sort(
          (a, b) =>
            (secondDegreeRelevance.get(b.id) ?? 0) - (secondDegreeRelevance.get(a.id) ?? 0) ||
            b.degree - a.degree
        )
        .slice(0, Math.max(0, 10 - directNodes.length));

      return [
        nodes.find((node) => node.id === selectedId),
        ...directNodes,
        ...secondDegreeNodes,
      ].filter((node): node is (typeof nodes)[number] => Boolean(node));
    }

    if (!query.trim() || !matchedIds) return [];
    if (matchedIds.size === 0) return [];

    const relevance = new Map<string, number>();
    nodes.forEach((node) => {
      relevance.set(node.id, matchedIds.has(node.id) ? 1000 : 0);
    });

    filteredLinks.forEach((link) => {
      const source = link.source;
      const target = link.target;
      if (matchedIds.has(source)) {
        relevance.set(target, (relevance.get(target) ?? 0) + 100);
      }
      if (matchedIds.has(target)) {
        relevance.set(source, (relevance.get(source) ?? 0) + 100);
      }
    });

    return nodes
      .slice()
      .sort(
        (a, b) =>
          (relevance.get(b.id) ?? 0) - (relevance.get(a.id) ?? 0) ||
          b.degree - a.degree
      )
      .slice(0, 10);
  }, [filteredLinks, matchedIds, nodes, query, selectedId]);

  const visibleIds = useMemo(
    () => new Set(visibleNodes.map((node) => node.id)),
    [visibleNodes]
  );

  const visibleLinks = useMemo(
    () =>
      filteredLinks.filter((link) => {
        const source = link.source;
        const target = link.target;
        return visibleIds.has(source) && visibleIds.has(target);
      }),
    [filteredLinks, visibleIds]
  );

  const highlightedIds = useMemo(() => {
    if (selectedId) {
      const connected = new Set<string>([selectedId]);
      visibleLinks.forEach((l) => {
        const s = l.source;
        const t = l.target;
        if (s === selectedId) connected.add(t);
        if (t === selectedId) connected.add(s);
      });
      return connected;
    }
    return matchedIds;
  }, [selectedId, matchedIds, visibleLinks]);

  const selectedNode = visibleNodes.find((n) => n.id === selectedId) ?? null;
  const listNodes = query.trim() || selectedId ? visibleNodes : nodes;
  const shelfNodes = nodes.filter((node) => shelfIds.has(node.id));
  const recommendations = useMemo(
    () => recommendBooks(nodes, links, shelfIds),
    [links, nodes, shelfIds]
  );

  const selectBook = (id: string) => {
    setSelectedId(id);
    setDetailOpen(!isMobile);
    setMobileListOpen(false);
  };

  const handleGraphSelect = (id: string | null) => {
    if (!id) {
      setSelectedId(null);
      setDetailOpen(false);
      return;
    }
    if (id === selectedId) {
      if (isMobile) setDetailOpen(true);
      else setSelectedId(null);
      return;
    }
    setSelectedId(id);
    setDetailOpen(!isMobile);
  };

  const toggleShelf = (id: string) => {
    const next = new Set(shelfIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    try {
      window.localStorage.setItem(LIBRARY_STORAGE_KEY, JSON.stringify([...next]));
    } catch {
      return;
    }
    window.dispatchEvent(new Event(LIBRARY_CHANGE_EVENT));
  };

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
          표지를 클릭해 관계를 살펴보고, 검색으로 원하는 책을 찾아보세요.
        </p>
      </header>

      <div className="app-body">
        <aside className={`sidebar ${mobileListOpen ? "sidebar--mobile-list-open" : ""}`}>
          <SearchFilter
            query={query}
            onQueryChange={(q) => {
              setQuery(q);
              setSelectedId(null);
            }}
            onSearchFocus={() => setMobileListOpen(true)}
            activeTypes={activeTypes}
            onToggleType={toggleType}
            onResetTypes={() => setActiveTypes(new Set(ALL_RELATION_TYPES))}
            resultCount={matchedIds?.size ?? 0}
          />
          <section className="library-section" aria-labelledby="library-title">
            <div className="library-heading">
              <h2 id="library-title" className="library-title">내 서재</h2>
              <span className="library-count">{shelfNodes.length}</span>
            </div>
            {shelfNodes.length === 0 ? (
              <p className="library-empty">마음에 남은 책을 담아보세요.</p>
            ) : (
              <ul className="library-list">
                {shelfNodes.map((book) => (
                  <li key={book.id} className="library-item">
                    <button
                      className="library-book"
                      onClick={() => selectBook(book.id)}
                    >
                      <span className="library-book-title">{book.title}</span>
                      <span className="library-book-author">{book.author}</span>
                    </button>
                    <button
                      className="library-remove"
                      onClick={() => toggleShelf(book.id)}
                      aria-label={`${book.title} 서재에서 제거`}
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
            {recommendations.length > 0 && (
              <div className="recommendation-section">
                <h3 className="recommendation-title">서재를 잇는 추천</h3>
                <ul className="recommendation-list">
                  {recommendations.map((book) => (
                    <li key={book.id}>
                      <button
                        className="recommendation-book"
                        onClick={() => selectBook(book.id)}
                      >
                        <span className="recommendation-book-title">{book.title}</span>
                        <span className="recommendation-book-author">{book.author}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
          <div className="book-list">
            <h3 className="book-list-title">
              {selectedId
                ? "선택한 책의 연결 작품"
                : query.trim()
                  ? "검색 관련 작품"
                  : "책 목록"} ({listNodes.length})
            </h3>
            <ul>
              {listNodes
                .slice()
                .sort((a, b) => b.degree - a.degree)
                .map((n) => (
                  <li key={n.id}>
                    <button
                      className={`book-list-item ${
                        selectedId === n.id ? "book-list-item--active" : ""
                      }`}
                      onClick={() => {
                        if (selectedId === n.id && !isMobile) {
                          setSelectedId(null);
                          setDetailOpen(false);
                          return;
                        }
                        selectBook(n.id);
                      }}
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
          {visibleNodes.length === 0 && (
            <div className="graph-empty">
              <strong>책을 선택해 문학의 연결을 탐색하세요</strong>
              <span>왼쪽 목록에서 책을 고르면 관련 작품 최대 10권이 표시됩니다.</span>
            </div>
          )}
          <GraphView
            nodes={visibleNodes}
            links={visibleLinks}
            selectedId={selectedId}
            highlightedIds={highlightedIds}
            onSelectNode={handleGraphSelect}
          />
        </section>

        <DetailPanel
          node={detailOpen ? selectedNode : null}
          allNodes={visibleNodes}
          links={visibleLinks}
          isInLibrary={selectedId ? shelfIds.has(selectedId) : false}
          onToggleLibrary={toggleShelf}
          onSelectNode={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>
    </main>
  );
}
