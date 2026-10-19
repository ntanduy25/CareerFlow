from fastapi.testclient import TestClient


def test_create_and_get_application(client: TestClient, auth_headers_user_a):
    payload = {
        "company_name": "ABC Technology",
        "job_title": "Python Developer Intern",
        "job_url": "https://example.com/jobs/python-intern",
        "status": "APPLIED",
        "salary_min": 15000000,
        "salary_max": 20000000,
        "applied_at": "2026-10-19",
        "notes": "Submitted CV via career page",
    }
    create_resp = client.post(
        "/api/v1/applications", json=payload, headers=auth_headers_user_a
    )
    assert create_resp.status_code == 201
    created_app = create_resp.json()
    assert created_app["company_name"] == "ABC Technology"
    assert created_app["status"] == "APPLIED"
    app_id = created_app["id"]

    # Verify detail and initial status history
    get_resp = client.get(
        f"/api/v1/applications/{app_id}", headers=auth_headers_user_a
    )
    assert get_resp.status_code == 200
    app_detail = get_resp.json()
    assert len(app_detail["status_history"]) == 1
    assert app_detail["status_history"][0]["new_status"] == "APPLIED"


def test_status_update_and_history(client: TestClient, auth_headers_user_a):
    create_resp = client.post(
        "/api/v1/applications",
        json={
            "company_name": "Tech Corp",
            "job_title": "Backend Intern",
            "status": "SAVED",
        },
        headers=auth_headers_user_a,
    )
    app_id = create_resp.json()["id"]

    # Update status to INTERVIEW
    patch_resp = client.patch(
        f"/api/v1/applications/{app_id}/status",
        json={"status": "INTERVIEW"},
        headers=auth_headers_user_a,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["status"] == "INTERVIEW"

    # Check history endpoint
    history_resp = client.get(
        f"/api/v1/applications/{app_id}/history", headers=auth_headers_user_a
    )
    assert history_resp.status_code == 200
    history = history_resp.json()
    assert len(history) == 2
    assert history[0]["new_status"] == "INTERVIEW"
    assert history[0]["old_status"] == "SAVED"


def test_user_data_isolation(
    client: TestClient, auth_headers_user_a, auth_headers_user_b
):
    # User A creates an application
    create_resp = client.post(
        "/api/v1/applications",
        json={
            "company_name": "Private Corp A",
            "job_title": "Fullstack Intern",
            "status": "APPLIED",
        },
        headers=auth_headers_user_a,
    )
    app_id_a = create_resp.json()["id"]

    # User B tries to view User A's application -> 404
    b_view_resp = client.get(
        f"/api/v1/applications/{app_id_a}", headers=auth_headers_user_b
    )
    assert b_view_resp.status_code == 404

    # User B tries to modify User A's application -> 404
    b_edit_resp = client.patch(
        f"/api/v1/applications/{app_id_a}",
        json={"company_name": "Hacked"},
        headers=auth_headers_user_b,
    )
    assert b_edit_resp.status_code == 404

    # User B tries to delete User A's application -> 404
    b_del_resp = client.delete(
        f"/api/v1/applications/{app_id_a}", headers=auth_headers_user_b
    )
    assert b_del_resp.status_code == 404

    # User B list applications shouldn't contain User A's application
    b_list_resp = client.get("/api/v1/applications", headers=auth_headers_user_b)
    assert b_list_resp.status_code == 200
    assert len(b_list_resp.json()) == 0


def test_dashboard_summary(client: TestClient, auth_headers_user_a):
    # Create an applied app
    client.post(
        "/api/v1/applications",
        json={
            "company_name": "Alpha Corp",
            "job_title": "Software Engineer Intern",
            "status": "APPLIED",
        },
        headers=auth_headers_user_a,
    )

    dash_resp = client.get("/api/v1/dashboard/summary", headers=auth_headers_user_a)
    assert dash_resp.status_code == 200
    summary = dash_resp.json()
    assert summary["total_applications"] >= 1
    assert "by_status" in summary
    assert "APPLIED" in summary["by_status"]


def test_reminders_crud(client: TestClient, auth_headers_user_a):
    app_resp = client.post(
        "/api/v1/applications",
        json={
            "company_name": "Google",
            "job_title": "SWE Intern",
            "status": "INTERVIEW",
        },
        headers=auth_headers_user_a,
    )
    app_id = app_resp.json()["id"]

    # Create reminder
    rem_resp = client.post(
        "/api/v1/reminders",
        json={
            "application_id": app_id,
            "title": "Technical Round 1",
            "scheduled_at": "2026-10-25T10:00:00Z",
        },
        headers=auth_headers_user_a,
    )
    assert rem_resp.status_code == 201
    rem_data = rem_resp.json()
    assert rem_data["title"] == "Technical Round 1"
    rem_id = rem_data["id"]

    # List reminders
    list_resp = client.get("/api/v1/reminders", headers=auth_headers_user_a)
    assert list_resp.status_code == 200
    assert any(r["id"] == rem_id for r in list_resp.json())

    # Mark reminder completed
    patch_resp = client.patch(
        f"/api/v1/reminders/{rem_id}",
        json={"completed": True},
        headers=auth_headers_user_a,
    )
    assert patch_resp.status_code == 200
    assert patch_resp.json()["completed"] is True
