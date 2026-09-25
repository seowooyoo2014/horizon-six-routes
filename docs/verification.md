# 실행 검증

2026-09-25 로컬 복사본 기준. 전체 캠페인 검증 결과가 아닙니다.

## 확인됨

- 정적 빌드 성공. 로컬 브라우저에서 새 항해, 선장 선택, 선원 숙소의 본편 장면 진입 확인.
- `python3 tools/build_site.py` 완료. 배포 대상 HTML의 로컬 파일 경로 점검에서 누락 없음.

- 깨끗한 Git worktree checkout에서 `python3 tools/build_site.py`가 성공하고 `dist/index.html`이 생성됨.

## 아직 확인 필요

- 항해·교역·브라우저 재시작 후 저장 상태 및 Unity 에디터 실행은 아직 확인하지 못함.
- GitHub Pages 공개 주소에서의 재실행은 배포 후 확인해야 합니다.
