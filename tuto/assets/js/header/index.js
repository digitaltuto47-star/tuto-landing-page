import { setupAuthActions } from './auth.js';
import { setupCommonMenus } from './menu.js';
import { setupSearch } from './search.js';
import { setupThemeSwitcher } from './theme.js';
import { setupAutoHidingHeader, setupRandomRecommendation } from './ui.js';

export function initHeader() {
    setupAuthActions();
    setupCommonMenus();
    setupSearch();
    setupThemeSwitcher();
    setupAutoHidingHeader();
    setupRandomRecommendation();
}