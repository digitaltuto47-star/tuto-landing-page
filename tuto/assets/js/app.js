import { updateUIForAuthState, setupAuthActions } from './header/auth.js';
import { setupCommonMenus } from './header/menu.js';
import { setupAutoHidingHeader, setupRandomRecommendation } from './header/ui.js';

window.initializeHeader = function() {
    // 1. 인증 상태에 따른 UI 초기화
    const loggedInUser = JSON.parse(localStorage.getItem('mockUser'));
    updateUIForAuthState(loggedInUser);

    // 2. 각 기능별 모듈 초기화
    setupCommonMenus();
    setupAutoHidingHeader();
    setupRandomRecommendation();
    setupAuthActions();
};

// [핵심 수정] 헤더가 DOM에 삽입될 때까지 기다린 후 초기화 함수를 실행합니다.
const checkHeaderInterval = setInterval(() => {
    const header = document.getElementById('main-header');
    if (header) {
        clearInterval(checkHeaderInterval); // 헤더를 찾았으면 인터벌 중지
        if (typeof window.initializeHeader === 'function') {
            window.initializeHeader();
        }
    }
}, 100); // 100ms 마다 확인