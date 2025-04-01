$(document).ready(() => {
    let regradeMarkId = null;

    $(".regrade-button").on('click', (e) => {
        regradeMarkId = $(e.currentTarget).data('mark-id');
        markGroupTitle = $(e.currentTarget).data('mark-group-title');
        $("#regrade-evaluation-title").text(`${markGroupTitle}`);
        $("#regrade-message").text("");
        $("#regrade-reason").val("");
        $("#regrade-submit-button").removeAttr("disabled");
        $("#regrade-modal").fadeIn();
        $(".modal-backdrop").fadeIn();
    });

    const handleSubmitRegradeRequest = () => {
        $("#regrade-message").text("");
        $("#regrade-message").removeClass("error-message");
        $("#regrade-message").removeClass("success-message");

        const reason = $("#regrade-reason").val();
        if (!regradeMarkId) {
            alert("Something went wrong... Please try again.");
            return;
        }
        if(reason.length <= 50){
            $("#regrade-message").text("Please provide a reason of at least 50 characters.");
            $("#regrade-message").addClass("error-message");
            $("#regrade-message").fadeIn();
            return;
        }

        $.ajax({
            type: "POST",
            url: "/api/regrade-request",
            data: JSON.stringify({ markId: regradeMarkId, reason }),
            contentType: "application/json",
            success: (data) => {
                $("#regrade-message").text(data.message);
                $("#regrade-message").addClass("success-message");
                $("#regrade-message").fadeIn();
                $("#regrade-submit-button").attr("disabled", "disabled");
                
                const button = $(`.regrade-button[data-mark-id="${regradeMarkId}"]`);
                button.replaceWith(`<span class="muted">Regrade Requested (Pending)</span>`);
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#regrade-message").text(data.error);
                $("#regrade-message").addClass("error-message");
                $("#regrade-message").fadeIn();
            }
        });
    };
    $("#regrade-submit-button").on('click', handleSubmitRegradeRequest);
});