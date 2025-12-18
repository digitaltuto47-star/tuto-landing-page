async function loadLayout() {
    const headerPlaceholder = document.getElementById('header-placeholder');
    const footerPlaceholder = document.getElementById('footer-placeholder');
    const headerPromise = fetch('/assets/layout/header.html').then(res => res.text());
    const footerPromise = fetch('/assets/layout/footer.html').then(res => res.text());

    try {
        const [headerHtml, footerHtml] = await Promise.all([headerPromise, footerPromise]);

        if (headerPlaceholder) headerPlaceholder.outerHTML = headerHtml;
        if (footerPlaceholder) footerPlaceholder.outerHTML = footerHtml;

        // 헤더 초기화는 app.js에서 담당하므로 여기서는 페이지별 초기화만 호출합니다.
        if (typeof window.initializePage === 'function') {
            window.initializePage(); // 예: create-lecture.html의 기능을 활성화
        }

    } catch (error) {
        console.error('Error loading layout:', error);
    }
}

loadLayout();