import BaseSlider from './slider/BaseSlider.js';
import instructorService from './service/instructorService.js';

class ReviewSlider extends BaseSlider {
    constructor(containerId, data) {
        // BaseSlider 생성자에 옵션 전달
        super(containerId, data, { 
            autoplayInterval: 5000,
            GAP_SIZE: 24, // Tailwind 'gap-6'
        });

        // [추가] 무한 루프를 위해 복제된 슬라이드 수만큼 초기 인덱스 설정
        this.CLONES_COUNT = 3;
        this.state.currentIndex = this.CLONES_COUNT;

        // BaseSlider의 init() 호출
        if (this.container) this.init();
    }

    createReviewCardHTML(review, isClone = false) {
        const stars = Array(5).fill(0).map((_, i) => 
            `<svg class="w-4 h-4 ${i < review.rating ? 'text-yellow-400' : 'text-gray-600'}" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>`
        ).join('');
        return /*html*/`
            <div class="review-card ${isClone ? 'clone' : ''} bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-800 flex flex-col flex-shrink-0 w-full sm:w-1/2 md:w-1/3 select-none">
                <div class="flex items-center mb-2">${stars}</div>
                <p class="text-gray-600 dark:text-gray-300 mb-4 flex-grow transition-colors duration-300">"${review.text}"</p>
                <div class="border-t border-gray-200 dark:border-gray-700 pt-4">
                    <p class="font-semibold text-gray-900 dark:text-white transition-colors duration-300">${review.name}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-500 transition-colors duration-300">${review.class} 수강</p>
                </div>
            </div>
        `;
    }

    render() {
        // [수정] 무한 루프를 위해 슬라이드 복제
        if (this.data.length === 0) return;
        const clonesFromEnd = this.data.slice(-this.CLONES_COUNT).map(item => this.createReviewCardHTML(item, true)).join('');
        const originalSlides = this.data.map(item => this.createReviewCardHTML(item, false)).join('');
        const clonesFromStart = this.data.slice(0, this.CLONES_COUNT).map(item => this.createReviewCardHTML(item, true)).join('');

        this.container.innerHTML = clonesFromEnd + originalSlides + clonesFromStart;

        this.draggableElement = this.container; // BaseSlider를 위해 설정
        this.allSlides = Array.from(this.draggableElement.querySelectorAll('.review-card'));
    }

    getSlidesToShow() {
        if (window.innerWidth >= 768) return 3;
        if (window.innerWidth >= 640) return 2;
        return 1;
    }

    updatePosition(smooth = true) {
        this.draggableElement.style.transition = smooth ? 'transform 0.4s cubic-bezier(0.4, 0, 0.2, 1)' : 'none';
        const slideWidth = this.allSlides[0]?.offsetWidth || 0;
        if (slideWidth === 0) return;
        const offset = -this.state.currentIndex * (slideWidth + this.config.GAP_SIZE) + this.state.diffX;
        this.draggableElement.style.transform = `translateX(${offset}px)`;
    }

    moveTo(index, smooth = true) {
        if (this.state.isAnimating) return;
        if (smooth) this.state.isAnimating = true;

        this.state.currentIndex = index;
        this.updatePosition(smooth);
    }

    moveToNext() {
        this.moveTo(this.state.currentIndex + 1);
    }

    moveToPrev() {
        this.moveTo(this.state.currentIndex - 1);
    }

    /**
     * @override BaseSlider.handleResize - ReviewSlider는 화면 크기에 따라 인덱스를 재계산해야 함
     */
    handleResize() {
        this.state.currentIndex = this.CLONES_COUNT;
        this.updatePosition(false);
    }

    handleTransitionEnd() {
        this.state.isAnimating = false;
        const originalSlidesCount = this.data.length;
        if (this.state.currentIndex >= originalSlidesCount + this.CLONES_COUNT) {
            this.moveTo(this.CLONES_COUNT, false);
        } else if (this.state.currentIndex < this.CLONES_COUNT) {
            this.moveTo(originalSlidesCount + this.CLONES_COUNT - 1, false);
        }
    }

    /**
     * @override BaseSlider.bindEvents
     */
    bindEvents() {
        super.bindEvents();
        this.draggableElement.addEventListener('transitionend', this.handleTransitionEnd.bind(this));
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const reviews = await instructorService.getReviews();
        new ReviewSlider('review-slideshow', reviews);
    } catch (error) {
        console.error('리뷰 데이터를 불러오는 데 실패했습니다:', error);
    }
});