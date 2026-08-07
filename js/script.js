/* ══════════════════════════════════════════════════════════
   ATHARV MASKE — Portfolio JS
   GSAP ScrollTrigger — Canvas Image Sequence + Parallax
   ══════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

    // ── Register GSAP plugins ─────────────────────────────
    gsap.registerPlugin(ScrollTrigger);

    // ══════════════════════════════════════════════════════
    // CANVAS IMAGE SEQUENCE — Scroll-Triggered
    // ══════════════════════════════════════════════════════
    const canvas = document.getElementById('scrollCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;
    const scrollAnimSection = document.getElementById('scrollAnimSection');
    const scrollAnimText = document.getElementById('scrollAnimText');

    const FRAME_COUNT = 240;
    const FOLDER = 'ezgif-201cc53c846e7b0c-jpg';

    // Build frame paths
    function framePath(index) {
        const num = String(index).padStart(3, '0');
        return `${FOLDER}/ezgif-frame-${num}.jpg`;
    }

    // Preload all images for butter-smooth playback
    const images = [];
    let loadedCount = 0;
    const frameObj = { frame: 0 };

    if (canvas && ctx && scrollAnimSection) {
        function preloadImages() {
            for (let i = 1; i <= FRAME_COUNT; i++) {
                const img = new Image();
                const primarySrc = framePath(i);
                img.src = primarySrc;
                
                img.onload = () => {
                    loadedCount++;
                    // Draw the first frame as soon as it or frame 1 loads
                    if (i === 1 || (loadedCount === 1 && canvas.width > 0)) {
                        drawFrame(0);
                    }
                    // Once all loaded, refresh ScrollTrigger & redraw current frame
                    if (loadedCount === FRAME_COUNT) {
                        drawFrame(frameObj.frame);
                        if (typeof ScrollTrigger !== 'undefined') {
                            ScrollTrigger.refresh();
                        }
                    }
                };

                img.onerror = () => {
                    // Fallback to root directory if subfolder path fails
                    img.onerror = null;
                    img.src = `ezgif-frame-${String(i).padStart(3, '0')}.jpg`;
                };

                images.push(img);
            }
        }

        // Resize canvas to fill viewport at high DPI
        function resizeCanvas() {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            canvas.width = window.innerWidth * dpr;
            canvas.height = window.innerHeight * dpr;
            canvas.style.width = window.innerWidth + 'px';
            canvas.style.height = window.innerHeight + 'px';
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            drawFrame(frameObj.frame);
        }

        // Draw a specific frame index on the canvas (cover fit)
        function drawFrame(index) {
            const rounded = Math.round(index);
            let img = images[rounded];

            // Smart fallback to nearest loaded frame if target frame is still preloading
            if (!img || !img.complete || img.naturalWidth === 0) {
                for (let offset = 1; offset < 30; offset++) {
                    const prev = images[rounded - offset];
                    if (prev && prev.complete && prev.naturalWidth > 0) { img = prev; break; }
                    const next = images[rounded + offset];
                    if (next && next.complete && next.naturalWidth > 0) { img = next; break; }
                }
            }

            if (!img || !img.complete || img.naturalWidth === 0) return;

            const cw = window.innerWidth;
            const ch = window.innerHeight;
            const iw = img.naturalWidth;
            const ih = img.naturalHeight;

            // Cover-fit calculation
            const scale = Math.max(cw / iw, ch / ih);
            const dw = iw * scale;
            const dh = ih * scale;
            const dx = (cw - dw) / 2;
            const dy = (ch - dh) / 2;

            ctx.clearRect(0, 0, cw, ch);
            ctx.drawImage(img, dx, dy, dw, dh);
        }

        // Init canvas
        resizeCanvas();
        preloadImages();
        window.addEventListener('resize', resizeCanvas);

        // ── GSAP ScrollTrigger for frame scrubbing ────────────
        gsap.to(frameObj, {
            frame: FRAME_COUNT - 1,
            snap: 'frame',
            ease: 'none',
            scrollTrigger: {
                trigger: scrollAnimSection,
                start: 'top top',
                end: 'bottom bottom',
                scrub: 0.4
            },
            onUpdate: () => {
                drawFrame(frameObj.frame);
            }
        });

        // ── Text reveal at the end of the animation ───────────
        if (scrollAnimText) {
            const textLines = scrollAnimText.querySelectorAll('.scroll-anim-line, .scroll-anim-ampersand');

            const textTl = gsap.timeline({
                scrollTrigger: {
                    trigger: scrollAnimSection,
                    start: '80% top',   // text starts appearing at 80% of scroll
                    end: 'bottom bottom',
                    scrub: 0.6
                }
            });

            // Fade in the container
            textTl.to(scrollAnimText, {
                opacity: 1,
                duration: 0.3,
                ease: 'power2.out'
            }, 0);

            // Stagger each line sliding in from the right
            textLines.forEach((line, i) => {
                textTl.to(line, {
                    opacity: 1,
                    x: 0,
                    duration: 0.4,
                    ease: 'power3.out'
                }, 0.05 + i * 0.1);
            });
        }
    }


    // ══════════════════════════════════════════════════════
    // HERO CARD ENTRANCE — GSAP ScrollTrigger
    // ══════════════════════════════════════════════════════
    const heroCard = document.getElementById('heroCard');
    if (heroCard) {
        heroCard.style.animation = 'none';
        gsap.fromTo(heroCard,
            { opacity: 0, y: 60, scale: 0.96 },
            {
                opacity: 1, y: 0, scale: 1,
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: heroCard,
                    start: 'top 90%',
                    end: 'top 40%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ══════════════════════════════════════════════════════
    // ABOUT SECTION REVEAL
    // ══════════════════════════════════════════════════════
    const aboutContent = document.querySelector('.about-content');
    if (aboutContent) {
        aboutContent.style.transition = 'none';
        gsap.fromTo(aboutContent,
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: aboutContent,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ══════════════════════════════════════════════════════
    // UPDATE CURRENT TIME
    // ══════════════════════════════════════════════════════
    const timeEl = document.getElementById('currentTime');
    function updateTime() {
        if (!timeEl) return;
        const now = new Date();
        let h = now.getHours();
        const m = String(now.getMinutes()).padStart(2, '0');
        const ampm = h >= 12 ? 'PM' : 'AM';
        h = h % 12 || 12;
        timeEl.textContent = `${String(h).padStart(2, '0')}:${m} ${ampm}`;
    }
    if (timeEl) {
        updateTime();
        setInterval(updateTime, 30000);
    }

    // ══════════════════════════════════════════════════════
    // NAV ACTIVE LINK HIGHLIGHT & SMOOTH SCROLLING
    // ══════════════════════════════════════════════════════
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    // ══════════════════════════════════════════════════════
    // MOBILE SLIDE-IN NAVIGATION DRAWER LOGIC
    // ══════════════════════════════════════════════════════
    const menuIcons = document.querySelectorAll('.menu-icon, .footer-menu-icon');
    const mobileDrawer = document.getElementById('mobileDrawer');
    const drawerClose = document.getElementById('drawerClose');
    const drawerBackdrop = document.getElementById('drawerBackdrop');
    const drawerLinks = document.querySelectorAll('.drawer-link');

    function openDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.add('open');
        mobileDrawer.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden';
        menuIcons.forEach(btn => btn.setAttribute('aria-expanded', 'true'));
    }

    function closeDrawer() {
        if (!mobileDrawer) return;
        mobileDrawer.classList.remove('open');
        mobileDrawer.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
        menuIcons.forEach(btn => btn.setAttribute('aria-expanded', 'false'));
    }

    menuIcons.forEach(icon => {
        icon.addEventListener('click', (e) => {
            e.stopPropagation();
            if (mobileDrawer && mobileDrawer.classList.contains('open')) {
                closeDrawer();
            } else {
                openDrawer();
            }
        });
    });

    if (drawerClose) drawerClose.addEventListener('click', closeDrawer);
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', closeDrawer);

    drawerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            drawerLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            closeDrawer();

            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetEl = document.querySelector(targetId);
                if (targetEl) {
                    targetEl.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && mobileDrawer && mobileDrawer.classList.contains('open')) {
            closeDrawer();
        }
    });

    // ══════════════════════════════════════════════════════
    // MOUSE PARALLAX + NOTH-STYLE INK SLIP CURSOR REVEAL
    // ══════════════════════════════════════════════════════
    const heroImageBase = document.getElementById('heroImageBase');
    const heroImageHelmet = document.getElementById('heroImageHelmet');
    const heroImageReveal = document.getElementById('heroImageReveal');
    const heroImageContainer = document.getElementById('heroImageContainer');
    const heroTitle = document.getElementById('heroTitle');
    const heroGlowOrb = document.getElementById('heroGlowOrb');
    const ambientGlow = document.getElementById('ambientGlow');
    const heroCard = document.getElementById('heroCard');

    const inkNodesGroup = document.getElementById('inkSlipNodesGroup');
    const inkDropletsGroup = document.getElementById('inkSlipDropletsGroup');

    let mouseX = 0, mouseY = 0;
    let currentX = 0, currentY = 0;
    let rafId = null;

    // Ink Slip Physics State
    let isHoveringImage = false;
    let hoverAmount = 0; // Smooth 0 to 1 scaling
    let targetPos = { x: -300, y: -300 };
    let prevPos = { x: -300, y: -300 };
    let velocity = { x: 0, y: 0, speed: 0, angle: 0 };

    // Primary Trail Nodes (6 nodes for liquid ink stream)
    const NUM_NODES = 6;
    const BASE_RADIUS = 165; // Generous size for reveal
    const NODE_SCALE_FACTORS = [1.0, 0.75, 0.55, 0.40, 0.28, 0.18];

    const trailNodes = Array.from({ length: NUM_NODES }).map((_, i) => ({
        x: -300,
        y: -300,
        r: 0,
        scaleFactor: NODE_SCALE_FACTORS[i],
        elem: null
    }));

    // Satellite Micro Splatters (10 droplets orbiting main ink pool)
    const NUM_SPLATTERS = 10;
    const splatterDroplets = Array.from({ length: NUM_SPLATTERS }).map((_, i) => {
        const angle = (i / NUM_SPLATTERS) * Math.PI * 2 + (Math.random() * 0.4 - 0.2);
        const distRatio = 0.7 + Math.random() * 0.4;
        const baseR = 10 + Math.random() * 18;
        return {
            angle,
            distRatio,
            baseR,
            r: 0,
            elem: null
        };
    });

    // Initialize SVG elements inside mask
    if (inkNodesGroup) {
        inkNodesGroup.innerHTML = '';
        trailNodes.forEach((node, i) => {
            if (i === 0) {
                // Main blob is an ellipse for velocity stretching
                const ellipse = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
                ellipse.setAttribute('fill', 'white');
                inkNodesGroup.appendChild(ellipse);
                node.elem = ellipse;
            } else {
                const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
                circle.setAttribute('fill', 'white');
                inkNodesGroup.appendChild(circle);
                node.elem = circle;
            }
        });
    }

    if (inkDropletsGroup) {
        inkDropletsGroup.innerHTML = '';
        splatterDroplets.forEach(drop => {
            const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
            circle.setAttribute('fill', 'white');
            inkDropletsGroup.appendChild(circle);
            drop.elem = circle;
        });
    }

    function onMouseMove(e) {
        const rect = heroCard ? heroCard.getBoundingClientRect() : { left: 0, top: 0, width: window.innerWidth, height: window.innerHeight };
        mouseX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
        mouseY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;

        if (heroImageContainer && isHoveringImage) {
            const imgRect = heroImageContainer.getBoundingClientRect();
            targetPos.x = e.clientX - imgRect.left;
            targetPos.y = e.clientY - imgRect.top;
        }
    }

    if (heroCard) {
        heroCard.addEventListener('mouseenter', (e) => {
            isHoveringImage = true;
            if (heroImageContainer) {
                const imgRect = heroImageContainer.getBoundingClientRect();
                targetPos.x = e.clientX - imgRect.left;
                targetPos.y = e.clientY - imgRect.top;
                // Snap nodes near cursor on initial entry
                trailNodes.forEach(node => {
                    node.x = targetPos.x;
                    node.y = targetPos.y;
                });
            }
        });
        heroCard.addEventListener('mouseleave', () => {
            isHoveringImage = false;
        });
    }

    function animateParallax() {
        // Parallax smooth interpolation
        currentX += (mouseX - currentX) * 0.06;
        currentY += (mouseY - currentY) * 0.06;

        // Perfectly aligned transforms applied to BOTH images
        const transformString = `scale(1.04) translate(${currentX * -12}px, ${currentY * -8}px)`;
        
        if (heroImageBase) heroImageBase.style.transform = transformString;
        if (heroImageHelmet) heroImageHelmet.style.transform = transformString;

        if (heroTitle) heroTitle.style.transform = `translate(${currentX * 8}px, ${currentY * 5}px)`;
        if (heroGlowOrb) heroGlowOrb.style.transform = `translate(${currentX * 20}px, ${currentY * 15}px)`;
        if (ambientGlow) ambientGlow.style.transform = `translate(${currentX * 30}px, ${currentY * 25}px)`;

        // Calculate cursor velocity & angle
        const vx = targetPos.x - prevPos.x;
        const vy = targetPos.y - prevPos.y;
        const rawSpeed = Math.hypot(vx, vy);
        velocity.speed += (rawSpeed - velocity.speed) * 0.2;
        if (rawSpeed > 0.5) {
            velocity.angle = Math.atan2(vy, vx);
        }
        prevPos.x = targetPos.x;
        prevPos.y = targetPos.y;

        // Interpolate hover scale factor
        const targetHover = isHoveringImage ? 1 : 0;
        hoverAmount += (targetHover - hoverAmount) * 0.12;

        // Update Ink Slip physics
        if (hoverAmount > 0.001) {
            // Node 0 follows target cursor
            trailNodes[0].x += (targetPos.x - trailNodes[0].x) * 0.28;
            trailNodes[0].y += (targetPos.y - trailNodes[0].y) * 0.28;
            trailNodes[0].r = hoverAmount * BASE_RADIUS * trailNodes[0].scaleFactor;

            // Rest of nodes follow the previous node to form liquid trail stream
            for (let i = 1; i < NUM_NODES; i++) {
                trailNodes[i].x += (trailNodes[i - 1].x - trailNodes[i].x) * 0.38;
                trailNodes[i].y += (trailNodes[i - 1].y - trailNodes[i].y) * 0.38;
                trailNodes[i].r = hoverAmount * BASE_RADIUS * trailNodes[i].scaleFactor;
            }

            // Render Node 0 as elongated ink ellipse when moving
            if (trailNodes[0].elem) {
                const stretch = Math.min(velocity.speed * 0.025, 0.7);
                const rx = trailNodes[0].r * (1 + stretch);
                const ry = Math.max(10, trailNodes[0].r / (1 + stretch * 0.5));
                const rotDeg = velocity.angle * (180 / Math.PI);

                trailNodes[0].elem.setAttribute('cx', trailNodes[0].x.toFixed(1));
                trailNodes[0].elem.setAttribute('cy', trailNodes[0].y.toFixed(1));
                trailNodes[0].elem.setAttribute('rx', rx.toFixed(1));
                trailNodes[0].elem.setAttribute('ry', ry.toFixed(1));
                trailNodes[0].elem.setAttribute('transform', `rotate(${rotDeg.toFixed(1)} ${trailNodes[0].x.toFixed(1)} ${trailNodes[0].y.toFixed(1)})`);
            }

            // Render Trail Circles (Nodes 1..N-1)
            for (let i = 1; i < NUM_NODES; i++) {
                if (trailNodes[i].elem) {
                    trailNodes[i].elem.setAttribute('cx', trailNodes[i].x.toFixed(1));
                    trailNodes[i].elem.setAttribute('cy', trailNodes[i].y.toFixed(1));
                    trailNodes[i].elem.setAttribute('r', trailNodes[i].r.toFixed(1));
                }
            }

            // Render Satellite Micro Splatters
            splatterDroplets.forEach(drop => {
                const currentDist = (trailNodes[0].r * drop.distRatio) + (velocity.speed * 0.4);
                const dropX = trailNodes[0].x + Math.cos(drop.angle) * currentDist;
                const dropY = trailNodes[0].y + Math.sin(drop.angle) * currentDist;
                drop.r = hoverAmount * drop.baseR;

                if (drop.elem) {
                    drop.elem.setAttribute('cx', dropX.toFixed(1));
                    drop.elem.setAttribute('cy', dropY.toFixed(1));
                    drop.elem.setAttribute('r', drop.r.toFixed(1));
                }
            });

            // Dual radial-gradient CSS mask fallback string for ultra-smooth rendering
            if (heroImageReveal) {
                const gradientList = trailNodes.map(p => `radial-gradient(circle ${p.r.toFixed(0)}px at ${p.x.toFixed(0)}px ${p.y.toFixed(0)}px, black 99%, transparent 100%)`).join(', ');
                heroImageReveal.style.webkitMaskImage = gradientList;
                heroImageReveal.style.maskImage = gradientList;
            }
        } else {
            if (heroImageReveal) {
                heroImageReveal.style.webkitMaskImage = 'none';
                heroImageReveal.style.maskImage = 'none';
            }
        }

        rafId = requestAnimationFrame(animateParallax);
    }

    if (window.matchMedia('(min-width: 768px) and (hover: hover)').matches) {
        document.addEventListener('mousemove', onMouseMove);
        animateParallax();
    }

    // ══════════════════════════════════════════════════════
    // CLEANUP
    // ══════════════════════════════════════════════════════
    window.addEventListener('beforeunload', () => {
        if (rafId) cancelAnimationFrame(rafId);
    });

    // ══════════════════════════════════════════════════════
    // SCROLL ANIMATIONS FOR OTHER SECTIONS
    // ══════════════════════════════════════════════════════
    
    // Animate section headers
    const sectionHeaders = document.querySelectorAll('.section-header, .principles-header');
    sectionHeaders.forEach(header => {
        gsap.fromTo(header,
            { opacity: 0, x: -30 },
            {
                opacity: 1, x: 0,
                duration: 0.8,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: header,
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    });

    // Animate project cards stagger
    const projectCards = document.querySelectorAll('.project-card');
    if (projectCards.length > 0) {
        gsap.fromTo(projectCards,
            { opacity: 0, y: 40 },
            {
                opacity: 1, y: 0,
                duration: 0.8,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.projects-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // Animate principles bento cards
    const bentoCards = document.querySelectorAll('.bento-card');
    if (bentoCards.length > 0) {
        gsap.fromTo(bentoCards,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0,
                duration: 0.8,
                stagger: 0.15,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.principles-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // Animate skills blocks
    const skillBlocks = document.querySelectorAll('.skill-block');
    if (skillBlocks.length > 0) {
        gsap.fromTo(skillBlocks,
            { opacity: 0, y: 30 },
            {
                opacity: 1, y: 0,
                duration: 0.6,
                stagger: 0.1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.skills-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // Animate timeline items
    const timelineItems = document.querySelectorAll('.timeline-item');
    if (timelineItems.length > 0) {
        gsap.fromTo(timelineItems,
            { opacity: 0, x: -20 },
            {
                opacity: 1, x: 0,
                duration: 0.8,
                stagger: 0.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.timeline',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // Animate achievement cards
    const achievementCards = document.querySelectorAll('.achievement-card');
    if (achievementCards.length > 0) {
        gsap.fromTo(achievementCards,
            { opacity: 0, scale: 0.9 },
            {
                opacity: 1, scale: 1,
                duration: 0.6,
                stagger: 0.1,
                ease: 'back.out(1.7)',
                scrollTrigger: {
                    trigger: '.achievements-grid',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ══════════════════════════════════════════════════════
    // FEATURED PROJECTS - HORIZONTAL SCROLL
    // ══════════════════════════════════════════════════════
    const fpPinContainer = document.getElementById('fpPinContainer');
    const fpTrack = document.getElementById('fpTrack');

    if (fpPinContainer && fpTrack) {
        const tween = gsap.to(fpTrack, {
            x: () => -(fpTrack.scrollWidth - window.innerWidth + 96),
            ease: "none"
        });

        ScrollTrigger.create({
            trigger: fpPinContainer,
            start: "top top",
            end: () => `+=${fpTrack.scrollWidth}`, 
            pin: true,
            animation: tween,
            scrub: 1,
            invalidateOnRefresh: true
        });
    }


    // ══════════════════════════════════════════════════════
    // BEST PROJECTS - OPTION WHEEL INITIALIZATION
    // ══════════════════════════════════════════════════════
    const wheelContainer = document.getElementById('projectWheelContainer');
    if (wheelContainer && typeof OptionWheel !== 'undefined') {
        const projectIds = [
            'portfolio',
            'eco-pickup',
            'bullet',
            'seran-perfume',
            'nexoresha-perfume',
            'nexoresha-landing',
            'nexoresha-clone',
            'codenova',
            'airsketch-ai',
            'nike-showcase'
        ];

        new OptionWheel(wheelContainer, {
            items: [
                'Personal Portfolio Website',
                'Eco Pickup Website',
                'Bullet Website',
                'Seran Perfume Website',
                'Nexoresha Perfume Website',
                'Nexoresha Landing Page',
                'Nexoresha Clone Website',
                'CodeNova Coding Platform',
                'AirSketch AI',
                'Nike Interactive Product Showcase'
            ],
            side: 'right', // The user requested it on the right side
            fontSize: 4.5, // "big"
            spacing: 1.5,
            textColor: '#444444',
            activeColor: '#ffffff', // Matches the dark theme palette
            inset: 60,
            curve: 1,
            tilt: 6,
            blur: 2,
            fade: 0.25,
            minOpacity: 0.05,
            smoothing: 200,
            loop: false,
            draggable: true,
            onSelect: (index, label) => {
                window.location.href = `projects.html#${projectIds[index]}`;
            }
        });
    }

    // ══════════════════════════════════════════════════════
    // FAQ ACCORDION LOGIC
    // ══════════════════════════════════════════════════════
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        const answer = item.querySelector('.faq-answer');
        
        const openAccordion = () => {
            const isActive = item.classList.contains('active');
            
            if (!isActive) {
                // Close all other items
                faqItems.forEach(otherItem => {
                    otherItem.classList.remove('active');
                    const otherAnswer = otherItem.querySelector('.faq-answer');
                    if (otherAnswer) otherAnswer.style.maxHeight = null;
                });
                
                // Open current item
                item.classList.add('active');
                answer.style.maxHeight = answer.scrollHeight + "px";
            }
        };

        // Open automatically on hover (desktop)
        question.addEventListener('mouseenter', openAccordion);
        // Fallback for tap (mobile)
        question.addEventListener('click', openAccordion);
    });

    // ══════════════════════════════════════════════════════
    // FAQ & CONTACT SCROLL ANIMATIONS
    // ══════════════════════════════════════════════════════
    const faqContactSection = document.querySelector('.faq-contact-section');
    if (faqContactSection) {
        gsap.fromTo('.faq-block', 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, y: 0, 
                duration: 1, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.faq-block',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );

        gsap.fromTo('.contact-block', 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, y: 0, 
                duration: 1, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.contact-block',
                    start: 'top 85%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ══════════════════════════════════════════════════════
    // FOOTER SCROLL ANIMATION
    // ══════════════════════════════════════════════════════
    const premiumFooter = document.querySelector('.premium-footer');
    if (premiumFooter) {
        gsap.fromTo('.footer-main', 
            { opacity: 0, y: 60 },
            { 
                opacity: 1, y: 0, 
                duration: 1.2, 
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: '.premium-footer',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
        
        gsap.fromTo('.footer-bg-text', 
            { opacity: 0, scale: 0.95 },
            { 
                opacity: 1, scale: 1, 
                duration: 2, 
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: '.premium-footer',
                    start: 'top 80%',
                    toggleActions: 'play none none none'
                }
            }
        );
    }

    // ══════════════════════════════════════════════════════
    // CURVED LOOP INITIALIZATION
    // ══════════════════════════════════════════════════════
    const curvedLoopContainer = document.getElementById('curvedLoopContainer');
    if (curvedLoopContainer) {
        new CurvedLoop(curvedLoopContainer, {
            marqueeText: "DESIGN • BUILD • CREATE • REPEAT • ",
            speed: 2,
            interactive: true
        });
    }

});

// ══════════════════════════════════════════════════════
// CURVED LOOP COMPONENT (Vanilla JS Translation)
// ══════════════════════════════════════════════════════
class CurvedLoop {
    constructor(container, options = {}) {
        this.container = container;
        this.marqueeText = options.marqueeText || "DESIGN • BUILD • CREATE • REPEAT • ";
        if (!/\s$/.test(this.marqueeText)) this.marqueeText += ' ';
        this.speed = options.speed || 2;
        this.direction = options.direction || 'left';
        this.interactive = options.interactive !== false;

        this.measureEl = this.container.querySelector('#cl-measure');
        this.textPathEl = this.container.querySelector('#cl-text-path');
        
        this.measureEl.textContent = this.marqueeText;
        
        this.spacing = 0;
        this.offset = 0;
        this.drag = false;
        this.lastX = 0;
        this.vel = 0;
        this.dir = this.direction;

        this.init();
    }

    init() {
        // Wait a tick for fonts to load and measurements to be accurate
        setTimeout(() => {
            this.spacing = this.measureEl.getComputedTextLength();
            if (this.spacing === 0) {
                // fallback if hidden
                this.spacing = this.marqueeText.length * 50; 
            }
            
            const repeats = Math.ceil(1800 / this.spacing) + 2;
            this.textPathEl.textContent = Array(repeats).fill(this.marqueeText).join('');
            
            this.offset = -this.spacing;
            this.textPathEl.setAttribute('startOffset', this.offset + 'px');
            
            this.container.style.visibility = 'visible';
            this.bindEvents();
            this.loop();
        }, 100);
    }

    bindEvents() {
        if (!this.interactive) return;
        
        this.container.style.cursor = 'grab';
        
        this.container.addEventListener('pointerdown', (e) => {
            this.drag = true;
            this.lastX = e.clientX;
            this.vel = 0;
            this.container.setPointerCapture(e.pointerId);
            this.container.style.cursor = 'grabbing';
        });

        this.container.addEventListener('pointermove', (e) => {
            if (!this.drag) return;
            const dx = e.clientX - this.lastX;
            this.lastX = e.clientX;
            this.vel = dx;

            this.updateOffset(dx);
        });

        const endDrag = () => {
            if (!this.drag) return;
            this.drag = false;
            this.dir = this.vel > 0 ? 'right' : 'left';
            this.container.style.cursor = 'grab';
        };

        this.container.addEventListener('pointerup', endDrag);
        this.container.addEventListener('pointercancel', endDrag);
        this.container.addEventListener('pointerleave', endDrag);
    }

    updateOffset(delta) {
        this.offset += delta;
        if (this.offset <= -this.spacing) this.offset += this.spacing;
        if (this.offset > 0) this.offset -= this.spacing;
        this.textPathEl.setAttribute('startOffset', this.offset + 'px');
    }

    loop() {
        if (!this.drag) {
            const delta = this.dir === 'right' ? this.speed : -this.speed;
            this.updateOffset(delta);
        }
        requestAnimationFrame(() => this.loop());
    }
}
