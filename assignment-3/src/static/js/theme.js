document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || savedTheme === null) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeToggle.checked = true;
    }

    themeToggle.addEventListener('change', () => {
        if (themeToggle.checked) {
            document.documentElement.setAttribute('data-theme', 'dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.setAttribute('data-theme', '');
            localStorage.setItem('theme', 'light');
        }
    });
});