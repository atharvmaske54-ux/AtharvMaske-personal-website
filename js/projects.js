document.addEventListener('DOMContentLoaded', () => {
    gsap.registerPlugin(ScrollTrigger);

    const projects = document.querySelectorAll('.project-showcase-item');

    projects.forEach(project => {
        const label = project.querySelector('.ps-vertical-label');
        const imageCard = project.querySelector('.ps-image-card');
        const detailsCard = project.querySelector('.ps-details-card');

        // Vertical label fades upward
        gsap.fromTo(label, 
            { opacity: 0, y: 50 },
            { 
                opacity: 1, 
                y: 0, 
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: project,
                    scroller: '.projects-container', // Important since the container is scrolling, not window
                    start: 'top 70%',
                    toggleActions: 'play reverse play reverse'
                }
            }
        );

        // Image card slides from left
        gsap.fromTo(imageCard, 
            { opacity: 0, x: -100 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: project,
                    scroller: '.projects-container',
                    start: 'top 70%',
                    toggleActions: 'play reverse play reverse'
                }
            }
        );

        // Details card slides from right
        gsap.fromTo(detailsCard, 
            { opacity: 0, x: 100 },
            { 
                opacity: 1, 
                x: 0, 
                duration: 1.2,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: project,
                    scroller: '.projects-container',
                    start: 'top 70%',
                    toggleActions: 'play reverse play reverse'
                }
            }
        );
    });

    // Check if there's a hash in URL and scroll to it
    if (window.location.hash) {
        const target = document.querySelector(window.location.hash);
        if (target) {
            setTimeout(() => {
                target.scrollIntoView({ behavior: 'smooth' });
            }, 100);
        }
    }
});
