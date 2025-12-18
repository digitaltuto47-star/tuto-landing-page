// c:	uto\assets\js\slider\BaseSlider.js

/**
 * 모든 슬라이더 컴포넌트의 기본이 되는 추상 클래스입니다.
 * 공통적인 초기화, 자동 재생, 드래그 로직을 제공하며,
 * 슬라이더별로 달라지는 렌더링 및 위치 계산 로직은 하위 클래스에서 구현하도록 합니다.
 */
class BaseSlider {
    /**
     * BaseSlider의 생성자입니다.
     * @param {string} containerId - 슬라이더가 렌더링될 DOM 요소의 ID.
     * @param {Array} data - 슬라이더에 표시될 데이터 배열.
     * @param {object} options - 슬라이더 설정 옵션 (예: autoplayInterval, TRANSITION_DURATION, GAP_SIZE).
     */
    constructor(containerId, data, options = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            console.error(`Container with ID "${containerId}" not found. Slider cannot be initialized.`);
            // 컨테이너가 없으면 더 이상 진행할 수 없으므로, 생성자에서 반환합니다.
            return; 
        }
        // wrapper는 일반적으로 container의 부모 요소이며, 마우스 이벤트(자동 재생 제어 등)를 처리합니다.
        // 하위 클래스에서 필요에 따라 이 값을 재정의할 수 있습니다.
        this.wrapper = this.container.parentElement; 
        if (!this.wrapper) {
            console.warn(`Wrapper for container ID "${containerId}" not found. Autoplay hover events might not work as expected.`);
        }

        this.data = data;
        this.config = {
            autoplayInterval: 0, // 기본값: 자동 재생 없음 (0ms)
            TRANSITION_DURATION: 0, // 기본값: 트랜지션 시간 없음
            GAP_SIZE: 0, // 기본값: 슬라이드 간 간격 없음
            ...options, // 전달된 옵션으로 기본값 오버라이드
        };

        this.state = {
            isDragging: false, // 드래그 중인지 여부
            startX: 0,         // 드래그 시작 시 X 좌표
            currentX: 0,       // 현재 드래그 중인 X 좌표
            diffX: 0,          // 드래그 시작점으로부터의 이동 거리
            currentIndex: 0,   // 현재 활성화된 슬라이드의 인덱스 (하위 클래스에서 정의)
            autoplayTimer: null, // 자동 재생 타이머 ID
            isAnimating: false, // [추가] 애니메이션 중인지 여부
        };

        this.allSlides = []; // 모든 슬라이드 DOM 요소를 담을 배열
        this.draggableElement = null; // 실제로 드래그되고 transform이 적용될 DOM 요소 (하위 클래스에서 설정)

