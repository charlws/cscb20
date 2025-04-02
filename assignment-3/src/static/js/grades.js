$(document).ready(() => {
    let regradeMarkId = null;
    let viewRemarkId = null; // request-id
    let viewRemarkData = null; // json data
    let editMarkId = null; // mark id
    let editMarkData = null; // json data

    $(".regrade-button").on('click', (e) => {
        regradeMarkId = $(e.currentTarget).data('mark-id');
        markGroupTitle = $(e.currentTarget).data('mark-group-title');
        $("#regrade-evaluation-title").text(`${markGroupTitle}`);
        $("#regrade-message").text("");
        $("#regrade-reason").val("");
        $("#regrade-submit-button").removeAttr("disabled");
        showModal("#regrade-modal");
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

        $(".mark-row").each((_, element) => {
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
        $("#regrade-message").text("");
        showModal("#manage-regrade-modal");
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
                $(`div.mark-row[data-mark-id="${viewRemarkData.markId}"]`).data('remark-status', status);
                $(`a[data-mark-id="${viewRemarkData.markId}"]`).data('grade', newGrade);
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

    const handleEditMarkButton = (e) => {
        const el = $(e.currentTarget);
        editMarkId = el.data('mark-id');
        editMarkData = {
            studentName: el.data('student-name'),
            evaluationTitle: el.data('evaluation-title'),
            grade: el.data('grade'),
            maxGrade: el.data('max-grade')
        };

        $("#edit-student-name").text(editMarkData.studentName);
        $("#edit-evaluation-title").text(editMarkData.evaluationTitle);
        $("#edit-grade").text(`${parseInt(editMarkData.grade * 100 / editMarkData.maxGrade)}% (${editMarkData.grade} / ${editMarkData.maxGrade})`);
        $("#edit-new-grade").val(editMarkData.grade);
        $("#edit-message").text("");
        showModal("#edit-mark-modal");
    }
    $("#grades-table").on('click', '.edit-mark-button', handleEditMarkButton);
    // we need this to handle dynamically added buttons

    const handleEditMark = (e) => {
        const newGrade = $("#edit-new-grade").val();
        $("#edit-message").text("");
        $("#edit-message").removeClass("error-message");
        $("#edit-message").removeClass("success-message");

        if (!editMarkId) {
            alert("Something went wrong... Please try again.");
            return;
        }

        $.ajax({
            type: "PATCH",
            url: "/api/mark",
            data: JSON.stringify({ markId: editMarkId, newGrade }),
            contentType: "application/json",
            success: (data) => {
                $("#edit-message").text(data.message);
                $("#edit-message").addClass("success-message");
                $("#edit-message").fadeIn();

                editMarkData.grade = newGrade;

                const gradeText = `${parseInt(editMarkData.grade * 100 / editMarkData.maxGrade)}% (${editMarkData.grade} / ${editMarkData.maxGrade})`;
                $("#edit-grade").text(gradeText);
                $(`span[data-mark-id="${editMarkId}"]`).text(gradeText);
                $(`button[data-mark-id="${editMarkId}"]`).data('grade', newGrade);
                $(`a[data-mark-id="${editMarkId}"]`).data('grade', newGrade);
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#edit-message").text(data.error);
                $("#edit-message").addClass("error-message");
                $("#edit-message").fadeIn();
            }
        });
    };
    const handleDeleteMark = (e) => {
        $("#edit-message").text("");
        $("#edit-message").removeClass("error-message");
        $("#edit-message").removeClass("success-message");

        if (!editMarkId) {
            alert("Something went wrong... Please try again.");
            return;
        }

        $.ajax({
            type: "DELETE",
            url: "/api/mark",
            data: JSON.stringify({ markId: editMarkId }),
            contentType: "application/json",
            success: (data) => {
                $("#edit-message").text(data.message);
                $("#edit-message").addClass("success-message");
                $("#edit-message").fadeIn();

                $(`.mark-row[data-mark-id="${editMarkId}"]`).remove();
                handleMarkFilter();
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#edit-message").text(data.error);
                $("#edit-message").addClass("error-message");
                $("#edit-message").fadeIn();
            }
        });
    };
    $("#edit-submit-button").on('click', handleEditMark);
    $("#edit-delete-button").on('click', () => {
        if ($("#edit-delete-button").text === "Delete") {
            $("#edit-delete-button").text("Confirm?");
            $("#edit-delete-button").attr("disabled", "disabled");
            setTimeout(() => {
                $("#edit-delete-button").removeAttr("disabled");
            }, 1500);
        } else {
            handleDeleteMark();
        }
    });

    $(".enter-mark-button").on('click', (e) => {
        $("#enter-mark-message").text("");
        $("#enter-mark-group-id").val("");
        $("#enter-mark-student-id").val("");
        $("#enter-mark-mark").val("");
        showModal("#enter-mark-modal");
    });

    const handleEnterMark = () => {
        $("#enter-mark-message").text("");
        $("#enter-mark-message").removeClass("error-message");
        $("#enter-mark-message").removeClass("success-message");

        const markGroupId = $("#enter-mark-group-id").val();
        const evaluationTitle = $(`.mark-group-option[value="${markGroupId}"]`).data('evaluation-title');
        const maxGrade = $(`.mark-group-option[value="${markGroupId}"]`).data('max-grade');
        const studentId = $("#enter-mark-student-id").val();
        // NOTE: This may be confusing but this refers to the "userId" of the student!
        const studentName = $(`.student-option[value="${studentId}"]`).data('student-name');
        const mark = $("#enter-mark-mark").val();
        if (!markGroupId || !studentId || !mark) {
            $("#enter-mark-message").text("Please fill all the fields.");
            $("#enter-mark-message").addClass("error-message");
            $("#enter-mark-message").fadeIn();
            return;
        }

        $.ajax({
            type: "PUT",
            url: "/api/mark",
            data: JSON.stringify({ markGroupId, userId: studentId, grade: mark }),
            contentType: "application/json",
            success: (data) => {
                $("#enter-mark-message").text(data.message);
                $("#enter-mark-message").addClass("success-message");
                $("#enter-mark-message").fadeIn();

                $("#enter-mark-group-id").val("");
                $("#enter-mark-student-id").val("");
                $("#enter-mark-mark").val("");
                const gradeText = `${parseInt(mark * 100 / maxGrade)}% (${mark} / ${maxGrade})`;
                const newRow = `
                    <div class="table-row mark-row" data-mark-group-id="${markGroupId}"
                        data-student-name="${studentName}" data-student-id="${studentId}">
                        <div class="table-cell">
                            <h3>${evaluationTitle}</h3>
                        </div>
                        <div class="table-cell">
                            <p>${studentName}</p>
                        </div>
                        <div class="table-cell">
                            <p>
                                <span class="grade" data-mark-id="${data.markId}">${gradeText}</span>
                                (<a class="edit-mark-button" href="#" data-mark-id="${data.markId}"
                                    data-student-name="${studentName}"
                                    data-evaluation-title="${evaluationTitle}" data-grade="${mark}"
                                    data-max-grade="${maxGrade}">Edit</a>)
                            </p>
                        </div>
                        <div class="table-cell">
                            <p>N/A</p>
                        </div>
                    </div>`;
                $("#grades-table").append(newRow);
                handleMarkFilter();
            },
            error: (error) => {
                const data = JSON.parse(error.responseText);
                $("#enter-mark-message").text(data.error);
                $("#enter-mark-message").addClass("error-message");
                $("#enter-mark-message").fadeIn();
            }
        });
    };
    $("#enter-mark-submit-button").on('click', handleEnterMark);
});