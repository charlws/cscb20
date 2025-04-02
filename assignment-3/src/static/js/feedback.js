$(document).ready(() => {
    let viewFeedbackId = null;
    let viewFeedbackData = null; // parsed json feedback (not a full feedback object)
    let viewFeedbackStatus = null;

    const handleFeedbackSubmit = () => {
        $("#feedback-message").text("");
        $("#feedback-message").removeClass("error-message");
        $("#feedback-message").removeClass("success-message");
        const instructorId = $("#feedback-instructor-id").val();
        const insLikes = $("#feedback-ins-likes").val();
        const insSuggestions = $("#feedback-ins-suggestions").val();
        const labsLikes = $("#feedback-labs-likes").val();
        const labsSuggestions = $("#feedback-labs-suggestions").val();

        if (!instructorId || !insLikes || !insSuggestions || !labsLikes || !labsSuggestions) {
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

    $(".view-feedback-button").on('click', (e) => {
        const el = $(e.currentTarget);
        viewFeedbackId = el.data("feedback-id");
        viewFeedbackData = JSON.parse(atob(el.data("feedback-json")));
        viewFeedbackStatus = el.data("feedback-status");

        $("#div-feedback-content").empty();
        for (const key in viewFeedbackData) {
            $("#div-feedback-content").prepend(`<div>
                <p class="feedback-question"><b>${key}</b></p>
                <p class="feedback-answer">${viewFeedbackData[key]}</p>
            </div>`);
        }
        $("#feedback-created-at").text(el.data("feedback-created-at"));
        $("#feedback-status").text(viewFeedbackStatus);
        $("#feedback-message").text("");
        showModal("#view-feedback-modal");
        $(".feedback-status-button[data-status='Read']").click();
    });

    const handleFeedbackStatusUpdate = (e) => {
        $("#feedback-message").text("");
        $("#feedback-message").removeClass("error-message");
        $("#feedback-message").removeClass("success-message");

        const el = $(e.currentTarget);
        if (el.data("feedback-id")) {
            viewFeedbackId = el.data("feedback-id");
        }
        feedbackStatus = el.data("status");

        if (!viewFeedbackId) {
            alert("Something went wrong... Please try again.");
            return;
        }

        $.ajax({
            type: "PATCH",
            url: "/api/feedback",
            data: JSON.stringify({ feedbackId: viewFeedbackId, status: feedbackStatus }),
            contentType: "application/json",
            success: (data) => {
                // $("#feedback-message").text(data.message);
                // $("#feedback-message").addClass("success-message");
                // $("#feedback-message").fadeIn();
                $("#feedback-submit-button").attr("disabled", "disabled");

                $("#feedback-status").text(feedbackStatus);
                $(`[data-feedback-id="${viewFeedbackId}"]`).data("feedback-status", feedbackStatus);
                $(`.feedback-row[data-feedback-id="${viewFeedbackId}"] > .feedback-status-cell > p`).text(feedbackStatus);
                if (feedbackStatus === "Read") {
                    $(`.feedback-row[data-feedback-id="${viewFeedbackId}"] > .table-cell > p`).addClass("muted");
                } else {
                    console.log($(`.feedback-row[data-feedback-id="${viewFeedbackId}"] > .table-cell > p`));
                    $(`.feedback-row[data-feedback-id="${viewFeedbackId}"] > .table-cell > p`).removeClass("muted");
                }
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#feedback-message").text(data.error);
                $("#feedback-message").addClass("error-message");
                $("#feedback-message").fadeIn();
            }
        });
    };
    $(".feedback-status-button").on("click", handleFeedbackStatusUpdate);
});