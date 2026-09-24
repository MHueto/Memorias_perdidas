(() => {
    const videos = Array.from(document.querySelectorAll('.menu-background__video'));
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const crossfadeDuration = 1.1;
    let activeIndex = 0;
    let isCrossfading = false;
    let animationFrame;

    if (videos.length !== 2) return;

    const stopForReducedMotion = () => {
        cancelAnimationFrame(animationFrame);
        videos.forEach((video, index) => {
            video.pause();
            video.currentTime = 0;
            video.classList.toggle('is-visible', index === 0);
        });
    };

    const startCrossfade = async () => {
        if (isCrossfading || reducedMotion.matches) return;

        const current = videos[activeIndex];
        const nextIndex = activeIndex === 0 ? 1 : 0;
        const next = videos[nextIndex];

        if (next.readyState < HTMLMediaElement.HAVE_FUTURE_DATA) return;

        isCrossfading = true;
        next.currentTime = 0;

        try {
            await next.play();
        } catch {
            isCrossfading = false;
            return;
        }

        next.classList.add('is-visible');
        current.classList.remove('is-visible');

        window.setTimeout(() => {
            current.pause();
            current.currentTime = 0;
            activeIndex = nextIndex;
            isCrossfading = false;
        }, crossfadeDuration * 1000);
    };

    const watchForLoop = () => {
        const activeVideo = videos[activeIndex];
        const timeRemaining = activeVideo.duration - activeVideo.currentTime;

        if (
            Number.isFinite(activeVideo.duration) &&
            timeRemaining > 0 &&
            timeRemaining <= crossfadeDuration
        ) {
            startCrossfade();
        }

        animationFrame = requestAnimationFrame(watchForLoop);
    };

    const begin = async () => {
        if (reducedMotion.matches) {
            stopForReducedMotion();
            return;
        }

        try {
            await videos[0].play();
            watchForLoop();
        } catch {
            // O poster continua visível caso o navegador bloqueie a reprodução automática.
        }
    };

    if (videos[0].readyState >= HTMLMediaElement.HAVE_METADATA) {
        begin();
    } else {
        videos[0].addEventListener('loadedmetadata', begin, { once: true });
    }

    videos.forEach((video, index) => {
        video.addEventListener('ended', () => {
            if (!isCrossfading && !reducedMotion.matches && index === activeIndex) {
                video.currentTime = 0;
                video.play();
            }
        });
    });

    reducedMotion.addEventListener('change', () => {
        if (reducedMotion.matches) {
            stopForReducedMotion();
        } else {
            activeIndex = 0;
            isCrossfading = false;
            begin();
        }
    });
})();
