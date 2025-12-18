export function setupCommonMenus() {
    const menus = [
        {
            button: document.getElementById('profile-menu-button'),
            menu:   document.getElementById('profile-menu')
        },
        {
            button: document.getElementById('notification-button'),
            menu:   document.getElementById('notification-menu')
        },
        {
            button: document.getElementById('theme-menu-button'),
            menu:   document.getElementById('theme-menu')
        },
    ];

    const validMenus = menus.filter(({ button, menu }) => button && menu);
    if (validMenus.length === 0) return;

    const closeMenu = (button, menu) => {
        if (!menu || menu.classList.contains('hidden')) return;
        menu.classList.add('opacity-0');
        setTimeout(() => {
            menu.classList.add('hidden');
        }, 200);
        button?.setAttribute('aria-expanded', 'false');
    };

    const openMenu = (button, menu) => {
        if (!menu) return;
        menu.classList.remove('hidden');
        // transition용 약간의 지연
        requestAnimationFrame(() => {
            menu.classList.remove('opacity-0');
        });
        button?.setAttribute('aria-expanded', 'true');
    };

    const toggleMenu = (button, menu) => {
        if (!button || !menu) return;

        const isOpening = menu.classList.contains('hidden');
        // 다른 메뉴는 모두 닫기
        validMenus.forEach(({ button: btn, menu: m }) => {
            if (btn !== button) closeMenu(btn, m);
        });

        if (isOpening) {
            openMenu(button, menu);
        } else {
            closeMenu(button, menu);
        }
    };

    // 버튼 클릭 이벤트
    validMenus.forEach(({ button, menu }) => {
        button.addEventListener('click', (e) => {
            e.stopPropagation();
            toggleMenu(button, menu);
        });
    });

    // 바깥 클릭 시 메뉴 닫기
    document.addEventListener('click', (e) => {
        validMenus.forEach(({ button, menu }) => {
            if (!menu || !button) return;
            const target = e.target;
            const clickedInsideMenu  = menu.contains(target);
            const clickedOnButton    = button.contains(target);

            if (!clickedInsideMenu && !clickedOnButton) {
                closeMenu(button, menu);
            }
        });
    });
}
