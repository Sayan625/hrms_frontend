const emp = JSON.parse(localStorage.getItem("user"));
const API = "https://hrms-backend-mcxm.onrender.com/api";
const DEPT_API = "https://hrms-backend-mcxm.onrender.com/api/admin/departments";
const modal = new bootstrap.Modal(
    document.getElementById("employeeModal")
);

const addModal = new bootstrap.Modal(
    document.getElementById("addEmployeeModal")
);

async function loadEmployees() {
    const res = await fetch(API + "/admin/users", {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });
    const data = await res.json();

    const tableBody = document.getElementById("empTable");
    tableBody.innerHTML = "";

    data.forEach(emp => {
        const row = document.createElement("tr");

        row.innerHTML = `
            <td>${emp.id}</td>
            <td>${emp.name}</td>
            <td>${emp.email}</td>
            <td>${emp.phone}</td>
            <td>${emp.department}</td>
            <td>${emp.position}</td>
            <td>
                <button class="btn btn-success"
                        onclick='viewEmployee(${JSON.stringify(emp)})'>
                    View
                </button>
            </td>
        `;

        tableBody.appendChild(row);
    });
}

async function viewEmployee(emp) {

    document.getElementById("mId").value = emp.id;
    document.getElementById("mName").value = emp.name;
    document.getElementById("mEmail").value = emp.email;
    document.getElementById("mPhone").value = emp.phone;
    document.getElementById("mDepartment").value = emp.department;
    document.getElementById("mPosition").value = emp.position;
    document.getElementById("mHireDate").value = emp.hireDate;
    document.getElementById("mExitDate").value = emp.exitDate ?? "-";
    document.getElementById("mType").value = emp.type;


    modal.show();
}

async function saveEmployee() {

    const id = document.getElementById("mId").value;

    const updatedEmp = {
        id: id,
        name: document.getElementById("mName").value,
        email: document.getElementById("mEmail").value,
        phone: document.getElementById("mPhone").value,
        department: document.getElementById("mDepartment").value,
        position: document.getElementById("mPosition").value,
        hireDate: document.getElementById("mHireDate").value,
        exitDate: document.getElementById("mExitDate").value,
        type: document.getElementById("mType").value
    };

    const res = await fetch(`${API}/users/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${emp?.token}`
        },
        body: JSON.stringify(updatedEmp)
    });

    if (!res.ok) {
        alert("Update failed");
        return;
    } else {
        alert("Employee updated successfully");
    }

    modal.hide();
    loadEmployees();
}


function openAddModal() {
    document.getElementById("addEmpForm").reset();
    addModal.show();
}

async function saveNewEmployee() {

    const newEmp = {
        name: document.getElementById("aName").value,
        email: document.getElementById("aEmail").value,
        phone: document.getElementById("aPhone").value,
        department: document.getElementById("aDepartment").value,
        password: document.getElementById("aPassword").value,
        position: document.getElementById("aPosition").value,
        hireDate: document.getElementById("aHireDate").value || null,
        type: document.getElementById("aType").value || "user"
    };

    const res = await fetch(API+"/register", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${emp?.token}`
        },
        body: JSON.stringify(newEmp)
    });
    if (!res.ok) {
        alert("Failed to add employee");
        return;
    } else {
        alert("Employee successfully added");
    }
    addModal.hide();

    loadEmployees(); 
}

async function loadDepartmentDetails() {
    const res = await fetch(`${DEPT_API}/with-count`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });
    const data = await res.json();



    const select = document.getElementById("aDepartment");
    select.innerHTML = "";

    data.forEach(d => {
        select.innerHTML +=
            `<option value="${d.department}">${d.department}</option>`;
    });

}

document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("addEmpForm");
    form.addEventListener("submit", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        await saveNewEmployee();
    });
    loadEmployees();
    loadDepartmentDetails();
});


