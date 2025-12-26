const emp = JSON.parse(localStorage.getItem("user"));
const ATT_API = "https://hrms-backend-mcxm.onrender.com/api"

document.getElementById("monthPickerSum").value = new Date().toISOString().slice(0, 7)

if (!emp) {
    window.location.href = "login.html";
} else {
    document.getElementById("uName").innerText = emp.name;
    document.getElementById("uEmail").innerText = emp.email;
    document.getElementById("uPhone").innerText = emp.phone;
    document.getElementById("uDepartment").innerText = emp.department;
    document.getElementById("uPosition").innerText = emp.position;
    document.getElementById("uHireDate").innerText = emp.hireDate ?? "-";

}


async function checkIn() {
    await fetch(`${ATT_API}/user/checkin/${emp.id}`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        },
        method: "POST"
    });

    document.getElementById("monthPickerSum").value = new Date().toISOString().slice(0, 7)
    await updateCalender()
}

async function checkOut() {
    await fetch(`${ATT_API}/user/checkout/${emp.id}`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        },
        method: "POST"
    })
    document.getElementById("monthPickerSum").value = new Date().toISOString().slice(0, 7)
    await updateCalender()
}

async function loadMonthlySummary() {
    let value = document.getElementById("monthPickerSum").value
    let year, month;

    year = value.split("-")[0];
    month = value.split("-")[1];

    try {
        const response = await fetch(`${ATT_API}/user/attendance/monthly-summary?user=${emp.id}&month=${month}&year=${year}`, {
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

        await updateCalender()

    } catch (err) {
        console.error('Error fetching monthly summary:', err);
    }
}


function renderCalendar() {
    const tbody = document.getElementById("calendarBody");
    tbody.innerHTML = "";
    for (let i = 1; i <= 6; i++) {
        let row = document.createElement("tr");

        for (let j = 0; j < 7; j++) {
            const td = document.createElement("td");
            td.id = `${i}-${j}`
            td.style = "height: 45px"
            row.appendChild(td);
        }

        tbody.appendChild(row);
    }

}

async function updateCalender() {

    let value = document.getElementById("monthPickerSum").value;

    if (!value) return;

    let year = value.split("-")[0];
    let month = value.split("-")[1];
    const res = await fetch(`${ATT_API}/user/attendance/monthly?user=${emp.id}&month=${month}&year=${year}`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    })
    const data = await res.json()

    document.getElementById("monthLabel").innerText =
        new Date(year, month - 1).toLocaleString("default", { month: "long", year: "numeric" });


    const numberOfDays = new Date(year, month, 0).getDate();
    const firstDate = new Date(year, month - 1, 1);
    const firstDayIndex = firstDate.getDay();
    for (let day = 1; day <= numberOfDays; day++) {
        const date = new Date(year, month - 1, day);
        const dayWeek = date.getDay();
        const today = new Date();

        date.setHours(0, 0, 0, 0);
        today.setHours(0, 0, 0, 0);


        const week = Math.ceil((day + firstDayIndex) / 7);
        const cell = document.getElementById(`${week}-${dayWeek}`);
        if (date <= today && dayWeek != 0) {
            cell.classList.add("table-danger")

        }
        if (dayWeek == 0)
            cell.classList.add("table-secondary")

        cell.innerHTML = `<div class="p-0 m-0 d-block"  id=${date.toLocaleDateString("en-CA")}>
        <small class="d-block p-0 m-0">${day}</small>
        </div>
        `;

    }
    console.log(data)
    data.forEach((item) => {
        const cell = document.getElementById(item.date);
        cell.parentElement.classList.remove("table-danger")
        if (item.type == "leave") cell.parentElement.classList.add("table-primary")
        else if (item.type == "normal") {

            if (item.status == 1) cell.parentElement.classList.add("table-success");
            else if (item.status == 0.5) cell.parentElement.classList.add("table-warning")
        }

        let checkInTime = "NA"
        let checkOutTime = "NA"
        if (item.checkIn) {
            checkInTime = item.checkIn.split(/[:.]/)[0] + ":" + item.checkIn.split(/[:.]/)[1];
        }

        if (item.checkOut) {
            checkOutTime = item.checkOut.split(/[:.]/)[0] + ":" + item.checkOut.split(/[:.]/)[1];
        }
        if (checkInTime == "NA") {
            document.getElementById("checkInBtn").disabled = false
            document.getElementById("checkOutBtn").disabled = true


        } else {
            document.getElementById("checkInBtn").disabled = true
            document.getElementById("checkOutBtn").disabled = false

        }

        if (checkInTime != "NA" || checkOutTime != "NA")
            cell.innerHTML += `<small class="p-0 m-0 d-block text-muted lh-1" style="font-size: 0.7rem;">${checkInTime} - ${checkOutTime}</small>`;

    })



}

renderCalendar();
loadMonthlySummary()
