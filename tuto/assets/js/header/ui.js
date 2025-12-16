export function setupAutoHidingHeader() {
    const header = document.getElementById('main-header');
    if (!header) return;

    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        const scrolledDown  = currentScrollY > lastScrollY;
        const pastHeader    = currentScrollY > header.offsetHeight;

        if (scrolledDown && pastHeader) {
            header.classList.add('-translate-y-full');
        } else {
            header.classList.remove('-translate-y-full');
        }

        lastScrollY = Math.max(currentScrollY, 0);
    });
}

const INSTRUCTOR_JSON_URL = 'assets/data/instructors.json';

export function setupRandomRecommendation() {
    const randomBtn = document.getElementById('random-recommendation-btn');
    if (!randomBtn) return;

    randomBtn.addEventListener('click', async () => {
        try {
            const response = await fetch(INSTRUCTOR_JSON_URL);
            if (!response.ok) {
                throw new Error('강사 목록을 불러올 수 없습니다.');
            }

            const instructors = await response.json();
            if (!Array.isArray(instructors) || instructors.length === 0) {
                alert('추천할 강사가 없습니다.');
                return;
            }

            const randomIndex = Math.floor(Math.random() * instructors.length);
            const randomInstructorId = instructors[randomIndex].id;

            if (!randomInstructorId) return;

            window.location.href = `tutor-detail.html?id=${encodeURIComponent(randomInstructorId)}`;
        } catch (error) {
            console.error('랜덤 추천 기능 오류:', error);
            alert('랜덤 강사를 불러오는 데 실패했습니다.');
        }
    });
}