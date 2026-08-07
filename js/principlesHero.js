/* ══════════════════════════════════════════════════════════
   WORK PRINCIPLES — Pinned Scroll Animation (Frame 72 → Frame 73)
   GSAP ScrollTrigger + Lenis

   Flow:
   1. Initial (Frame 72): Centered orange headings & medium cards.
      Header (..work principles) and side text (/principles) and descriptions are hidden.
   2. As user scrolls (Pinned Section):
      - Header & side text fade/slide in
      - Description paragraphs fade & slide in beside each card
      - Cards & orange headings settle into full Frame 73 layout
   ══════════════════════════════════════════════════════════ */

(function () {
    'use strict';

    // ── LENIS SMOOTH SCROLL ──────────────────────────────
    const lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
    });

    lenis.on('scroll', ScrollTrigger.update);

    gsap.ticker.add((time) => {
        lenis.raf(time * 1000);
    });
    gsap.ticker.lagSmoothing(0);

    // ── INITIALIZATION ───────────────────────────────────
    function onReady(fn) {
        if (document.readyState === 'complete') {
            requestAnimationFrame(() => requestAnimationFrame(fn));
        } else {
            window.addEventListener('load', () => {
                requestAnimationFrame(() => requestAnimationFrame(fn));
            });
        }
    }

    onReady(function init() {
        const section = document.getElementById('principlesSection');
        if (!section) return;

        const principlesSide = section.querySelector('.principles-side');
        const principlesHeader = section.querySelector('.principles-header');
        const rowItems = section.querySelectorAll('.principles-row-item');
        const cards = section.querySelectorAll('.bento-card');
        const headings = section.querySelectorAll('.row-orange-heading');
        const descs = section.querySelectorAll('.row-desc-text');

        if (!rowItems.length) return;

        // ── KILL CONFLICTING SCROLLTRIGGERS ──────────────
        ScrollTrigger.getAll().forEach(st => {
            const trigger = st.vars && st.vars.trigger;
            if (trigger === '.principles-grid' || trigger === '.principles-header') {
                st.kill();
            }
            if (st.trigger && section.contains(st.trigger)) {
                st.kill();
            }
        });

        // ── INITIAL ANIMATION STATES (Frame 72) ──────────
        if (principlesHeader) {
            gsap.set(principlesHeader, { opacity: 0, y: -40 });
        }
        if (principlesSide) {
            gsap.set(principlesSide, { opacity: 0, x: -30 });
        }

        // Each description paragraph starts hidden & shifted
        descs.forEach((desc, i) => {
            const isReverse = rowItems[i].classList.contains('row-reverse');
            gsap.set(desc, {
                opacity: 0,
                x: isReverse ? -40 : 40,
                scale: 0.95
            });
        });

        // Cards start centered and clean
        cards.forEach(card => {
            gsap.set(card, {
                scale: 0.98,
                force3D: true
            });
        });

        // ── MASTER PINNED TIMELINE ───────────────────────
        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=250%',        // Scroll distance
                pin: true,
                scrub: 1.2,
                anticipatePin: 1,
                invalidateOnRefresh: true,
            }
        });

        // Step 1: Reveal Header & Side text
        if (principlesHeader) {
            tl.to(principlesHeader, {
                opacity: 1,
                y: 0,
                duration: 0.25,
                ease: 'power2.out'
            }, 0.1);
        }

        if (principlesSide) {
            tl.to(principlesSide, {
                opacity: 1,
                x: 0,
                duration: 0.25,
                ease: 'power2.out'
            }, 0.12);
        }

        // Step 2: Stagger reveal row descriptions & settle cards
        rowItems.forEach((row, i) => {
            const desc = row.querySelector('.row-desc-text');
            const card = row.querySelector('.bento-card');
            const heading = row.querySelector('.row-orange-heading');
            const startTime = 0.25 + i * 0.18;

            // Heading subtle scale/glow as user scrolls into row
            if (heading) {
                tl.to(heading, {
                    scale: 1.02,
                    duration: 0.15,
                    ease: 'power1.out',
                    yoyo: true,
                    repeat: 1
                }, startTime);
            }

            // Card scales to 1.0
            if (card) {
                tl.to(card, {
                    scale: 1,
                    duration: 0.2,
                    ease: 'power2.out'
                }, startTime);
            }

            // Description text fades and slides in
            if (desc) {
                tl.to(desc, {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    duration: 0.22,
                    ease: 'power2.out'
                }, startTime + 0.05);
            }
        });

        // Step 3: Final hold before unpinning
        tl.to({}, { duration: 0.1 });

        // ── RESIZE LISTENER ──────────────────────────────
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => ScrollTrigger.refresh(), 250);
        });
    });

})();
