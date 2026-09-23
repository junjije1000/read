# 상호텍스트 지도 (Intertextuality Map)

소설 속에 인용되고 반향하는 다른 작품들을 네트워크 그래프로 시각화한 독서 도구입니다.
예를 들어 무라카미 하루키의 『노르웨이의 숲』이 『위대한 개츠비』, 『마의 산』 등과
어떤 방식(모티프, 구조적 패러렐, 인유, 인용, 영향)으로 연결되어 있는지 한눈에 볼 수 있습니다.

## 주요 기능

- **네트워크 그래프 시각화**: 책을 노드로, 상호텍스트 관계를 색이 다른 엣지로 표시
- **관계 유형 분류**: 모티프 / 구조적 패러렐 / 인유 / 인용 / 영향 — 5가지 유형별 필터
- **검색**: 책 제목·원제·작가로 검색하면 그래프에서 해당 노드가 강조됨
- **상세 정보 패널**: 책을 클릭하면 줄거리와 연결된 작품들, 관계의 근거·설명이 표시됨

## 기술 스택

- Next.js 16 (App Router) + TypeScript
- Tailwind CSS
- react-force-graph-2d (D3 force-directed graph)

> **참고**: 이 프로젝트는 Next.js 16의 Turbopack 빌드에서 `next/dynamic`의 `ssr: false`
> 옵션이 정적 프리렌더링 중 `window is not defined` 오류를 일으키는 이슈가 있어,
> `package.json`의 `build`/`dev` 스크립트에 `--webpack` 플래그를 명시해 두었습니다.

## 로컬 개발

```bash
npm install
npm run dev
```

<http://localhost:3000> 에서 확인할 수 있습니다.

## 데이터 수정/확장하기

`lib/data.ts` 파일에 책(`books`)과 관계(`relations`)를 추가하면 그래프에 자동으로 반영됩니다.

```ts
// 책 추가
{
  id: "example-book",
  title: "예시 소설",
  titleOriginal: "Example Novel",
  author: "작가명",
  year: 2000,
  country: "국가",
  summary: "한 줄 줄거리...",
}

// 관계 추가 (source/target은 책의 id)
{
  source: "example-book",
  target: "norwegian-wood",
  type: "모티프", // 모티프 | 구조적 패러렐 | 인유 | 인용 | 영향
  evidence: "근거 유형 (예: 텍스트 내 명시적 언급)",
  description: "관계에 대한 설명...",
}
```

## Vercel 배포

1. 이 저장소를 GitHub에 push합니다.
2. [vercel.com](https://vercel.com)에서 **Add New → Project**로 저장소를 Import합니다.
3. 별도 설정 없이 자동으로 빌드·배포됩니다 (Framework Preset: Next.js가 자동 감지됨).
