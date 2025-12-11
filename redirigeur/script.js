document.addEventListener('DOMContentLoaded', () => {
    const viewer = document.getElementById('spline');
    const loader = document.getElementById('loader');
    const ui = document.getElementById('ui');
    const counterEl = document.getElementById('counter');
    const barEl = document.getElementById('bar');

    let progress = 0;
    let isRevealed = false;

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
        counterEl.textContent = 100;
        barEl.style.width = '100%';

        if (viewer.shadowRoot) {
            const style = document.createElement('style');
            style.textContent = '#logo { display: none !important; }';
            viewer.shadowRoot.appendChild(style);
        }

        setTimeout(() => {
            loader.classList.add('slide-up');
            setTimeout(() => {
                ui.classList.add('visible');
            }, 600);
        }, 500);
    };

    viewer.addEventListener('load', finishLoader);
    setTimeout(finishLoader, 2500);
    const checkLoop = setInterval(() => {
        if (viewer.shadowRoot && viewer.shadowRoot.querySelector('canvas')) {
            setTimeout(finishLoader, 800);
            clearInterval(checkLoop);
        }
    }, 200);
});
