import json
import urllib.request
import urllib.error

BASE_URL = "http://localhost:8000/api"

def make_request(method, url, data=None, headers=None):
    if headers is None:
        headers = {}
    body = None
    if data is not None:
        if isinstance(data, dict):
            headers["Content-Type"] = "application/json"
            body = json.dumps(data).encode("utf-8")
        elif isinstance(data, str):
            body = data.encode("utf-8")

    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as response:
            status = response.getcode()
            raw = response.read().decode("utf-8")
            parsed = json.loads(raw) if raw else {}
            return status, parsed
    except urllib.error.HTTPError as e:
        raw = e.read().decode("utf-8")
        try:
            parsed = json.loads(raw)
        except Exception:
            parsed = {"error": raw}
        return e.code, parsed

def login(email, password):
    status, data = make_request("POST", f"{BASE_URL}/auth/login", {"email": email, "password": password})
    assert status == 200, f"Login failed for {email}: {data}"
    token = data["access_token"]
    return {"Authorization": f"Bearer {token}"}

def run_tests():
    print("Testing 3 users authentication and role flows...")

    # 1. Login all 3 users
    h_admin = login("admin@caseflow.co", "CaseFlow2026!")
    h_agent = login("soporte@caseflow.co", "CaseFlow2026!")
    h_req = login("usuario@caseflow.co", "CaseFlow2026!")
    print("✓ All 3 users authenticated successfully.")

    # 2. Check Help Desk membership and role
    desk_slug = "centro-de-servicios"

    status, d_admin = make_request("GET", f"{BASE_URL}/desks/{desk_slug}", headers=h_admin)
    assert status == 200 and d_admin["user_role"] == "admin"
    print(f"✓ Admin role verified: {d_admin['user_role']}")

    status, d_agent = make_request("GET", f"{BASE_URL}/desks/{desk_slug}", headers=h_agent)
    assert status == 200 and d_agent["user_role"] == "agent"
    print(f"✓ Agent role verified: {d_agent['user_role']}")

    status, d_req = make_request("GET", f"{BASE_URL}/desks/{desk_slug}", headers=h_req)
    assert status == 200 and d_req["user_role"] == "requester"
    print(f"✓ Requester role verified: {d_req['user_role']}")

    # 3. Check AI Context and Toggles permissions
    # Admin must succeed (200)
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/context", headers=h_admin)
    assert status == 200, f"Admin should view context: {status}"
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/ai/toggles", headers=h_admin)
    assert status == 200, f"Admin should view toggles: {status}"

    # Agent must be forbidden (403)
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/context", headers=h_agent)
    assert status == 403, f"Agent viewing context should be 403, got {status}"
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/ai/toggles", headers=h_agent)
    assert status == 403, f"Agent viewing toggles should be 403, got {status}"

    # Requester must be forbidden (403)
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/context", headers=h_req)
    assert status == 403, f"Requester viewing context should be 403, got {status}"
    status, _ = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/ai/toggles", headers=h_req)
    assert status == 403, f"Requester viewing toggles should be 403, got {status}"
    print("✓ Context and AI Toggles properly restricted to Admin only (Agent and Requester get 403).")

    # 4. Check Tickets visibility
    status, t_admin = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets", headers=h_admin)
    assert status == 200
    status, t_agent = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets", headers=h_agent)
    assert status == 200
    status, t_req = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets", headers=h_req)
    assert status == 200

    print(f"✓ Total tickets seen by Admin: {len(t_admin)}")
    print(f"✓ Total tickets seen by Agent: {len(t_agent)}")
    print(f"✓ Total tickets seen by Requester: {len(t_req)}")
    assert len(t_admin) >= 6, "Admin should see all tickets"
    assert len(t_agent) >= 6, "Agent should see all tickets"
    status, me_req = make_request("GET", f"{BASE_URL}/auth/me", headers=h_req)
    assert all(t["requester_id"] == me_req["id"] for t in t_req), "Requester saw tickets not belonging to them!"

    # 5. Check Ticket Comments & Internal Note Isolation
    status, cf1_admin = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets/CF-001", headers=h_admin)
    status, cf1_agent = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets/CF-001", headers=h_agent)
    status, cf1_req = make_request("GET", f"{BASE_URL}/desks/{desk_slug}/tickets/CF-001", headers=h_req)

    admin_has_internal = any(c["is_internal"] for c in cf1_admin["comments"])
    agent_has_internal = any(c["is_internal"] for c in cf1_agent["comments"])
    req_has_internal = any(c["is_internal"] for c in cf1_req["comments"])

    assert admin_has_internal, "Admin should see internal notes"
    assert agent_has_internal, "Agent should see internal notes"
    assert not req_has_internal, "Requester MUST NOT see internal notes!"
    print("✓ Internal comments properly isolated (Requester cannot see internal notes).")

    # 6. Check Copilot Endpoints Permissions
    # Agent can call copilot
    status, _ = make_request("POST", f"{BASE_URL}/desks/{desk_slug}/tickets/CF-002/copilot/suggest-reply", headers=h_agent)
    assert status == 200, f"Agent failed to call copilot: {status}"

    # Requester CANNOT call copilot (403)
    status, _ = make_request("POST", f"{BASE_URL}/desks/{desk_slug}/tickets/CF-002/copilot/suggest-reply", headers=h_req)
    assert status == 403, f"Requester calling copilot should be 403, got {status}"
    print("✓ Copilot endpoints restricted to staff (Agent/Admin).")

    print("\n=======================================================")
    print("ALL AUDIT & END-TO-END ROLE CHECKS PASSED WITH 100% SUCCESS!")
    print("=======================================================")

if __name__ == "__main__":
    run_tests()
