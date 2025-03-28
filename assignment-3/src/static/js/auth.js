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
                    window.location.href = "/";
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
    $("#logout-button,#dropdown-logout-button").click(handleLogout);

    const handleAccountTypeChange = () => {
        const accountType = $("#signup-account-type").val();
        if (accountType === "instructor") {
            $("#signup-student-id-div").hide();
        } else {
            $("#signup-student-id-div").show();
        }
    };
    $("#signup-account-type").change(handleAccountTypeChange);
    handleAccountTypeChange(); // detect initial value

    const handleSignUp = () => {
        $("#signup-message").text("");
        $("#signup-message").fadeOut();
        const accountType = $("#signup-account-type").val();
        const studentId = $("#signup-student-id").val();
        const email = $("#signup-email").val();
        const displayName = $("#signup-display-name").val();
        const utorId = $("#signup-utorid").val();
        const password = $("#signup-password").val();
        $.ajax({
            type: "POST",
            url: "/api/signup",
            data: JSON.stringify({ accountType, studentId, email, displayName, utorId, password }),
            contentType: "application/json",
            success: (data) => {
                $("#signup-message").text(data.message);
                $("#signup-message").addClass("success-message");
                $("#signup-message").fadeIn();
                setTimeout(() => {
                    window.location.href = "/";
                }, 500);
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#signup-message").text(data.error);
                $("#signup-message").addClass("error-message");
                $("#signup-message").fadeIn();
            }
        });
    };

    $("#signup-password").keypress((e) => {
        if (e.which == 13) {
            handleSignUp();
        }
    });
    $("#signup-button").click(handleSignUp);

    const urlParams = new URLSearchParams(window.location.search);
    const message = urlParams.get('message');
    if (message) {
        $("#login-message").text(message);
        $("#login-message").addClass("error-message");
        $("#login-message").fadeIn();
        $("#signup-message").text(message);
        $("#signup-message").addClass("error-message");
        $("#signup-message").fadeIn();
    }
});