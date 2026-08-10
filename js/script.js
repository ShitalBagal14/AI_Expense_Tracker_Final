document.addEventListener('DOMContentLoaded', () => {
    const heroContent = document.querySelector('.hero-content');
    const badge = document.querySelector('.badge');

    if (!heroContent) return;

    heroContent.addEventListener('mousemove', (event) => {
        const rect = heroContent.getBoundingClientRect();
        const x = (event.clientX - rect.left) / rect.width - 0.5;
        const y = (event.clientY - rect.top) / rect.height - 0.5;

        heroContent.style.transform = `rotateX(${(-y * 6).toFixed(2)}deg) rotateY(${(x * 8).toFixed(2)}deg)`;
        heroContent.style.boxShadow = `0 24px 70px rgba(72, 116, 187, 0.16)`;

        if (badge) {
            badge.style.transform = `translate(${(x * 10).toFixed(2)}px, ${(y * 8).toFixed(2)}px)`;
        }
    });

    heroContent.addEventListener('mouseleave', () => {
        heroContent.style.transform = 'rotateX(0deg) rotateY(0deg)';
        heroContent.style.boxShadow = '0 20px 60px rgba(72, 116, 187, 0.12)';

        if (badge) {
            badge.style.transform = 'translate(0, 0)';
        }
    });
});
