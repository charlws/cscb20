$(document).ready(() => {
    let regradeMarkId = null;
    let viewRemarkId = null; // request-id
    let viewRemarkData = null; // json data

    $(".regrade-button").on('click', (e) => {
        regradeMarkId = $(e.currentTarget).data('mark-id');
        markGroupTitle = $(e.currentTarget).data('mark-group-title');
        $("#regrade-evaluation-title").text(`${markGroupTitle}`);
        $("#regrade-message").text("");
        $("#regrade-reason").val("");
        $("#regrade-submit-button").removeAttr("disabled");
        $("#regrade-modal").fadeIn(duration = 200);
        $(".modal-backdrop").fadeIn(duration = 200);
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
        if (reason.length <= 50) {
            $("#regrade-message").text("Please provide a reason of at least 50 characters.");
            $("#regrade-message").addClass("error-message");
            $("#regrade-message").fadeIn();
            return;
        }

        $.ajax({
            type: "PUT",
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

    const handleMarkFilter = () => {
        const selectedMarkGroupId = parseInt($("#mark-group-id").val()) || '';
        const studentFilter = $("#filter-student").val().toLowerCase().trim();
        const remarkStatusFilter = $("#remark-status").val();

        $(".mark-group-row").each((_, element) => {
            const row = $(element);
            const rowMarkGroupId = parseInt(row.data('mark-group-id')) || '';
            const rowStudentName = (row.data('student-name') || '').toLowerCase();
            const rowStudentId = (String(row.data('student-id')) || '');
            const rowRemarkStatus = (row.data('remark-status') || '');

            const markGroupMatches = !selectedMarkGroupId || selectedMarkGroupId === -1 || rowMarkGroupId === selectedMarkGroupId;
            const nameMatches = !studentFilter || rowStudentName.includes(studentFilter) || rowStudentId.includes(studentFilter);
            const remarkMatches = !remarkStatusFilter || remarkStatusFilter === "All" || rowRemarkStatus === remarkStatusFilter;

            row.toggle(markGroupMatches && nameMatches && remarkMatches);
        });
    };
    $("#mark-group-id").on('change', handleMarkFilter);
    $("#filter-student").on('input', handleMarkFilter);
    $("#remark-status").on('input', handleMarkFilter);
    handleMarkFilter();

    $(".view-remark-request-button").on('click', (e) => {
        const el = $(e.currentTarget);
        viewRemarkId = el.data('request-id');
        viewRemarkData = {
            markId: el.data('mark-id'),
            studentName: el.data('student-name'),
            evaluationTitle: el.data('evaluation-title'),
            grade: el.data('grade'),
            maxGrade: el.data('max-grade'),
            reason: el.data('reason'),
            status: el.data('status')
        };

        $("#regrade-student-name").text(viewRemarkData.studentName);
        $("#regrade-evaluation-title").text(viewRemarkData.evaluationTitle);
        $("#regrade-grade").text(`${parseInt(viewRemarkData.grade * 100 / viewRemarkData.maxGrade)}% (${viewRemarkData.grade} / ${viewRemarkData.maxGrade})`);
        $("#regrade-new-grade").val(viewRemarkData.grade);
        $("#regrade-status").text(viewRemarkData.status);
        $("#regrade-reason").text(viewRemarkData.reason);
        $("#manage-regrade-modal").fadeIn(duration = 200);
        $(".modal-backdrop").fadeIn(duration = 200);
    });

    const handleRegradeRequestManage = (e) => {
        const status = $(e.currentTarget).data('status');
        const newGrade = $("#regrade-new-grade").val();
        $("#regrade-message").text("");
        $("#regrade-message").removeClass("error-message");
        $("#regrade-message").removeClass("success-message");

        if (!viewRemarkId) {
            alert("Something went wrong... Please try again.");
            return;
        }

        $.ajax({
            type: "PATCH",
            url: "/api/regrade-request",
            data: JSON.stringify({ requestId: viewRemarkId, status: status, newGrade: newGrade }),
            contentType: "application/json",
            success: (data) => {
                $("#regrade-message").text(data.message);
                $("#regrade-message").addClass("success-message");
                $("#regrade-message").fadeIn();

                viewRemarkData.status = status;
                viewRemarkData.grade = newGrade;

                const gradeText = `${parseInt(viewRemarkData.grade * 100 / viewRemarkData.maxGrade)}% (${viewRemarkData.grade} / ${viewRemarkData.maxGrade})`;
                $("#regrade-status").text(status);
                $("#regrade-grade").text(gradeText);
                $(`span[data-request-id="${viewRemarkId}"]`).text(status);
                $(`span.grade[data-mark-id="${viewRemarkData.markId}"]`).text(gradeText);
                $(`div.mark-group-row[data-mark-id="${viewRemarkData.markId}"]`).data('remark-status', status);
                $(`button[data-mark-id="${viewRemarkData.markId}"]`).data('grade', newGrade);
                $(`button[data-mark-id="${viewRemarkData.markId}"]`).data('status', status);
                handleMarkFilter();
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#regrade-message").text(data.error);
                $("#regrade-message").addClass("error-message");
                $("#regrade-message").fadeIn();
            }
        });
    };
    $(".manage-regrade-button").on('click', handleRegradeRequestManage);
});