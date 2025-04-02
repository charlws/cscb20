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

$(document).ready(() => {
    const handleModalClose = () => {
        const scrollY = parseInt($("body").css('top'));
        $("body").css({
            'position': '',
            'top': '',
            'left': '',
            'right': ''
        });
        window.scrollTo(0, -scrollY);
        $(".modal").fadeOut(duration = 200);
        $(".modal-backdrop").fadeOut(duration = 200);
    };
    $(".modal-backdrop,.modal-close-button").on('click', handleModalClose);
    $(document).on('keydown', (e) => {
        if (e.key === 'Escape') {
            handleModalClose();
        }
    });
});

const showModal = (modalSelector) => {
    const scrollY = window.scrollY;
    $("body").css({
        'position': 'fixed',
        'top': `-${scrollY}px`,
        'left': '0',
        'right': '0'
    });
    $(modalSelector).fadeIn(duration = 200);
    $(".modal-backdrop").fadeIn(duration = 200);
};