$(document).ready(() => {
    const handleFeedbackSubmit = () => {
        $("#feedback-message").text("");
        $("#feedback-message").removeClass("error-message");
        $("#feedback-message").removeClass("success-message");
        const instructorId = $("#feedback-instructor-id").val();
        const insLikes = $("#feedback-ins-likes").val();
        const insSuggestions = $("#feedback-ins-suggestions").val();
        const labsLikes = $("#feedback-labs-likes").val();
        const labsSuggestions = $("#feedback-labs-suggestions").val();

        if(!instructorId || !insLikes || !insSuggestions || !labsLikes || !labsSuggestions){
            $("#feedback-message").text("Please fill out all fields.");
            $("#feedback-message").addClass("error-message");
            $("#feedback-message").fadeIn();
            return;
        }

        const jsonFeedback = {
            "What do you like about the instructors teaching?": insLikes,
            "What do you recommend the instructor to do to improve their teaching?": insSuggestions,
            "What do you like about the labs?": labsLikes,
            "What do you recommend the lab instructors to do to improve their lab teaching?": labsSuggestions
        };
        $.ajax({
            type: "PUT",
            url: "/api/feedback",
            data: JSON.stringify({ instructorId, jsonFeedback: JSON.stringify(jsonFeedback) }),
            contentType: "application/json",
            success: (data) => {
                $("#feedback-message").text(data.message);
                $("#feedback-message").addClass("success-message");
                $("#feedback-message").fadeIn();
                $("#feedback-submit-button").attr("disabled", "disabled");
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#feedback-message").text(data.error);
                $("#feedback-message").addClass("error-message");
                $("#feedback-message").fadeIn();
            }
        });
    };
    $("#feedback-submit-button").on("click", handleFeedbackSubmit);

    $("#feedback-instructor-id").val("");
    $("#feedback-ins-likes").val("");
    $("#feedback-ins-suggestions").val("");
    $("#feedback-labs-likes").val("");
    $("#feedback-labs-suggestions").val("");
});