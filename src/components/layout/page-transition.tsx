'use client';

import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

interface PageTransitionProps {
    children: React.ReactNode;
}

/**
 * PageTransition — animates page content on route change.
 * Matches mockup navigateTo() exactly:
 *   targetPage.style.animation = 'fadeIn 0.4s ease-out'
 * CSS keyframe: opacity 0→1, translateY 8px→0
 */
export function PageTransition({ children }: PageTransitionProps) {
    const pathname = usePathname();
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const el = ref.current;
        if (!el) return;

        // Exact replica of mockup logic:
        // targetPage.style.animation = 'none';
        // targetPage.offsetHeight; // reflow
        // targetPage.style.animation = 'fadeIn 0.4s ease-out';
        el.style.animation = 'none';
        void el.offsetHeight;
        el.style.animation = 'page-enter 0.4s ease-out';
    }, [pathname]);

    return (
        <div ref={ref} style={{ animation: 'page-enter 0.4s ease-out' }}>
            {children}
        </div>
    );
}

export default PageTransition;
