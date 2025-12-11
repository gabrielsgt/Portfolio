document.addEventListener('DOMContentLoaded', () => {
    // --- SÉLECTEURS ---
    const viewer = document.getElementById('spline');
    const loader = document.getElementById('loader');
    const counterEl = document.getElementById('counter');
    const barEl = document.getElementById('bar');
    const contentContainer = document.querySelector('.pro-content-container');
    const scrollIndicator = document.getElementById('scrollIndicator');

    // Nouveaux sélecteurs pour la section 2
    const navbar = document.querySelector('.sticky-nav');
    const heroSection = document.querySelector('.hero-section');
    const contentSection = document.querySelector('.content-section');
    const reveals = document.querySelectorAll('.reveal');

    // --- OPTIMISATION : Préchargement de l'image pendant le loader ---
    const profileImg = new Image();
    profileImg.src = '../images/gabriel.jpg';

    // --- LOGIQUE DU LOADER (Code existant) ---
    let progress = 0;
    let isRevealed = false;
    let resourcesLoaded = {
        spline: false,
        image: false
    };

    // Marquer l'image comme chargée
    profileImg.onload = () => {
        resourcesLoaded.image = true;
        checkAllResourcesLoaded();
    };

    const simulator = setInterval(() => {
        if (progress < 85) {
            progress += Math.random() * 5;
            if (progress > 85) progress = 85;
            const rounded = Math.round(progress);
            counterEl.textContent = rounded;
            barEl.style.width = `${rounded}%`;
        }
    }, 100);

    const checkAllResourcesLoaded = () => {
        if (resourcesLoaded.spline && resourcesLoaded.image) {
            finishLoader();
        }
    };

    const finishLoader = () => {
        if (isRevealed) return;
        isRevealed = true;
        clearInterval(simulator);

        // Animation finale du compteur
        let finalCount = progress;
        const finalInterval = setInterval(() => {
            finalCount += 2;
            if (finalCount >= 100) {
                finalCount = 100;
                clearInterval(finalInterval);
            }
            counterEl.textContent = Math.round(finalCount);
            barEl.style.width = `${Math.round(finalCount)}%`;
        }, 20);

        if (viewer.shadowRoot) {
            const style = document.createElement('style');
            style.textContent = '#logo { display: none !important; }';
            viewer.shadowRoot.appendChild(style);
        }

        setTimeout(() => {
            loader.classList.add('slide-up');

            // Nettoyage du will-change après les animations pour libérer la mémoire
            setTimeout(() => {
                if (contentContainer) {
                    contentContainer.classList.add('visible');

                    // Retirer will-change après l'animation initiale
                    setTimeout(() => {
                        contentContainer.style.willChange = 'auto';
                    }, 1000);
                }
            }, 300);
        }, 800);
    };

    // Marquer spline comme chargé
    viewer.addEventListener('load', () => {
        resourcesLoaded.spline = true;
        checkAllResourcesLoaded();
    });

    // Fallback si Spline met trop de temps
    setTimeout(() => {
        resourcesLoaded.spline = true;
        checkAllResourcesLoaded();
    }, 3000);

    const checkLoop = setInterval(() => {
        if (viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas')) {
            resourcesLoaded.spline = true;
            checkAllResourcesLoaded();
            clearInterval(checkLoop);
        }
    }, 200);


    // --- GESTION DE L'INDICATEUR DE SCROLL (Flèche) ---

    // Optimisation avec requestAnimationFrame et throttle
    let ticking = false;
    let lastScrollY = 0;

    window.addEventListener('scroll', () => {
        lastScrollY = window.scrollY;

        if (!ticking) {
            window.requestAnimationFrame(() => {
                // Flèche de scroll
                if (lastScrollY > 100) {
                    scrollIndicator.classList.add('hidden');
                } else {
                    scrollIndicator.classList.remove('hidden');
                }

                ticking = false;
            });
            ticking = true;
        }
    }, { passive: true });

    // 2. Clic pour descendre (Nouveau)
    if (scrollIndicator && contentSection) {
        scrollIndicator.addEventListener('click', () => {
            contentSection.scrollIntoView({ behavior: 'smooth' });
        });
    }


    // --- GESTION DE LA NAVBAR STICKY (Simple) ---
    const heroObserverOptions = {
        rootMargin: "-150px 0px 0px 0px"
    };

    const heroObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) {
                navbar.classList.add('visible');
            } else {
                navbar.classList.remove('visible');
            }
        });
    }, heroObserverOptions);

    if (heroSection) {
        heroObserver.observe(heroSection);
    }


    // --- ANIMATION DES ÉLÉMENTS AU SCROLL AVEC GSAP (Amélioré) ---
    const revealObserverOptions = {
        threshold: 0.15,
        rootMargin: '0px 0px -50px 0px'
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Animation avec GSAP pour plus de contrôle
                gsap.to(entry.target, {
                    duration: 0.9,
                    opacity: 1,
                    y: 0,
                    ease: "power3.out",
                    delay: index * 0.1, // Effet cascade
                    onStart: () => {
                        entry.target.classList.add('active');
                    },
                    onComplete: () => {
                        entry.target.style.willChange = 'auto';
                    }
                });

                observer.unobserve(entry.target);
            }
        });
    }, revealObserverOptions);

    // Observer uniquement quand le loader est terminé
    setTimeout(() => {
        reveals.forEach(reveal => {
            revealObserver.observe(reveal);
        });
    }, 1500);

    // --- OPTIMISATION : Réduire les repaints sur scroll ---
    // Désactiver les animations pendant le scroll rapide
    let scrollTimeout;
    window.addEventListener('scroll', () => {
        document.body.classList.add('is-scrolling');
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            document.body.classList.remove('is-scrolling');
        }, 150);
    }, { passive: true });
    // --- GESTION DES TOOLTIPS PARCOURS (Mobile & Desktop Click) ---
    const infoTriggers = document.querySelectorAll('.info-trigger');

    infoTriggers.forEach(trigger => {
        trigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Empêche la propagation au document

            // Fermer les autres tooltips
            infoTriggers.forEach(t => {
                if (t !== trigger) t.classList.remove('active');
            });

            // Toggle celui-ci
            trigger.classList.toggle('active');
        });
    });

    // Fermer les tooltips si on clique ailleurs
    document.addEventListener('click', () => {
        infoTriggers.forEach(trigger => {
            trigger.classList.remove('active');
        });
    });

    // --- SCROLLSPY NAVBAR (Active State) ---
    const sections = document.querySelectorAll('section');
    const navLinks = document.querySelectorAll('.nav-links a');

    const scrollSpyOptions = {
        threshold: 0.3 // Active quand 30% de la section est visible
    };

    const scrollSpyObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Retirer la classe active de tous les liens
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    // Ajouter la classe active au lien correspondant
                    if (link.getAttribute('href').substring(1) === entry.target.id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, scrollSpyOptions);

    sections.forEach(section => {
        if (section.id) scrollSpyObserver.observe(section);
    });
    // --- SECTION 4: PROJECTS LOGIC ---

    // 1. Year Selector
    const yearBtns = document.querySelectorAll('.year-btn');
    const yearContents = document.querySelectorAll('.year-content');

    yearBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update buttons state
            yearBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            // Get selected year
            const year = btn.getAttribute('data-year');
            const targetContent = document.getElementById(`year-${year}-content`);

            // Update content with animation
            yearContents.forEach(content => {
                if (content.classList.contains('active')) {
                    content.classList.remove('active');
                }
            });

            if (targetContent) {
                targetContent.classList.add('active');
                // Re-trigger animation
                targetContent.style.animation = 'none';
                targetContent.offsetHeight; /* trigger reflow */
                targetContent.style.animation = 'fadeIn 0.5s ease-out forwards';
            }
        });
    });

    // 2. Modals Logic
    const modalOverlay = document.getElementById('modal-overlay');
    const projectModals = document.querySelectorAll('.project-modal');

    // Function to open modal (exposed to window for onclick in HTML)
    window.openModal = (modalId) => {
        const modal = document.getElementById(modalId);
        if (modal && modalOverlay) {
            modalOverlay.classList.add('active');
            modal.classList.add('active');
            document.body.style.overflow = 'hidden'; // Prevent scrolling
        }
    };

    // Function to close all modals
    window.closeModal = () => {
        if (modalOverlay) modalOverlay.classList.remove('active');
        projectModals.forEach(modal => modal.classList.remove('active'));
        document.body.style.overflow = ''; // Restore scrolling
    };

    // Close on overlay click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', window.closeModal);
    }

    // Close on ESC key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') window.closeModal();
    });

    // --- SECTION 5: CONTACT SCROLL RESTORATION ---

    // 1. Restore scroll position if saved
    const savedScroll = sessionStorage.getItem('portfolioScrollPosition');
    if (savedScroll) {
        // Wait slightly for layout to settle
        setTimeout(() => {
            window.scrollTo({
                top: parseInt(savedScroll, 10),
                behavior: 'instant'
            });
            sessionStorage.removeItem('portfolioScrollPosition');
        }, 50);
    }

    // 2. Save scroll position on Contact click
    const contactBtn = document.querySelector('.nav-contact');
    if (contactBtn) {
        contactBtn.addEventListener('click', (e) => {
            sessionStorage.setItem('portfolioScrollPosition', window.scrollY);
        });
    }

});