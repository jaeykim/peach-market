# Peach Market

대학가 월세 · 단기임대 · 전대 마켓플레이스

## 빠른 시작

```bash
git clone <repo-url> && cd peach-market
./scripts/setup.sh
npm run dev
```

`setup.sh`가 의존성 설치, 환경 변수 생성, DB 초기화, 시드 데이터 투입을 자동으로 처리합니다.

http://localhost:3000 에서 확인하세요.

## 수동 세팅

자동 스크립트 대신 직접 세팅하려면:

```bash
npm install
cp .env.example .env   # JWT_SECRET 값을 변경하세요
npx prisma migrate dev
npx prisma db seed
npm run dev
```

## 환경 변수

| 변수 | 필수 | 설명 |
|------|------|------|
| `DATABASE_URL` | O | SQLite 경로 (기본: `file:./dev.db`) |
| `JWT_SECRET` | O | 세션 서명 키 (setup.sh가 자동 생성) |
| `NEXT_PUBLIC_NAVER_MAP_CLIENT_ID` | - | 네이버 지도 API 클라이언트 ID |
| `ANTHROPIC_API_KEY` | - | AI 적정가 산정용 Anthropic API 키 |

## 데모 계정

비밀번호는 모두 `password123` 입니다.

| 이메일 | 이름 | 역할 |
|--------|------|------|
| landlord1@peach.market | 박주인 | 집주인 |
| landlord2@peach.market | 김건물 | 집주인 |
| landlord3@peach.market | 이원룸 | 집주인 |
| student1@peach.market | 홍학생 | 학생 |
| student2@peach.market | 최신입 | 학생 |
| student3@peach.market | 정교환 | 학생 |
| student4@peach.market | 윤인턴 | 학생 |

## 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 |
| `npm run build` | 프로덕션 빌드 |
| `npm run lint` | ESLint 검사 |
| `./scripts/setup.sh` | 개발 환경 자동 세팅 |
| `./scripts/deploy.sh` | 운영 서버 배포 |

## 기술 스택

Next.js 14 · React 18 · TypeScript · Tailwind CSS · Prisma · SQLite
