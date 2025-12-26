const emp = JSON.parse(localStorage.getItem("user"));
const API = "https://hrms-backend-mcxm.onrender.com/api"


document.addEventListener("DOMContentLoaded", () => {
    handleLeaveForm();
    handleAssetForm();
    loadPendingRequests();
});

function handleLeaveForm() {
    const form = document.getElementById("leaveForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const leaveType = document.getElementById("leaveType").value;
        const fromDate = document.getElementById("fromDateLeave").value;
        const toDate = document.getElementById("toDateLeave").value;
        const reason = document.getElementById("reasonLeave").value;

        if (new Date(fromDate) > new Date(toDate)) {
            alert("From date cannot be after To date");
            return;
        }
        const payload = {
            fromDate: fromDate,
            toDate: toDate
        }
        const reqBody = {
            type: leaveType,
            payload: JSON.stringify(payload),
            reason: reason,
            userId: emp?.id
        };

        console.log("Leave Request:", reqBody);

        const res = await fetch(API + "/admin/req", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emp?.token}`

            },
            body: JSON.stringify(reqBody)
        })

        if (!res.ok) alert("server error");
        else alert("Leave request submitted successfully");
        form.reset();
    });
}


function handleAssetForm() {
    const form = document.getElementById("assetForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        const selectedAssets = Array.from(
            document.querySelectorAll(".asset:checked")
        ).map(cb => cb.value);

        if (selectedAssets.length === 0) {
            alert("Please select at least one asset");
            return;
        }
        const remark = document.getElementById("remarkAsset").value;


        const reqBody = {
            type: "ASSET_REQ",
            payload: selectedAssets.join(","),
            reason: remark,
            userId: emp?.id
        }

        console.log("Department Change Request:", reqBody);

        const res = await fetch(API + "/admin/req", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emp?.token}`

            },
            body: JSON.stringify(reqBody)
        })

        if (!res.ok) alert("server error");
        else alert("Asset request submitted successfully");
        form.reset();
    });
}

async function loadPendingRequests() {
    const res = await fetch(API + "/user/req/" + emp?.id, {
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

    if (req.type === "LEAVE_HALF" || req.type === "LEAVE_FULL") {

        const payload = JSON.parse(req.payload || "{}");

        details = `
    <div class="d-flex flex-column text-center ">
      <small>From: ${payload.fromDate || ""}</small>
      <small>To: ${payload.toDate || ""}</small>
    </div>
  `;

    } else {
        details = `
        <div class="text-center ">
        <small  >${req.payload || "-"}</small>
        </div>
        `
    }
    let statusbadge = "bg-warning"

    if (req.status == "APPROVED") statusbadge = "bg-success"
    else if (req.status== "REJECTED") statusbadge = "bg-danger"
    tr.innerHTML = `
    <td><span class="badge bg-primary">${req.type}</span></td>
    <td>${details}</td>
    <td> <span class="badge ${statusbadge}">${req.status}</span></td>
    <td>
        ${req.remark}
    </td>
  `;

    return tr;
}
