import Wishlist from './common/Wishlist.js';
import instructorService from './service/instructorService.js';

const slideData = [
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/%ED%95%B4%EB%B3%80+%EB%A6%AC%EC%98%A4.jpg', alt: '슬라이드 1: 해변 일러스트', caption: '해변 일러스트' },
    { type: 'video', src: 'https://video.twimg.com/amplify_video/1965714574931533825/vid/avc1/1280x720/HTEY84unPmDrKL8y.mp4?tag=14', alt: '슬라이드 2: Live 2D 캐릭터 리깅 영상', caption: 'Live 2D & Spine 2D 리깅' },
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/135855190_p0_master1200.png', alt: '슬라이드 3: 판타지 캐릭터 원화', caption: '판타지 캐릭터 원화' },
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/%EC%95%84%EC%8A%A4%EB%82%98+%EC%B9%B4%ED%8E%98', alt: '슬라이드 4: 따뜻한 분위기 연출', caption: '따뜻한 분위기 연출' },
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/%ED%95%B4%EB%B0%A92.jpg', alt: '슬라이드 5: 다크 판타지 컨셉 아트', caption: '다크 판타지 컨셉 아트' },
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/136134623_p0_master1200.png', alt: '슬라이드 6: 매력적인 인체 드로잉', caption: '매력적인 인체 드로잉' },
    { type: 'image', src: 'https://digitaltuto.s3.ap-southeast-2.amazonaws.com/digitaltuto/121876509_p0_master1200.png', alt: '슬라이드 7: 캐주얼 캐릭터 디자인', caption: '캐주얼 캐릭터 디자인' },
];

/**
 * 메인 페이지의 동적 UI 및 데이터 처리를 담당하는 모듈
 */
