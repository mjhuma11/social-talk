document.addEventListener('DOMContentLoaded', function () {
    const sidebarCollapse = document.getElementById('sidebarCollapse');
    const sidebar = document.querySelector('.sidebar');
    const content = document.querySelector('.content');

    if (sidebarCollapse) {
        sidebarCollapse.addEventListener('click', function () {
            sidebar.classList.toggle('active');
            content.classList.toggle('active');
        });
    }

    // Event listeners for report action buttons
    document.querySelectorAll('.review-btn').forEach(button => {
        button.addEventListener('click', function() {
            reviewReport(this.dataset.reportId);
        });
    });

    document.querySelectorAll('.approve-btn').forEach(button => {
        button.addEventListener('click', function() {
            approveReport(this.dataset.reportId);
        });
    });

    document.querySelectorAll('.reject-btn').forEach(button => {
        button.addEventListener('click', function() {
            rejectReport(this.dataset.reportId);
        });
    });

    document.querySelectorAll('.reopen-btn').forEach(button => {
        button.addEventListener('click', function() {
            reopenReport(this.dataset.reportId);
        });
    });
});

function reviewReport(reportId) {
    console.log(`Reviewing report #${reportId}`);
    fetch(`/social-talk/admin/get_report_details.php?report_id=${reportId}`)
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const report = data.report;
                document.getElementById('modalReportId').textContent = report.report_id;
                document.getElementById('modalReportedContent').textContent = report.reported_post_id ? `Post #${report.reported_post_id}` : `User #${report.reported_user_id}`;
                document.getElementById('modalReportedBy').textContent = `User #${report.reporter_id}`;
                document.getElementById('modalReason').textContent = report.reason;
                document.getElementById('modalStatus').textContent = report.status;
                document.getElementById('modalReportedAt').textContent = new Date(report.created_at).toLocaleString();

                // Clear previous additional details
                document.getElementById('modalAdditionalDetails').innerHTML = '';

                if (data.additional_details) {
                    let detailsHtml = '';
                    if (data.additional_details.post) {
                        const post = data.additional_details.post;
                        detailsHtml += `<h6>Post Details:</h6>
                                        <p><strong>Post ID:</strong> ${post.post_id}</p>
                                        <p><strong>Content:</strong> ${post.content}</p>
                                        <p><strong>Posted By:</strong> User #${post.user_id}</p>
                                        <p><strong>Posted At:</strong> ${new Date(post.created_at).toLocaleString()}</p>`;
                    } else if (data.additional_details.user) {
                        const user = data.additional_details.user;
                        detailsHtml += `<h6>User Details:</h6>
                                        <p><strong>User ID:</strong> ${user.user_id}</p>
                                        <p><strong>Username:</strong> ${user.username}</p>
                                        <p><strong>Email:</strong> ${user.email}</p>
                                        <p><strong>Joined At:</strong> ${new Date(user.created_at).toLocaleString()}</p>`;
                    }
                    document.getElementById('modalAdditionalDetails').innerHTML = detailsHtml;
                }

                // Add event listeners to modal buttons
                document.getElementById('modalApproveBtn').onclick = () => approveReport(report.report_id);
                document.getElementById('modalRejectBtn').onclick = () => rejectReport(report.report_id);
                document.getElementById('modalReopenBtn').onclick = () => reopenReport(report.report_id);

                // Show/hide buttons based on status
                if (report.status === 'pending') {
                    document.getElementById('modalApproveBtn').style.display = 'inline-block';
                    document.getElementById('modalRejectBtn').style.display = 'inline-block';
                    document.getElementById('modalReopenBtn').style.display = 'none';
                } else {
                    document.getElementById('modalApproveBtn').style.display = 'none';
                    document.getElementById('modalRejectBtn').style.display = 'none';
                    document.getElementById('modalReopenBtn').style.display = 'inline-block';
                }

                const reportDetailsModal = new bootstrap.Modal(document.getElementById('reportDetailsModal'));
                reportDetailsModal.show();
            } else {
                alert('Failed to fetch report details: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Error fetching report details:', error);
            alert('An error occurred while fetching report details.');
        });
}

function approveReport(reportId) {
    updateReportStatus(reportId, 'resolved');
}

function rejectReport(reportId) {
    updateReportStatus(reportId, 'dismissed');
}

function reopenReport(reportId) {
    updateReportStatus(reportId, 'pending');
}

function updateReportStatus(reportId, status) {
    console.log(`Attempting to update report #${reportId} to status: ${status}`);
    fetch('/social-talk/admin/handle_report.php', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `report_id=${reportId}&status=${status}`
    })
    .then(response => {
        console.log('Fetch response received.', response);
        return response.json();
    })
    .then(data => {
        console.log('Data received from server:', data);
        if (data.success) {
            location.reload();
        } else {
            alert('Failed to update report status: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Fetch error:', error);
        alert('An error occurred while updating the report.');
    });
}
