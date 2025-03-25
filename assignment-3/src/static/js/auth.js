$(document).ready(() => {
    const handleLogin = () => {
        $("#login-message").text("");
        $("#login-message").fadeOut();
        const utorId = $("#login-utorid").val();
        const password = $("#login-password").val();
        $.ajax({
            type: "POST",
            url: "/api/login",
            data: JSON.stringify({ utorId, password }),
            contentType: "application/json",
            success: (data) => {
                $("#login-message").text(data.message);
                $("#login-message").addClass("success-message");
                $("#login-message").fadeIn();
                setTimeout(() => {
                    window.location.reload();
                }, 500);
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#login-message").text(data.error);
                $("#login-message").addClass("error-message");
                $("#login-message").fadeIn();
            }
        });
    };
    $("#login-password").keypress((e) => {
        if (e.which == 13) {
            handleLogin();
        }
    });
    $("#login-button").click(handleLogin);

    const handleLogout = () => {
        $.ajax({
            type: "POST",
            url: "/api/logout",
            success: (data) => {
                window.location.reload();
            },
            error: (error) => {
                console.log(error);
            }
        });
    };
    $("#logout-button").click(handleLogout);
});