const MainPage = {
    allInstructors: [], // 모든 강사 데이터를 저장하는 상태

    initializeCarousel() {
        const interval = setInterval(() => {
            if (window.Carousel) {
                clearInterval(interval);
                new window.Carousel('slideshow-container', slideData);
            }
        }, 100);
    },

    /**
     * 강사 카드 HTML을 생성하는 함수
     * @param {object} instructor - 강사 데이터 객체
     * @param {string} type - 'gallery' 또는 'recommend'
     * @returns {string} - 생성된 HTML 문자열
     */
    createInstructorCard(instructor, type = 'gallery') {
        const isWished = Wishlist.get().includes(instructor.id);
        const tagsHTML = instructor.tags.map(tag =>
            `<span class="inline-block bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-medium mr-1.5 mb-1.5 px-2 py-0.5 rounded-full transition-colors duration-300">${tag.name}</span>`
        ).join('');

        const cardTemplates = {
            gallery: /*html*/`
                <div class="instructor-card bg-white dark:bg-gray-900 rounded-lg overflow-hidden group transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02]">
                    <div class="relative overflow-hidden" style="padding-top: 75%;">
                        <a href="tutor-detail.html?id=${instructor.id}" class="block w-full h-full">
                            <img src="${instructor.profileImage}" alt="${instructor.name} 포트폴리오" class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async">
                        </a>
                        <button class="wishlist-btn absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white/70 hover:text-white hover:bg-black/70 transition-colors" data-id="${instructor.id}" aria-label="찜하기" aria-pressed="${isWished}">
                            <svg class="w-4 h-4 pointer-events-none" xmlns="http://www.w3.org/2000/svg" fill="${isWished ? 'currentColor' : 'none'}" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.5 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" /></svg>
                        </button>
                    </div>
                    <a href="tutor-detail.html?id=${instructor.id}" class="block p-3">
                        <div>
                            <h3 class="text-base font-bold text-gray-900 dark:text-white truncate transition-colors duration-300">${instructor.name}</h3>
                            <p class="text-xs text-gray-500 dark:text-gray-400 mt-1 h-8 overflow-hidden transition-colors duration-300">${instructor.intro}</p> 
                            <div class="mt-2 h-12 overflow-hidden">${tagsHTML}</div>
                        </div>
                    </a>
                </div>`,
            recommend: /*html*/`
                <a href="tutor-detail.html?id=${instructor.id}" class="recommended-card bg-white dark:bg-gray-900 rounded-lg overflow-hidden group cursor-pointer transition-all duration-300 hover:shadow-lg hover:shadow-pink-500/20 hover:scale-[1.02]">
                    <div class="relative overflow-hidden" style="padding-top: 56.25%;">
                        <img src="${instructor.profileImage}" alt="${instructor.name} 썸네일" class="absolute top-0 left-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" loading="lazy" decoding="async">
                    </div>
                    <div class="p-4">
                        <p class="text-sm font-semibold text-pink-600 dark:text-pink-400">${instructor.name}</p>
                        <h4 class="text-lg font-bold text-gray-900 dark:text-white truncate mt-1">${instructor.intro}</h4>
                        <div class="text-sm text-gray-700 dark:text-gray-400 mt-2 h-12 overflow-hidden">${tagsHTML}</div>
                    </div>
                </a>`
        };

        return cardTemplates[type] || '';
    },

    /**
     * 강사 갤러리를 렌더링하는 함수
     * @param {Array} instructorsToRender - 렌더링할 강사 데이터 배열
     */
    renderInstructors(instructorsToRender) {
        const galleryContainer = document.getElementById('instructor-gallery');
        if (!galleryContainer) return;

        if (instructorsToRender.length === 0) {
            galleryContainer.innerHTML = `<p class="col-span-full text-center text-gray-500 dark:text-gray-400">검색 결과가 없습니다.</p>`;
            return;
        }
        galleryContainer.innerHTML = instructorsToRender.map(instructor => this.createInstructorCard(instructor, 'gallery')).join('');
        this.addWishlistEventListeners(galleryContainer);
    },

    /**
     * 찜하기 버튼에 이벤트 리스너를 추가하는 함수
     * @param {HTMLElement} container - 이벤트 리스너를 추가할 컨테이너 요소
     */
    addWishlistEventListeners(container) {
        container.addEventListener('click', (e) => {
            const button = e.target.closest('.wishlist-btn');
            if (!button) return;
            
            const instructorId = parseInt(button.dataset.id, 10);
            const isWished = Wishlist.toggle(instructorId);
            button.setAttribute('aria-pressed', isWished);
            button.querySelector('svg').setAttribute('fill', isWished ? 'currentColor' : 'none');
        });
    },

    /**
     * 검색어에 따라 강사를 필터링하고 렌더링하는 함수
     * @param {string} searchTerm - 검색어
     */
    filterAndSearch(searchTerm = '') {
        const term = searchTerm.toLowerCase();
        const filtered = this.allInstructors.filter(instructor => {
            const name = instructor.name.toLowerCase();
            const intro = instructor.intro.toLowerCase();
            const hasTag = instructor.tags.some(tag => tag.name.toLowerCase().includes(term));
            return name.includes(term) || intro.includes(term) || hasTag;
        });
        this.renderInstructors(filtered);
    },

    /**
     * 추천 강의 섹션과 필터 버튼을 설정하는 함수
     */
    setupRecommendationCategories() {
        const subjectButtonsContainer = document.getElementById('subject-filter-buttons');
        const sectionsContainer = document.getElementById('recommendation-sections');
        if (!subjectButtonsContainer || !sectionsContainer) return;

        const recommendationData = [
            { id: 'popular-tags', title: '요즘 뜨는 #인기 태그', icon: '🔥', filter: (instructors) => [...instructors].sort((a, b) => b.popularity - a.popularity).slice(0, 4), subject: '전체' },
            { id: 'new-tutors', title: '새로 오신 강사님', icon: '✨', filter: (instructors) => [...instructors].sort((a, b) => b.id - a.id).slice(0, 4), subject: '전체' },
            { id: 'character-beginner', title: '캐릭터 드로잉 입문', icon: '🎨', filter: (instructors) => instructors.filter(i => i.tags.some(t => t.id === 'character_illustration')).slice(0, 4), subject: '캐릭터' },
            { id: 'character-master', title: '캐릭터 전문가 과정', icon: '👑', filter: (instructors) => instructors.filter(i => i.tags.some(t => t.id === 'game_concept_art')).slice(0, 4), subject: '캐릭터' },
            { id: 'background-basic', title: '배경 일러스트 기초', icon: '🏞️', filter: (instructors) => instructors.filter(i => i.tags.some(t => t.id === 'design')).slice(0, 4), subject: '배경' },
            { id: 'live2d-rigging', title: 'Live2D 리깅 마스터', icon: '💃', filter: (instructors) => instructors.filter(i => i.tags.some(t => t.id === 'live_2d')).slice(0, 4), subject: 'Live2D' },
        ];

        const subjects = ['전체', '캐릭터', '배경', 'Live2D'];

        const renderSections = (subjectFilter = '전체') => {
            sectionsContainer.innerHTML = '';
            const sectionsToRender = subjectFilter === '전체' ? recommendationData : recommendationData.filter(s => s.subject === subjectFilter || s.subject === '전체');

            sectionsToRender.forEach(data => {
                const filteredInstructors = data.filter(this.allInstructors);
                if (filteredInstructors.length === 0) return;

                const cardsHTML = filteredInstructors.map(instructor => this.createInstructorCard(instructor, 'recommend')).join('');
                const sectionHTML = `
                    <div class="rec-section mb-16" data-subject="${data.subject}" data-id="${data.id}">
                        <h3 class="text-2xl font-semibold mb-6 flex items-center text-black dark:text-white transition-colors duration-300"><span class="text-2xl mr-3">${data.icon}</span> ${data.title}</h3>
                        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 recommendation-gallery">${cardsHTML}</div>
                    </div>`;
                sectionsContainer.insertAdjacentHTML('beforeend', sectionHTML);
            });
        };

        subjects.forEach((subject, index) => {
            const button = document.createElement('button');
            button.className = 'rec-filter-btn';
            if (index === 0) button.classList.add('active');
            button.textContent = subject;
            button.addEventListener('click', () => {
                subjectButtonsContainer.querySelector('.active')?.classList.remove('active');
                button.classList.add('active');
                renderSections(subject);
            });
            subjectButtonsContainer.appendChild(button);
        });

        renderSections(); // 초기 렌더링 (전체)

        // 추천 섹션에도 찜하기 이벤트 리스너 추가
        document.querySelectorAll('.recommendation-gallery').forEach(gallery => {
            this.addWishlistEventListeners(gallery);
        });
    },

    /**
     * 페이지 초기화 함수
     */
    async init() {
        this.initializeCarousel();
        try {
            // [REFACTOR] 데이터 서비스 모듈을 통해 강사 데이터 가져오기
            this.allInstructors = await instructorService.getInstructors();
            this.renderInstructors(this.allInstructors);
            this.setupRecommendationCategories();
        } catch (error) {
            console.error('강사 데이터를 불러오는 데 실패했습니다:', error);
            document.getElementById('instructor-gallery').innerHTML = `<p class="col-span-full text-center text-red-500">강사 목록을 불러오는 중 오류가 발생했습니다.</p>`;
        }

        // search.js에서 발생하는 커스텀 이벤트를 수신
        document.addEventListener('performSearch', (e) => {
            this.filterAndSearch(e.detail.searchTerm);
        });
    }
};

document.addEventListener('DOMContentLoaded', () => {
    MainPage.init();
});