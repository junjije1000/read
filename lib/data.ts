import { Book, Relation } from "./types";

export const books: Book[] = [
  {
    id: "norwegian-wood",
    title: "노르웨이의 숲",
    titleOriginal: "ノルウェイの森",
    author: "무라카미 하루키",
    year: 1987,
    country: "일본",
    summary:
      "친구의 죽음 이후 상실감에 빠진 대학생 와타나베가 정신적으로 불안정한 나오코와, 생기 넘치는 미도리 사이에서 흔들리며 성장해가는 이야기. 상실과 기억, 성(性)과 죽음이 반복되는 모티프로 얽혀 있다.",
  },
  {
    id: "great-gatsby",
    title: "위대한 개츠비",
    titleOriginal: "The Great Gatsby",
    author: "F. 스콧 피츠제럴드",
    year: 1925,
    country: "미국",
    summary:
      "이룰 수 없는 사랑과 아메리칸드림의 환상을 좇다 파멸하는 개츠비의 이야기. 와타나베가 소설 속에서 가장 좋아하는 책으로 여러 차례 반복해서 읽는 작품으로 언급된다.",
  },
  {
    id: "magic-mountain",
    title: "마의 산",
    titleOriginal: "Der Zauberberg",
    author: "토마스 만",
    year: 1924,
    country: "독일",
    summary:
      "스위스 산속 결핵 요양원에 갇힌 청년 한스 카스토르프가 시간 감각을 잃고 정신적 성장을 겪는 교양소설. 세상과 단절된 요양소라는 공간이 삶과 죽음, 병에 대한 사유의 무대가 된다.",
  },
  {
    id: "catcher-in-the-rye",
    title: "호밀밭의 파수꾼",
    titleOriginal: "The Catcher in the Rye",
    author: "J.D. 샐린저",
    year: 1951,
    country: "미국",
    summary:
      "퇴학당한 소년 홀든 콜필드가 뉴욕을 방황하며 세상의 위선에 냉소하고 순수를 지키고자 몸부림치는 성장소설. 소외된 청년 화자의 독백체 서술이 이후 많은 소설에 영향을 미쳤다.",
  },
  {
    id: "tender-is-the-night",
    title: "밤은 부드러워라",
    titleOriginal: "Tender Is the Night",
    author: "F. 스콧 피츠제럴드",
    year: 1934,
    country: "미국",
    summary:
      "정신과 의사 딕 다이버와 부유한 환자 니콜의 결혼이 서서히 무너져가는 과정을 그린 작품. 이상화된 사랑이 환멸로 끝나는 피츠제럴드 특유의 모티프가 개츠비보다 더 어두운 톤으로 반복된다.",
  },
  {
    id: "death-in-venice",
    title: "베니스에서의 죽음",
    titleOriginal: "Der Tod in Venedig",
    author: "토마스 만",
    year: 1912,
    country: "독일",
    summary:
      "노년의 작가 아셴바흐가 베니스에서 만난 미소년에게 매혹되어 예술과 아름다움, 죽음에 대한 탐닉에 빠져드는 중편. 병(콜레라)과 고립이라는 토마스 만의 반복 모티프가 마의 산보다 앞서 등장한다.",
  },
  {
    id: "doctor-faustus",
    title: "파우스트 박사",
    titleOriginal: "Doktor Faustus",
    author: "토마스 만",
    year: 1947,
    country: "독일",
    summary:
      "천재 작곡가 레버퀸이 악마와 거래하듯 광기와 창조성을 맞바꾸는 이야기를 통해 독일 정신사와 파시즘의 광기를 은유한 대작. 고립된 천재라는 토마스 만의 계보를 잇는다.",
  },
  {
    id: "kafka-on-the-shore",
    title: "해변의 카프카",
    titleOriginal: "海辺のカフカ",
    author: "무라카미 하루키",
    year: 2002,
    country: "일본",
    summary:
      "가출한 15세 소년 카프카가 아버지의 저주(오이디푸스적 예언)를 피해 떠나는 여정과, 고양이와 대화하는 노인 나카타의 이야기가 교차하는 소설. 그리스 신화의 예언 모티프를 현대적으로 변주한다.",
  },
  {
    id: "oedipus-rex",
    title: "오이디푸스 왕",
    titleOriginal: "Oedipus Tyrannus",
    author: "소포클레스",
    year: -429,
    country: "고대 그리스",
    summary:
      "자신도 모른 채 아버지를 죽이고 어머니와 결혼하리라는 신탁을 피하려다 결국 그 운명을 완성하고 마는 테베 왕의 비극. 피할 수 없는 예언이라는 모티프의 원형으로 여겨진다.",
  },
  {
    id: "nineteen-eighty-four",
    title: "1984",
    titleOriginal: "Nineteen Eighty-Four",
    author: "조지 오웰",
    year: 1949,
    country: "영국",
    summary:
      "전체주의 국가 오세아니아에서 감시와 사상 통제 속에 살아가는 윈스턴 스미스가 체제에 저항하다 좌절하는 디스토피아 소설. '빅브라더'로 대표되는 전체주의 감시 사회의 원형을 제시했다.",
  },
  {
    id: "1q84",
    title: "1Q84",
    titleOriginal: "1Q84",
    author: "무라카미 하루키",
    year: 2009,
    country: "일본",
    summary:
      "1984년과 미묘하게 다른 평행세계 '1Q84년'에 발을 들인 아오마메와 덴고의 이야기. 제목 자체가 오웰의 『1984』에 대한 오마주이며, 감시와 통제라는 모티프를 신흥종교라는 다른 틀로 변주한다.",
  },
  {
    id: "demian",
    title: "데미안",
    titleOriginal: "Demian",
    author: "헤르만 헤세",
    year: 1919,
    country: "독일",
    summary:
      "싱클레어가 신비로운 친구 데미안을 만나며 기존 질서(선의 세계)를 벗어나 자기 자신에게 이르는 길을 찾아가는 성장소설. 독일 교양소설(Bildungsroman) 전통의 대표작이다.",
  },
];

