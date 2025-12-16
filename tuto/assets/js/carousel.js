import BaseSlider from './slider/BaseSlider.js';

class Carousel extends BaseSlider {
    constructor(containerId, data) {
        // BaseSlider 생성자에 옵션 전달
        super(containerId, data, { 
            autoplayInterval: 4000,
            TRANSITION_DURATION: 250,
            GAP_SIZE: 20,
        });

        // Carousel의 currentIndex는 1부터 시작 (클론 때문)
        this.state.currentIndex = 1;

        // BaseSlider의 init() 호출
        if (this.container) {
            this.init();
            // [FIX] CSS의 pointer-events: none를 우회하여 비디오를 직접 재생합니다.
            this.playVideos();
        }
    }

    playVideos() {
        const videos = this.draggableElement.querySelectorAll('video');
        videos.forEach(video => {
            // play()는 프로미스를 반환하며, 사용자가 탭을 전환하는 등 특정 상황에서 실패할 수 있습니다.
            video.play().catch(error => console.log("Video autoplay failed:", error.message));
        });
    }

    // --- BaseSlider 추상 메서드 구현 ---
    createSlideHTML(item, index, isClone = false) {
        const tag = item.type === 'video'
            ? `<video src="${item.src}" class="w-full h-full object-cover" autoplay loop muted playsinline poster="${item.poster}" aria-label="${item.alt}"></video>`
            : `<img src="${item.src}" alt="${item.alt}" class="w-full h-full object-cover" loading="lazy" decoding="async" draggable="false">`;

        return /*html*/`
            <div class="slide ${isClone ? 'clone' : ''} select-none" tabindex="${isClone ? -1 : 0}" data-index="${index}">
                <div class="slide-content-wrapper">
                    ${tag}
                    <div class="caption-overlay">${item.caption}</div>
                </div>
            </div>
        `;
    }

    render() {
        let slidesHTML = '';
        this.data.forEach((item, index) => {
            slidesHTML += this.createSlideHTML(item, index + 1);
        });

        const firstClone = this.createSlideHTML(this.data[0], 1, true);
        const lastClone = this.createSlideHTML(this.data[this.data.length - 1], this.data.length, true);

        // this.container는 BaseSlider에서 #slideshow-container로 설정됨
        this.container.innerHTML = `<div class="img-wrapper" style="display: flex; gap: ${this.config.GAP_SIZE}px;">${lastClone + slidesHTML + firstClone}</div>`;
        
        this.draggableElement = this.container.querySelector('.img-wrapper'); // BaseSlider를 위해 설정
        this.allSlides = this.draggableElement ? Array.from(this.draggableElement.querySelectorAll('.slide')) : [];
    }

    updatePosition(offset = 0, smooth = true) {
        const slideWidth = this.allSlides[1]?.offsetWidth || 0;
        if (slideWidth === 0) return;

        const centerOffset = (this.wrapper.clientWidth - slideWidth) / 2;
        const translateOffset = centerOffset - (this.state.currentIndex * (slideWidth + this.config.GAP_SIZE));

        this.draggableElement.style.transition = smooth ? `transform ${this.config.TRANSITION_DURATION}ms ease-out` : 'none';
        this.draggableElement.style.transform = `translateX(${translateOffset + offset}px)`;
    }

    updateActiveSlide() {
        this.allSlides.forEach((slide, i) => {
            const isActive = (i === this.state.currentIndex) ||
                (this.state.currentIndex === 0 && i === this.allSlides.length - 2) ||
                (this.state.currentIndex === this.allSlides.length - 1 && i === 1);
            slide.classList.toggle('active', isActive);
        });
    }

    // --- Carousel 고유 메서드 ---
    moveTo(index, smooth = true) {
        if (this.state.isAnimating) return; // 애니메이션 중이면 이동 방지
        if (smooth) this.state.isAnimating = true; // 부드러운 이동 시 애니메이션 시작 플래그 설정

        this.state.currentIndex = index;
        this.updatePosition(0, smooth);
        this.updateActiveSlide();
    }

    moveToNext() { this.moveTo(this.state.currentIndex + 1); }
    moveToPrev() { this.moveTo(this.state.currentIndex - 1); }

    handleTransitionEnd() {
        this.state.isAnimating = false; // 애니메이션 종료
        if (this.state.currentIndex > this.data.length) {
            this.moveTo(1, false);
        } else if (this.state.currentIndex < 1) {
            this.moveTo(this.data.length, false);
        }
    }

    /**
     * @override BaseSlider.bindEvents
     */
    bindEvents() {
        super.bindEvents(); // 공통 이벤트 바인딩
        // Carousel의 무한 루프를 위한 트랜지션 종료 이벤트 추가
        this.draggableElement.addEventListener('transitionend', this.handleTransitionEnd.bind(this));
    }
}

// [REVISED] Carousel 클래스를 전역 스코프에 노출시켜 다른 스크립트에서 인스턴스화할 수 있도록 합니다.
window.Carousel = Carousel;