        // bind 'this' for event handlers
        this.handleDragStart = this.handleDragStart.bind(this);
        this.handleDragging = this.handleDragging.bind(this);
        this.handleDragEnd = this.handleDragEnd.bind(this);
    }

    /**
     * 슬라이더를 초기화합니다.
     * 하위 클래스는 이 메서드를 호출하여 슬라이더를 설정합니다.
     */
    init() {
        if (!this.container) return; // 생성자에서 컨테이너를 찾지 못했으면 초기화 중단

        this.render(); // 하위 클래스에서 슬라이드 HTML을 렌더링하고 this.draggableElement, this.allSlides를 설정해야 합니다.

        if (!this.allSlides || this.allSlides.length === 0) {
            console.warn("BaseSlider: this.allSlides is empty after render(). Slider might not function correctly.");
        }

        this.updatePosition(0, false); // 초기 위치 설정 (애니메이션 없이)
        this.updateActiveSlide(); // 초기 활성 슬라이드 설정
        this.bindEvents(); // 공통 이벤트 바인딩
        if (this.config.autoplayInterval > 0) {
            this.startAutoplay(); // 자동 재생 설정 시 시작
        }
        window.addEventListener('resize', this.handleResize.bind(this)); // 창 크기 변경 이벤트 처리
    }

    // --- 추상 메서드 (하위 클래스에서 반드시 구현해야 함) ---
    render() {
        throw new Error("BaseSlider: render() method must be implemented by subclass.");
    }

    updatePosition(offset = 0, smooth = true) {
        throw new Error("BaseSlider: updatePosition() method must be implemented by subclass.");
    }

    moveTo(index, smooth = true) {
        throw new Error("BaseSlider: moveTo() method must be implemented by subclass.");
    }

    // --- 선택적 메서드 (하위 클래스에서 필요에 따라 오버라이드) ---
    updateActiveSlide() {
        // 기본 구현: 활성 슬라이드 로직 없음. 하위 클래스에서 필요 시 구현.
    }

    handleTransitionEnd() {
        // 기본 구현: 트랜지션 종료 로직 없음. 하위 클래스에서 무한 루프 등을 위해 구현.
    }

    handleResize() {
        // 기본 구현: 창 크기 변경 시 현재 인덱스를 0으로 초기화하고 위치를 재설정 (애니메이션 없이)
        this.state.currentIndex = 0; 
        this.updatePosition(0, false);
        this.updateActiveSlide();
    }

    // --- 공통 자동 재생 로직 ---
    stopAutoplay() {
        if (this.state.autoplayTimer) {
            clearInterval(this.state.autoplayTimer);
            this.state.autoplayTimer = null;
        }
    }

    startAutoplay() {
        this.stopAutoplay(); // 기존 타이머가 있다면 중지
        if (this.config.autoplayInterval > 0) {
            this.state.autoplayTimer = setInterval(() => {
                // 하위 클래스에서 moveToNext()를 구현하거나 startAutoplay를 오버라이드해야 합니다.
                if (typeof this.moveToNext === 'function') {
                    this.moveToNext();
                } else {
                    console.warn("BaseSlider: moveToNext() not implemented by subclass. Autoplay might not work.");
                    this.stopAutoplay(); // moveToNext가 없으면 자동 재생 중지
                }
            }, this.config.autoplayInterval);
        }
    }

    // --- 공통 드래그 로직 ---
    handleDragStart(e) {
        if (e.type === 'mousedown' && e.button !== 0) return; // 좌클릭만 허용
        if (e.type === 'mousedown') {
            e.preventDefault(); // 더블클릭 시 텍스트 선택 방지
        }
        if (!this.draggableElement || this.data.length <= 1 || this.state.isAnimating) return;
        
        this.stopAutoplay();
        this.state.isDragging = true;
        this.state.startX = e.touches ? e.touches[0].clientX : e.clientX;
        this.draggableElement.style.transition = 'none';

        window.addEventListener('mousemove', this.handleDragging);
        window.addEventListener('touchmove', this.handleDragging, { passive: false });
        window.addEventListener('mouseup', this.handleDragEnd, { once: true });
        window.addEventListener('touchend', this.handleDragEnd, { once: true });
    }

    handleDragging(e) {
        if (!this.state.isDragging) return;
        if (e.type === 'touchmove') {
            e.preventDefault(); // 모바일에서 스크롤 방지
        }
        this.state.currentX = e.touches ? e.touches[0].clientX : e.clientX;
        this.state.diffX = this.state.currentX - this.state.startX;
        this.updatePosition(this.state.diffX, false);
    }

    handleDragEnd() {
        if (!this.state.isDragging) return;
        
        window.removeEventListener('mousemove', this.handleDragging);
        window.removeEventListener('touchmove', this.handleDragging);

        this.state.isDragging = false;
        
        const threshold = this.allSlides[0].offsetWidth / 4;

        if (Math.abs(this.state.diffX) > threshold) {
            this.state.diffX < 0 ? this.moveToNext() : this.moveToPrev();
        } else {
            this.moveTo(this.state.currentIndex);
        }

        this.state.diffX = 0;
        if (this.config.autoplayInterval > 0) {
            this.startAutoplay();
        }
    }

    // --- 상태 초기화 로직 ---
    resetState() {
        // 1. 드래그 상태 및 관련 이벤트 리스너 강제 종료
        if (this.state.isDragging) {
            window.removeEventListener('mousemove', this.handleDragging);
            window.removeEventListener('touchmove', this.handleDragging);
            // mouseup/touchend는 once: true이므로 이미 제거되었을 가능성이 높지만, 안전을 위해 호출.
            window.removeEventListener('mouseup', this.handleDragEnd);
            window.removeEventListener('touchend', this.handleDragEnd);
        }
        
        // 2. 모든 핵심 상태 변수 초기화
        this.state.isDragging = false;
        this.state.isAnimating = false;
        this.state.startX = 0;
        this.state.currentX = 0;
        this.state.diffX = 0;

        // 3. 현재 인덱스를 기준으로 슬라이드 위치를 애니메이션 없이 즉시 재설정
        this.moveTo(this.state.currentIndex, false);

        // 4. 자동 재생 재시작
        if (this.config.autoplayInterval > 0) {
            this.startAutoplay();
        }
    }

    // --- 공통 이벤트 바인딩 ---
  bindEvents() {
    if (!this.wrapper) return;

    // 1. 우클릭 시 나타나는 컨텍스트 메뉴를 방지합니다.
    this.wrapper.addEventListener('contextmenu', e => e.preventDefault());

    // 2. 더블클릭 발생 시 기본 동작을 막고, 슬라이더 상태를 강제로 초기화하여
    //    예기치 않은 상태(드래그 중단 등)에 빠지는 문제를 해결합니다.
    this.wrapper.addEventListener('dblclick', e => {
        e.preventDefault();
        e.stopPropagation();
        this.resetState();
    });

    // 3. 드래그 시작 이벤트를 wrapper에 바인딩합니다.
    this.wrapper.addEventListener('mousedown', this.handleDragStart);
    this.wrapper.addEventListener('touchstart', this.handleDragStart, { passive: true });

    // 4. 드래그 가능한 요소(이미지 래퍼 등)에도 직접 이벤트를 바인딩합니다.
    if (this.draggableElement) {
        // 'draggableElement'에서도 mousedown/touchstart를 처리해야
        // 이미지 위에서 드래그를 시작할 수 있습니다.
        this.draggableElement.addEventListener('mousedown', this.handleDragStart);
        this.draggableElement.addEventListener('touchstart', this.handleDragStart, { passive: true });
        
        this.draggableElement.addEventListener(
            'transitionend',
            this.handleTransitionEnd.bind(this)
        );
    }

    // 5. 자동 재생 제어 (마우스 호버 시 일시정지/재시작)
    if (this.config.autoplayInterval > 0) {
        this.wrapper.addEventListener('mouseenter', () => this.stopAutoplay());
        this.wrapper.addEventListener('mouseleave', () => this.startAutoplay());
    }
  }

}

export default BaseSlider;