document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('spline');
    const loader = document.getElementById('loader');
    const counterEl = document.getElementById('counter');
    const barEl = document.getElementById('bar');

    // --- LOADER LOGIC ---
    let progress = 0;
    let isRevealed = false;
    let splineLoaded = false;

    // Simulate progress
    const simulator = setInterval(() => {
        if (progress < 90) {
            progress += Math.random() * 5;
            if (progress > 90) progress = 90;
            const rounded = Math.round(progress);
            counterEl.textContent = rounded;
            barEl.style.width = `${rounded}%`;
        }
    }, 100);

    const finishLoader = () => {
        if (isRevealed) return;
        isRevealed = true;
        clearInterval(simulator);

        // Final count animation
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

        // Remove watermark
        if (viewer.shadowRoot) {
            const style = document.createElement('style');
            style.textContent = '#logo { display: none !important; }';
            viewer.shadowRoot.appendChild(style);
        }

        setTimeout(() => {
            loader.classList.add('slide-up');
        }, 800);
    };

    // Spline load event
    viewer.addEventListener('load', () => {
        splineLoaded = true;
        finishLoader();
    });

    // Fallback if load event misses or takes too long
    setTimeout(() => {
        splineLoaded = true;
        finishLoader();
    }, 3500);

    // Check loop for shadowRoot (watermark removal & load check)
    const checkLoop = setInterval(() => {
        if (viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas')) {
            splineLoaded = true;
            finishLoader();
            clearInterval(checkLoop);
        }
    }, 200);


    // --- MAGNETIC BUTTONS LOGIC REMOVED ---
    // The user requested to remove the "vibration" and cursor following effect.
    // Interactions are now handled purely via CSS for a more stable, premium feel.
});
