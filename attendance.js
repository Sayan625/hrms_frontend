const emp = JSON.parse(localStorage.getItem("user"));
const API = "https://hrms-backend-mcxm.onrender.com/api";
let userId = "";

let editModal = new bootstrap.Modal(
    document.getElementById('editAttendanceModal')
);
let summeryModal = new bootstrap.Modal(
    document.getElementById('showSummeryModal')
);


function loadEmployees() {
    fetch(API + "/admin/users", {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            const select = document.getElementById("employeeSelect");
            data.forEach(emp => {
                const option = document.createElement("option");
                option.value = `${emp.id}-${emp.name}`;
                option.textContent = emp.name;
                select.appendChild(option);
            });
        });
}

async function loadAttendance() {
    const today = new Date().toISOString().split('T')[0];
    const res = await fetch(API + "/admin/attendance/" + today, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });
    const data = await res.json();

    const table = document.getElementById("attendanceTable");
    table.innerHTML = "";
    data.forEach(a => {
        let statusText = "Absent";
        let badge = "danger";

        if (a.status == "PRESENT") {
            statusText = "P";
            badge = "success";
        } else if(a.status=="LEAVE"){
            statusText = "L";
            badge = "primary";
        }else{

            statusText="A";
            badge="danger";
        }

        table.innerHTML += `
                <tr>
                    <td>${a.name}</td>
                    <td><span class="badge bg-${badge}">${statusText}</span></td>
                    <td>${a.checkIn ?? '-'}</td>
                    <td>${a.checkOut ?? '-'}</td>
                </tr>
            `;
    });
}

function searchAttendance() {
    const empId = document.getElementById("employeeSelect").value.split("-")[0];
    const empName = document.getElementById("employeeSelect").value.split("-")[1];
    const date = document.getElementById("attendanceDate").value;
    if (!empId || !date) {
        alert("Please select employee and date");
        return;
    }

    fetch(`${API}/admin/attendance/user?user=${empId}&date=${date}`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    })
        .then(res => res.json())
        .then(data => {
            data.name = empName;
            data.date = date;
            renderResult(data)
        }
        );
}

function renderResult(data) {
    const table = document.getElementById("searchTable");
    const resultTable = document.getElementById("resultTable");

    table.innerHTML = "";
    resultTable.classList.remove("d-none");
    const row = `
        <tr>
            <td>${data.name}</td>
            <td>${data.status}</td>
            <td>${data.checkIn ?? "-"}</td>
            <td>${data.checkOut ?? "-"}</td>
            <td>
                <button class="btn btn-sm btn-warning" onclick='openEditModal(${JSON.stringify(data)})'>
                    Edit
                </button>
                <button class="btn btn-sm btn-info ms-1" onclick="viewSummary(${data.userId})">
                    Summary
                </button>
            </td>
        </tr>
    `;

    table.innerHTML = row;
}


function openEditModal(data) {
    document.getElementById("empId").value = data.userId;
    document.getElementById("attDate").value = data.date;
    document.getElementById("checkIn").value = data.checkIn || "";
    document.getElementById("checkOut").value = data.checkOut || "";

    editModal.show();
}

function saveAttendance() {

    const payload = {
        userId: document.getElementById("empId").value,
        date: document.getElementById("attDate").value,
        checkIn: document.getElementById("checkIn").value|| null,
        checkOut: document.getElementById("checkOut").value || null,
        type: document.getElementById("requestType").value
    };
    fetch(API + "/admin/attendance", {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${emp?.token}`
        },
        body: JSON.stringify(payload)
    })
        .then(res => res.json())
        .then((data) => {
            editModal.hide();
            searchAttendance()
            loadAttendance();
        })
        .catch(err => alert("Error saving attendance"));
}

async function viewSummary(id) {
    userId = id;
    await loadMonthlySummary()
    summeryModal.show();
}

async function loadMonthlySummary(id) {
    let value = document.getElementById("monthPickerSum").value
    let year, month;

    if (value) {
        year = value.split("-")[0];
        month = value.split("-")[1];

    } else {
        let today = new Date();
        document.getElementById("monthPickerSum").value = today.toISOString().slice(0, 7)
        year = today.getFullYear();
        month = today.getMonth() + 1;
    }
    try {
        const response = await fetch(`${API}/user/attendance/monthly-summary?user=${userId}&month=${month}&year=${year}`, {
            headers: {
                "Authorization": `Bearer ${emp?.token}`
            }

        });
        const data = await response.json();

        document.getElementById('month').innerText = data.month;
        document.getElementById('year').innerText = data.year;
        document.getElementById('fullDays').innerText = data.fullDays;
        document.getElementById('halfDays').innerText = data.halfDays;
        document.getElementById('totalUnits').innerText = data.totalUnits;

    } catch (err) {
        console.error('Error fetching monthly summary:', err);
    }
}

loadAttendance();
loadEmployees();