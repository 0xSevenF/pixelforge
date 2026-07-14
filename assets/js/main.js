/**
 * Wena — Site interactions
 */

(function () {
    'use strict';

    // ── Theme ────────────────────────────────────────────
    const THEME_KEY = 'wena-theme';
    const root = document.documentElement;
    const themeToggle = document.getElementById('themeToggle');
    const logoImgs = document.querySelectorAll('.nav-logo img, .footer-logo-img');

    function setTheme(theme) {
        root.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateLogos(theme);
        updateThemeColor(theme);
    }

    function updateLogos(theme) {
        const src = theme === 'dark'
            ? 'assets/icons/wena-white.svg'
            : 'assets/icons/wena-black.svg';
        logoImgs.forEach(img => { img.src = src; });
    }

    function updateThemeColor(theme) {
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.content = theme === 'dark' ? '#080808' : '#FAFAFA';
    }

    const saved = localStorage.getItem(THEME_KEY);
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setTheme(saved || (prefersDark ? 'dark' : 'light'));

    themeToggle?.addEventListener('click', () => {
        const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        setTheme(next);
    });

    // ── Navigation scroll behavior ───────────────────────
    const nav = document.querySelector('.nav');
    let lastScroll = 0;
    let ticking = false;

    function onScroll() {
        const y = window.pageYOffset;

        if (nav) {
            nav.classList.toggle('scrolled', y > 40);
            if (y > 200) {
                nav.classList.toggle('nav-hidden', y > lastScroll);
            } else {
                nav.classList.remove('nav-hidden');
            }
        }

        lastScroll = y;
        ticking = false;
    }

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(onScroll);
            ticking = true;
        }
    }, { passive: true });

    // ── Mobile menu ────────────────────────────────────
    const navToggle = document.getElementById('navToggle');
    const mobileMenu = document.getElementById('mobileMenu');

    function closeMobileMenu() {
        mobileMenu?.classList.remove('open');
        document.body.style.overflow = '';
        navToggle?.setAttribute('aria-expanded', 'false');
    }

    navToggle?.addEventListener('click', () => {
        const open = mobileMenu?.classList.toggle('open');
        document.body.style.overflow = open ? 'hidden' : '';
        navToggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });

    mobileMenu?.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });

    // ── Linux modal ────────────────────────────────────
    const modal = document.getElementById('linuxModal');
    const closeBtn = document.getElementById('linuxModalClose');

    function openModal() {
        modal?.classList.add('open');
        document.body.style.overflow = 'hidden';
    }

    function closeModal() {
        modal?.classList.remove('open');
        document.body.style.overflow = '';
    }

    document.querySelectorAll('[data-linux-modal]').forEach(btn => {
        btn.addEventListener('click', openModal);
    });

    closeBtn?.addEventListener('click', closeModal);

    modal?.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (modal?.classList.contains('open')) closeModal();
            closeMobileMenu();
        }
    });

    // ── Email obfuscation ──────────────────────────────
    (function () {
        function decode(parts) {
            return parts.map((n) => String.fromCharCode(n)).join('');
        }

        function getEmail() {
            return decode([109, 97, 105, 108]) + decode([64]) + decode([120, 107, 120, 46, 97, 116]);
        }

        function bindContactLink(link) {
            if (!link) return;
            link.setAttribute('aria-label', link.textContent + ' — click to reveal address');

            link.addEventListener('click', (e) => {
                e.preventDefault();
                const email = getEmail();
                link.textContent = email;
                link.href = 'mailto:' + email;
                link.classList.add('is-revealed');
                link.setAttribute('aria-label', 'Email ' + email);
                window.location.href = 'mailto:' + email;
            });
        }

        bindContactLink(document.getElementById('contact-email'));
        bindContactLink(document.getElementById('footer-contact'));
    })();

    // ── Crypto copy ────────────────────────────────────
    document.querySelectorAll('.crypto-item').forEach(item => {
        item.addEventListener('click', () => {
            const address = item.getAttribute('data-address');
            if (!address) return;
            navigator.clipboard.writeText(address).then(showToast).catch(() => {});
        });
    });

    function showToast() {
        const toast = document.getElementById('toast');
        toast?.classList.add('show');
        setTimeout(() => toast?.classList.remove('show'), 3000);
    }

    // ── Smooth scroll ──────────────────────────────────
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href === '#') return;
            const target = document.querySelector(href);
            if (!target) return;
            e.preventDefault();
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    });

    // ── Intersection observer ──────────────────────────
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) entry.target.classList.add('visible');
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll(
        '.feature-block, .gallery-piece, .tech-item, .community-card, .workflow-demo, .screenshot-feature, .reveal'
    ).forEach(el => observer.observe(el));

    // ── Hero carousel ──────────────────────────────────
    const mobileQuery = window.matchMedia('(max-width: 768px)');

    function getActiveHeroSlides() {
        return document.querySelectorAll(
            mobileQuery.matches ? '.hero-slide--mobile' : '.hero-slide--desktop'
        );
    }

    function resetHeroCarousel() {
        document.querySelectorAll('.hero-slide').forEach(slide => slide.classList.remove('is-active'));
        const slides = getActiveHeroSlides();
        slides[0]?.classList.add('is-active');
        return slides;
    }

    let heroSlides = resetHeroCarousel();
    let heroIndex = 0;
    let heroTimer;

    function startHeroCarousel() {
        clearInterval(heroTimer);
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

        heroSlides = resetHeroCarousel();
        heroIndex = 0;

        heroTimer = setInterval(() => {
            if (!heroSlides.length) return;
            heroSlides[heroIndex].classList.remove('is-active');
            heroIndex = (heroIndex + 1) % heroSlides.length;
            heroSlides[heroIndex].classList.add('is-active');
        }, 9000);
    }

    startHeroCarousel();
    mobileQuery.addEventListener('change', startHeroCarousel);
})();
