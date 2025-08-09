export class ScrollCache {
    private cache: Map<string, { top: number; left: number }>;

    constructor() {
        this.cache = new Map();
    }

    save(key: string | number, element: HTMLElement | undefined) {
        if (!element) return;
        const elements = element!.querySelectorAll('*');
        for (const el of elements) {
            if (this.isScrollable(el)) {
                this.cache.set(`${key}:${ScrollCache.getDomPath(el)}`, {
                    top: (el as HTMLElement).scrollTop,
                    left: (el as HTMLElement).scrollLeft,
                });
            }
        }
    }

    restore(key: string | number, element: HTMLElement | undefined) {
        if (!element) return;
        const elements = element!.querySelectorAll('*');
        for (const el of elements) {
            const saved = this.cache.get(
                `${key}:${ScrollCache.getDomPath(el)}`
            );
            if (saved) {
                if (el instanceof HTMLElement) {
                    el.scrollTop = saved.top;
                    el.scrollLeft = saved.left;
                }
            }
        }
    }

    delete(key: string | number): void {
        const keysToDelete = Array.from(this.cache.keys()).filter(k => k.startsWith(key + ':'));
        for (const k of keysToDelete) {
            this.cache.delete(k);
        }
    }

    private isScrollable(el: Element): boolean {
        const style = getComputedStyle(el);
        return (
            (style.overflowY === 'auto' || style.overflowY === 'scroll') &&
            el.scrollHeight > el.clientHeight
        ) || (
            (style.overflowX === 'auto' || style.overflowX === 'scroll') &&
            el.scrollWidth > el.clientWidth
        );
    }

    static getDomPath(el: Element): string {
        const path = [];
        let current: Element | null = el;
        while (current && current.parentElement) {
            path.unshift(`${current.tagName.toLowerCase()}`);
            current = current.parentElement;
        }
        return path.join(' > ');
    }
}