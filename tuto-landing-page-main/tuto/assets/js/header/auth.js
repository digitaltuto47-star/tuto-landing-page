const HIDDEN_CLASS = 'hidden';

const $ = (id) => document.getElementById(id);

const show = (el) => el && el.classList.remove(HIDDEN_CLASS);
const hide = (el) => el && el.classList.add(HIDDEN_CLASS);

function getStoredUser() {
    try {
        const raw = localStorage.getItem('mockUser');
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.error('mockUser 파싱 실패:', error);
        return null;
    }
}

export function updateUIForAuthState(user) {
    const loginButtonText     = $('login-button-text');
    const profileImageContainer = $('profile-image-container');
    const randomBtn           = $('random-recommendation-btn');
    const notificationContainer = $('notification-btn-container');
    const signupBtn           = $('signup-btn');

    const studentMenu         = $('student-menu');
    const instructorMenu      = $('instructor-menu');
    const loginMenuItem       = $('login-menu-item');
    const logoutMenuItem      = $('logout-menu-item');

    const isLoggedIn = !!user;

    if (isLoggedIn) {
        // 상단 버튼/아이콘
        hide(loginButtonText);
        hide(signupBtn);
        show(randomBtn);
        show(notificationContainer);

        if (profileImageContainer) {
            const img = profileImageContainer.querySelector('img');
            if (img) {
                img.src = user.photoURL || 'https://placehold.co/32x32/cccccc/FFFFFF?text=U';
                img.alt = user.displayName || 'User';
            }
            show(profileImageContainer);
        }

        // 역할별 메뉴
        if (user.role === 'instructor') {
            show(instructorMenu);
            hide(studentMenu);
        } else {
            show(studentMenu);
            hide(instructorMenu);
        }

        hide(loginMenuItem);
        show(logoutMenuItem);
    } else {
        // 로그아웃 상태
        show(loginButtonText);
        show(signupBtn);

        hide(profileImageContainer);
        hide(randomBtn);
        hide(notificationContainer);

        hide(studentMenu);
        hide(instructorMenu);

        show(loginMenuItem);
        hide(logoutMenuItem);
    }
}

export function setupAuthActions() {
    const logoutButton = $('logout-menu-item');

    if (logoutButton) {
        logoutButton.addEventListener('click', (e) => {
            e.preventDefault();
            localStorage.removeItem('mockUser');
            alert('로그아웃되었습니다.');
            window.location.reload();
        });
    }

    // 프로필 수정 후 UI 재반영
    window.addEventListener('profileUpdated', () => {
        const user = getStoredUser();
        updateUIForAuthState(user);
    });

    // 페이지 로딩 시 한 번 초기화
    const initialUser = getStoredUser();
    updateUIForAuthState(initialUser);
}
