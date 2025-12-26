const emp = JSON.parse(localStorage.getItem("user"));
const API = "https://hrms-backend-mcxm.onrender.com/api";

loadPendingRequests()
async function loadPendingRequests() {
  const res = await fetch(API + "/admin/req?status=PENDING", {
    headers: { "Authorization": `Bearer ${emp?.token}` }
  });

  const data = await res.json();
  const tbody = document.getElementById("requestTable");
  tbody.innerHTML = "";
  console.log(data)
  data.forEach(req => tbody.appendChild(createRow(req)));
}


function createRow(req) {
  const tr = document.createElement("tr");

  let details = "";
  let action = "";
  let info = {};
  info.id = req.id
  info.type = req.type
  info.userId = req.userId
  if (req.type === "LEAVE_HALF" || req.type === "LEAVE_FULL") {

    const payload = JSON.parse(req.payload || "{}");

    details = `
    <div class="d-flex flex-column text-center gap-1">
      <small>From</small>
      <input type="date" class="form-control form-control-sm"
             id="from-${req.id}" value="${payload.fromDate || ""}">

      <small>To</small>
      <input type="date" class="form-control form-control-sm"
             id="to-${req.id}" value="${payload.toDate || ""}">
    </div>
  `;

    action = `
      <select class="form-select form-select-sm mb-1" id="status-${req.id}">
        <option value="APPROVED">Approve</option>
        <option value="REJECTED">Reject</option>
      </select>
    <button class="btn btn-primary btn-sm w-100"
            onclick='applyAction(${JSON.stringify(info)})'>
      Apply
    </button>
  `;
  } else {
    info.type = "normal"
    details = `<small>${req.payload || "-"}</small>`;

    action = `
      <select class="form-select form-select-sm mb-1" id="status-${req.id}">
        <option value="APPROVED">Approve</option>
        <option value="REJECTED">Reject</option>
        <option value="DONE">Done</option>
      </select>
      <button class="btn btn-primary btn-sm w-100"
              onclick='applyAction(${JSON.stringify(info)})'>
        Apply
      </button>
    `;
  }

  tr.innerHTML = `
    <td>${req.name}</td>
    <td><span class="badge bg-warning">${req.type}</span></td>
    <td>${details}</td>
    <td>${req.reason}</td>
    <td>
      <textarea class="form-control form-control-sm"
                id="remark-${req.id}"
                placeholder="Enter remark"></textarea>
    </td>
    <td>${action}</td>
  `;

  return tr;
}


async function applyAction(data) {
  const remark = document.getElementById(`remark-${data.id}`).value;
  const status = document.getElementById(`status-${data.id}`).value
  if (!remark) {

    alert("please add a remark");
    return;
  }
  const payload = {
    status: status,
    remark: remark
  }
  console.log(payload)
  if (data.type == "normal") {
    const req = await fetch(API + "/admin/req/" + data.id, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${emp?.token}`,
        "Content-Type": "application/json"

      },
      body: JSON.stringify(payload)
    })
  }
  else if (data.type.includes("LEAVE")) {

    let leave = {
      userId: data.userId,
      fromDate: document.getElementById(`from-${data.id}`).value,
      toDate: document.getElementById(`to-${data.id}`).value,
      status: data.type == "LEAVE_HALF" ? 0.5 : 1
    }

    console.log(leave);
    const req = await fetch(API + "/admin/attendance/leave", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${emp?.token}`,
        "Content-Type": "application/json"

      },
      body: JSON.stringify(leave)
    })

    if (!req.ok) return alert("server error");
    const req1 = await fetch(API + "/admin/req/" + data.id, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${emp?.token}`,
        "Content-Type": "application/json"

      },
      body: JSON.stringify(payload)
    })

    if (!req1.ok) return alert("server error")
    await loadPendingRequests()
  }

}