export const initLandingPhone = () => {
    const landing = document.querySelector('.landing');

    if (!landing) return;

    const sections = {
        hero: landing.querySelector('[data-landing-step="hero"]'),
        fsrs: landing.querySelector('[data-landing-step="fsrs"]'),
        features: landing.querySelector('[data-landing-step="features"]'),
    };

    const phones = {
        hero: landing.querySelector('[data-story-phone="hero"]'),
        fsrs: landing.querySelector('[data-story-phone="fsrs"]'),
        features: landing.querySelector('[data-story-phone="features"]'),
    };

    if (!sections.hero || !sections.fsrs || !sections.features) return;
    if (!phones.hero || !phones.fsrs) return;

    let activeStep = 'hero';
    let isAnimating = false;
    let lastScrollY = window.scrollY;

    const setActiveStep = (step) => {
        landing.dataset.storyActive = step;
        activeStep = step;
    };

    const getDirection = () => {
        const currentScrollY = window.scrollY;
        const direction = currentScrollY >= lastScrollY ? 'down' : 'up';

        lastScrollY = currentScrollY;

        return direction;
    };

    const createTraveler = (sourcePhone) => {
        const rect = sourcePhone.getBoundingClientRect();
        const traveler = document.createElement('div');
        const clone = sourcePhone.cloneNode(true);

        traveler.className = 'landing-phone-traveler';

        traveler.style.width = `${rect.width}px`;
        traveler.style.height = `${rect.height}px`;
        traveler.style.left = '0';
        traveler.style.top = '0';
        traveler.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;

        clone.classList.remove('is-story-hidden');
        clone.removeAttribute('data-story-phone');

        traveler.append(clone);
        landing.append(traveler);

        return {
            traveler,
            rect,
        };
    };

    const animateTravelerToRect = ({ traveler, fromRect, toRect, duration = 850, offset = { x: 0, y: 0 } }) => {
        return new Promise((resolve) => {
            const deltaX = toRect.left + offset.x - fromRect.left;
            const deltaY = toRect.top + offset.y - fromRect.top;
            const scaleX = toRect.width / fromRect.width;
            const scaleY = toRect.height / fromRect.height;

            traveler.animate(
                [
                    {
                        transform: `translate3d(${fromRect.left}px, ${fromRect.top}px, 0) scale(1, 1)`,
                        opacity: 1,
                    },
                    {
                        transform: `translate3d(${fromRect.left + deltaX}px, ${fromRect.top  + deltaY/1.6}px, 0) scale(${scaleX}, ${scaleY})`,
                        opacity: 1,
                    },
                ],
                {
                    duration,
                    easing: 'cubic-bezier(.22, .61, .36, 1)',
                    fill: 'forwards',
                }
            ).addEventListener('finish', resolve, { once: true });
        });
    };

    const animateTravelerExitRight = ({ traveler, fromRect, duration = 720 }) => {
        return new Promise((resolve) => {
            traveler.animate(
                [
                    {
                        transform: `translate3d(${fromRect.left}px, ${fromRect.top}px, 0) scale(1) rotate(0deg)`,
                        opacity: 1,
                    },
                    {
                        transform: `translate3d(${window.innerWidth + 120}px, ${fromRect.top - 24}px, 0) scale(.92) rotate(8deg)`,
                        opacity: 0,
                    },
                ],
                {
                    duration,
                    easing: 'cubic-bezier(.55, 0, .1, 1)',
                    fill: 'forwards',
                }
            ).addEventListener('finish', resolve, { once: true });
        });
    };

    const animateTravelerEnterFromRight = ({ traveler, toRect, duration = 720 }) => {
        const fromRect = {
            left: window.innerWidth + 120,
            top: toRect.top - 24,
            width: toRect.width,
            height: toRect.height,
        };

        traveler.style.width = `${toRect.width}px`;
        traveler.style.height = `${toRect.height}px`;
        traveler.style.transform = `translate3d(${fromRect.left}px, ${fromRect.top}px, 0) scale(.92) rotate(8deg)`;
        traveler.style.opacity = '0';

        return new Promise((resolve) => {
            traveler.animate(
                [
                    {
                        transform: `translate3d(${fromRect.left}px, ${fromRect.top}px, 0) scale(.92) rotate(8deg)`,
                        opacity: 0,
                    },
                    {
                        transform: `translate3d(${toRect.left}px, ${toRect.top}px, 0) scale(1) rotate(0deg)`,
                        opacity: 1,
                    },
                ],
                {
                    duration,
                    easing: 'cubic-bezier(.22, .61, .36, 1)',
                    fill: 'forwards',
                }
            ).addEventListener('finish', resolve, { once: true });
        });
    };

    const moveHeroToFsrs = async () => {
        if (isAnimating) return;

        isAnimating = true;

        const sourcePhone = phones.hero;
        const targetPhone = phones.fsrs;

        const { traveler, rect: fromRect } = createTraveler(sourcePhone);
        const toRect = targetPhone.getBoundingClientRect();

        sourcePhone.classList.add('is-story-hidden');
        targetPhone.classList.add('is-story-hidden');

        await animateTravelerToRect({
            traveler,
            fromRect,
            toRect,
            duration: 900,
            offset: {
                x: 0,
                y: -24,
            },
        });

        traveler.remove();

        setActiveStep('fsrs');

        sourcePhone.classList.remove('is-story-hidden');
        targetPhone.classList.remove('is-story-hidden');

        isAnimating = false;
    };

    const moveFsrsToHero = async () => {
        if (isAnimating) return;

        isAnimating = true;

        const sourcePhone = phones.fsrs;
        const targetPhone = phones.hero;

        const { traveler, rect: fromRect } = createTraveler(sourcePhone);
        const toRect = targetPhone.getBoundingClientRect();

        sourcePhone.classList.add('is-story-hidden');
        targetPhone.classList.add('is-story-hidden');

        await animateTravelerToRect({
            traveler,
            fromRect,
            toRect,
            duration: 900,
        });

        traveler.remove();

        setActiveStep('hero');

        sourcePhone.classList.remove('is-story-hidden');
        targetPhone.classList.remove('is-story-hidden');

        isAnimating = false;
    };

    const exitFsrsToFeatures = async () => {
        if (isAnimating) return;

        isAnimating = true;

        const sourcePhone = phones.fsrs;
        const { traveler, rect: fromRect } = createTraveler(sourcePhone);

        sourcePhone.classList.add('is-story-hidden');

        await animateTravelerExitRight({
            traveler,
            fromRect,
            duration: 720,
        });

        traveler.remove();

        setActiveStep('features');

        sourcePhone.classList.remove('is-story-hidden');

        isAnimating = false;
    };

    const enterFsrsFromFeatures = async () => {
        if (isAnimating) return;

        isAnimating = true;

        const targetPhone = phones.fsrs;
        const toRect = targetPhone.getBoundingClientRect();
        const traveler = document.createElement('div');
        const clone = targetPhone.cloneNode(true);

        traveler.className = 'landing-phone-traveler';
        traveler.style.width = `${toRect.width}px`;
        traveler.style.height = `${toRect.height}px`;
        traveler.style.left = '0';
        traveler.style.top = '0';

        clone.classList.remove('is-story-hidden');
        clone.removeAttribute('data-story-phone');

        traveler.append(clone);
        landing.append(traveler);

        targetPhone.classList.add('is-story-hidden');

        await animateTravelerEnterFromRight({
            traveler,
            toRect,
            duration: 720,
        });

        traveler.remove();

        setActiveStep('fsrs');

        targetPhone.classList.remove('is-story-hidden');

        isAnimating = false;
    };

    const getCurrentStepByViewport = () => {
        const viewportCenter = window.innerHeight / 2;

        const values = Object.entries(sections).map(([step, section]) => {
            const rect = section.getBoundingClientRect();
            const sectionCenter = rect.top + rect.height / 2;
            const distance = Math.abs(sectionCenter - viewportCenter);

            return {
                step,
                distance,
            };
        });

        return values.sort((a, b) => a.distance - b.distance)[0]?.step ?? 'hero';
    };

    const handleScroll = () => {
        const direction = getDirection();
        const nextStep = getCurrentStepByViewport();

        if (nextStep === activeStep || isAnimating) return;

        if (activeStep === 'hero' && nextStep === 'fsrs') {
            moveHeroToFsrs();
            return;
        }

        if (activeStep === 'fsrs' && nextStep === 'hero') {
            moveFsrsToHero();
            return;
        }

        if (activeStep === 'fsrs' && nextStep === 'features' && direction === 'down') {
            exitFsrsToFeatures();
            return;
        }

        if (activeStep === 'features' && nextStep === 'fsrs' && direction === 'up') {
            enterFsrsFromFeatures();
            return;
        }

        setActiveStep(nextStep);
    };

    const init = () => {
        setActiveStep('hero');

        window.addEventListener('scroll', handleScroll, {
            passive: true,
        });

        window.addEventListener('resize', () => {
            setActiveStep(getCurrentStepByViewport());
        });
    };

    init();
};
