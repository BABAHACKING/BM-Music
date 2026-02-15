// ===== BABA MUSIC THEME SYSTEM =====
// Handles global theme application and color picker events

// Core function to set theme (exposed globally)
function setTheme(color) {
    document.documentElement.style.setProperty('--color-accent', color);
    localStorage.setItem('babaThemeColor', color);

    // Update picker visual state if it exists on the page
    const picker = document.getElementById('customThemePicker');
    if (picker) picker.value = color;
}

// 1. Load Theme Immediately (to prevent FOUC)
const savedTheme = localStorage.getItem('babaThemeColor');
if (savedTheme) {
    setTheme(savedTheme);
}

// 2. Event Listeners (wait for DOM)
document.addEventListener('DOMContentLoaded', () => {
    // Custom Color Picker
    const picker = document.getElementById('customThemePicker');
    if (picker) {
        picker.value = localStorage.getItem('babaThemeColor') || '#1DB954';
        picker.addEventListener('input', (e) => setTheme(e.target.value));
    }

    // Preset Theme Dots
    const dots = document.querySelectorAll('.theme-dot');
    dots.forEach(dot => {
        dot.addEventListener('click', () => {
            // Extract color from inline style or computed style if needed
            // But relying on onclick attribute in HTML is fine, 
            // OR we can make it cleaner here. 
            // For now, HTML onclick="setTheme(...)" works fine with the global function.
        });
    });
});
