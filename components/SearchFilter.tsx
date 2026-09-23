"use client";

import { RelationType } from "@/lib/types";
import { ALL_RELATION_TYPES } from "@/lib/graph";
import { RELATION_COLORS } from "./GraphView";

interface SearchFilterProps {
  query: string;
  onQueryChange: (q: string) => void;
  activeTypes: Set<RelationType>;
  onToggleType: (t: RelationType) => void;
  onResetTypes: () => void;
  resultCount: number;
  onSearchFocus?: () => void;
}

export default function SearchFilter({
  query,
  onQueryChange,
  activeTypes,
  onToggleType,
  onResetTypes,
  resultCount,
  onSearchFocus,
}: SearchFilterProps) {
  const allActive = activeTypes.size === ALL_RELATION_TYPES.length;

  return (
    <div className="search-filter">
      <div className="search-box">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          onFocus={onSearchFocus}
          placeholder="책 제목이나 작가로 검색…"
          className="search-input"
          aria-label="책 검색"
        />
        {query && (
          <button
            className="search-clear"
            onClick={() => onQueryChange("")}
            aria-label="검색어 지우기"
          >
            ✕
          </button>
        )}
      </div>
      {query && (
        <p className="search-result-count">{resultCount}권 검색됨</p>
      )}

      <div className="filter-section">
        <div className="filter-header">
          <span className="filter-title">관계 유형</span>
          <button className="filter-reset" onClick={onResetTypes}>
            {allActive ? "전체 선택됨" : "전체 보기"}
          </button>
        </div>
        <div className="filter-chips">
          {ALL_RELATION_TYPES.map((type) => {
            const active = activeTypes.has(type);
            const color = RELATION_COLORS[type];
            return (
              <button
                key={type}
                className={`filter-chip ${active ? "filter-chip--active" : ""}`}
                style={
                  active
                    ? { borderColor: color, backgroundColor: color + "26", color: "#f4efe4" }
                    : undefined
                }
                onClick={() => onToggleType(type)}
              >
                <span
                  className="filter-chip-dot"
                  style={{ backgroundColor: color }}
                />
                {type}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
