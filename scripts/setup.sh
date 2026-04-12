#!/usr/bin/env bash
# 개발 환경 자동 세팅 스크립트
# Usage: ./scripts/setup.sh
set -e

cd "$(dirname "$0")/.."

# ─── 색상 ───
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[OK]${NC} $1"; }
warn()  { echo -e "${YELLOW}[!]${NC} $1"; }
fail()  { echo -e "${RED}[ERROR]${NC} $1"; exit 1; }

echo ""
echo "  peach-market 개발 환경 세팅"
echo "  ─────────────────────────────"
echo ""

# ─── 1. 사전 조건 체크 ───
echo "1/4  사전 조건 확인..."

command -v node >/dev/null 2>&1 || fail "Node.js가 설치되어 있지 않습니다. https://nodejs.org 에서 설치해주세요."
command -v npm  >/dev/null 2>&1 || fail "npm이 설치되어 있지 않습니다."

NODE_MAJOR=$(node -v | sed 's/v//' | cut -d. -f1)
if [ "$NODE_MAJOR" -lt 18 ]; then
  fail "Node.js 18 이상이 필요합니다. (현재: $(node -v))"
fi
info "Node $(node -v), npm $(npm -v)"

# ─── 2. 의존성 설치 ───
echo ""
echo "2/4  의존성 설치..."
npm install --no-audit --no-fund 2>&1 | tail -3
info "npm install 완료"

# ─── 3. 환경 변수 설정 ───
echo ""
echo "3/4  환경 변수 설정..."

if [ -f .env ]; then
  warn ".env 파일이 이미 존재합니다. 건너뜁니다."
else
  cp .env.example .env

  # JWT_SECRET을 랜덤 값으로 교체
  JWT_SECRET=$(openssl rand -base64 32)
  if [[ "$OSTYPE" == "darwin"* ]]; then
    sed -i '' "s|JWT_SECRET=\"change-me\"|JWT_SECRET=\"${JWT_SECRET}\"|" .env
  else
    sed -i "s|JWT_SECRET=\"change-me\"|JWT_SECRET=\"${JWT_SECRET}\"|" .env
  fi

  info ".env 파일 생성 완료 (JWT_SECRET 자동 생성됨)"
  echo ""
  warn "선택 사항 — 필요 시 .env 파일에 직접 입력하세요:"
  echo "  NEXT_PUBLIC_NAVER_MAP_CLIENT_ID  (네이버 지도 API)"
  echo "  ANTHROPIC_API_KEY                (AI 적정가 기능)"
fi

# ─── 4. 데이터베이스 초기화 ───
echo ""
echo "4/4  데이터베이스 초기화..."

npx prisma generate 2>&1 | tail -2
info "Prisma 클라이언트 생성"

npx prisma migrate dev --name init 2>&1 | tail -3
info "마이그레이션 적용 완료"

npx prisma db seed 2>&1 | tail -2
info "시드 데이터 투입 완료"

# ─── 완료 ───
echo ""
echo "  ─────────────────────────────"
echo -e "  ${GREEN}세팅 완료!${NC}"
echo ""
echo "  시작하기:"
echo "    npm run dev"
echo "    http://localhost:3000"
echo ""
echo "  데모 계정 (비밀번호: password123):"
echo "    landlord1@peach.market  박주인 (집주인)"
echo "    student1@peach.market   홍학생 (학생)"
echo ""
