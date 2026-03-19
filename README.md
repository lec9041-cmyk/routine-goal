# 루티너 (Routiner)

모바일 생산성 앱 - 할일, 목표, 루틴을 한 곳에서 관리하세요.

## 기능

- 📝 **할일 관리**: 서브태스크 지원, 우선순위 설정
- 🎯 **목표 관리**: 만다라트 보기, 루틴 연동
- 🔄 **루틴 관리**: 일일/주간/월간 루틴, 스트릭 추적
- 📅 **캘린더**: 일정 한눈에 보기
- 🎨 **테마**: 6가지 파스텔 색상 테마

## Vercel 배포

### 1. Vercel에 프로젝트 연결

```bash
# Vercel CLI 설치 (처음이면)
npm i -g vercel

# 프로젝트 배포
vercel
```

### 2. 자동 배포 설정

1. [Vercel Dashboard](https://vercel.com)에 로그인
2. "Import Project" 클릭
3. GitHub/GitLab 저장소 연결
4. 프로젝트 설정:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build` (자동 감지됨)
   - **Output Directory**: `dist` (자동 감지됨)
5. "Deploy" 클릭

### 3. 로컬에서 개발

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 프로덕션 빌드
npm run build

# 빌드 미리보기
npm run preview
```

## 기술 스택

- React 18
- TypeScript
- Vite
- Tailwind CSS v4
- Lucide Icons
- React Router

## 프로젝트 구조

```
/
├── src/
│   ├── app/
│   │   ├── App.tsx          # 메인 앱 컴포넌트
│   │   └── components/       # 화면 컴포넌트들
│   ├── styles/               # 스타일 파일들
│   └── main.tsx             # 진입점
├── public/                   # 정적 파일
├── index.html               # HTML 템플릿
├── vercel.json              # Vercel 설정
└── vite.config.ts           # Vite 설정
```

## 라이선스

MIT