export const relations: Relation[] = [
  {
    source: "norwegian-wood",
    target: "great-gatsby",
    type: "인용",
    evidence: "텍스트 내 명시적 언급",
    description:
      "와타나베는 『위대한 개츠비』를 \"제일 좋아하는 소설\"이라 말하며 이미 여러 번 읽었음에도 계속 다시 펼쳐 든다. 상실된 이상을 향한 개츠비의 집착은 나오코를 향한 와타나베의 감정과 은밀히 공명한다.",
  },
  {
    source: "norwegian-wood",
    target: "magic-mountain",
    type: "구조적 패러렐",
    evidence: "텍스트 내 명시적 언급 + 구조적 유사성",
    description:
      "와타나베는 나오코가 요양 중인 산속 요양원 '아미료'를 방문할 때 『마의 산』을 챙겨가 읽는다. 세상과 격리된 산속 요양 공간에서 시간과 죽음을 사유한다는 구조 자체가 두 작품에서 겹쳐진다.",
  },
  {
    source: "norwegian-wood",
    target: "catcher-in-the-rye",
    type: "구조적 패러렐",
    evidence: "비평적·주제적 유사성",
    description:
      "믿을 수 없는 화자에 가까운 예민한 1인칭 청년 화자가, 가까운 이의 죽음 이후 세상과 불화하며 부유하듯 성장해간다는 서사 구조가 두 소설의 오랜 비교 대상이 되어 왔다.",
  },
  {
    source: "great-gatsby",
    target: "tender-is-the-night",
    type: "모티프",
    evidence: "동일 작가의 반복 주제",
    description:
      "이상화한 사랑의 대상을 향한 집착이 결국 환멸과 파멸로 끝난다는 모티프가 피츠제럴드의 두 대표작에서 각기 다른 톤으로 반복된다.",
  },
  {
    source: "magic-mountain",
    target: "death-in-venice",
    type: "모티프",
    evidence: "동일 작가의 반복 주제",
    description:
      "질병과 죽음의 그림자 속에서 예술과 미(美), 시간에 대한 감각이 왜곡된다는 모티프가 토마스 만의 두 작품에서 공통적으로 나타난다.",
  },
  {
    source: "magic-mountain",
    target: "doctor-faustus",
    type: "영향",
    evidence: "작가적 계보·지적 영향",
    description:
      "세상으로부터 격리된 개인(요양원의 환자, 고립된 천재 작곡가)을 통해 시대정신의 위기를 은유하는 토마스 만 특유의 서사 방법론이 이어진다.",
  },
  {
    source: "kafka-on-the-shore",
    target: "oedipus-rex",
    type: "모티프",
    evidence: "텍스트 내 명시적 언급",
    description:
      "아버지를 죽이고 어머니, 누나와 관계를 맺으리라는 저주(신탁)를 피해 떠나는 소년 카프카의 여정은 오이디푸스 신화를 명시적으로 차용하며, 소설 속에서도 이 신화가 직접 언급된다.",
  },
  {
    source: "1q84",
    target: "nineteen-eighty-four",
    type: "인유",
    evidence: "제목 자체의 명시적 오마주",
    description:
      "제목부터가 오웰의 『1984』에 대한 오마주다. 국가 대신 신흥종교와 사적 폭력이 개인을 감시·통제한다는 설정으로 원작의 전체주의 모티프를 변주한다.",
  },
  {
    source: "norwegian-wood",
    target: "kafka-on-the-shore",
    type: "모티프",
    evidence: "동일 작가의 반복 모티프",
    description:
      "상실한 여성 인물과의 관계, 현실과 다른 세계 사이를 오가는 통로라는 무라카미 하루키 특유의 모티프가 두 작품에서 다른 방식으로 변주된다.",
  },
  {
    source: "norwegian-wood",
    target: "1q84",
    type: "모티프",
    evidence: "동일 작가의 반복 모티프",
    description:
      "현실과 미묘하게 어긋난 또 다른 세계, 그리고 그 속에서 서로를 찾아 헤매는 단절된 개인이라는 무라카미의 반복 모티프가 두 작품을 잇는다.",
  },
  {
    source: "catcher-in-the-rye",
    target: "demian",
    type: "구조적 패러렐",
    evidence: "비평적·주제적 유사성",
    description:
      "기존 질서(학교, 가정, 사회적 위선)로부터 소외된 청소년이 자기 자신에게 이르는 길을 찾아가는 성장 서사 구조가 두 소설에서 공통적으로 발견되며 자주 함께 논의된다.",
  },
  {
    source: "demian",
    target: "magic-mountain",
    type: "영향",
    evidence: "장르적 계보(독일 교양소설)",
    description:
      "둘 다 독일 교양소설(Bildungsroman) 전통 속에서, 기존 세계를 벗어나 정신적 여정을 통해 자아를 형성해가는 주인공을 그린다.",
  },
];
