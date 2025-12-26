const EMP_API = "https://hrms-backend-mcxm.onrender.com/api";
const DEPT_API = "https://hrms-backend-mcxm.onrender.com/api/admin/departments";
const emp = JSON.parse(localStorage.getItem("user"));


document.getElementById("deptForm")
    .addEventListener("submit", async function (e) {

        e.preventDefault();

        const formData = new FormData(this);
        const dept = Object.fromEntries(formData.entries());

        await fetch(DEPT_API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${emp?.token}`
            },
            body: JSON.stringify(dept)
        });

        this.reset();
        await loadDepartmentDetails();
    });



async function loadEmployees() {
    const res = await fetch(EMP_API+"/admin/users",{
                headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });
    const data = await res.json();

    const select = document.getElementById("empSelect");
    select.innerHTML = "";

    data.forEach(e => {
        select.innerHTML +=
            `<option value="${e.id}-${e.department}">
                ${e.name} (${e.department})
             </option>`;
    });
}


async function moveEmployee() {
    const empval = document.getElementById("empSelect").value.split("-");
    const empId = empval[0];
    const empDept = empval[1];
    const dept = document.getElementById("deptSelect").value;
    console.log(dept)
    console.log(empId)
    if (empDept == dept) {
        alert("same dept")
        return;
    }
    const updatedEmp = {
        department: dept,
    };

    const res = await fetch(`${EMP_API}/user/${empId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${emp?.token}`
        },
        body: JSON.stringify(updatedEmp)
    });

    await loadEmployees();
    await loadDepartmentDetails();
}

async function loadDepartmentDetails() {
    const res = await fetch(`${DEPT_API}/with-count`, {
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });
    const data = await res.json();

    const tbody = document.getElementById("deptTableBody");
    tbody.innerHTML = "";

    const select = document.getElementById("deptSelect");
    select.innerHTML = "";

    data.forEach(d => {
        select.innerHTML +=
            `<option value="${d.department}">${d.department}</option>`;
    });

    data.forEach((item, index) => {
        const row = `
            <tr>
                <td>${index + 1}</td>
                <td>${item.department}</td>
                <td>${item.count}</td>
                <td>                
                <button class="btn btn-danger"  onclick='removeDepartment(${item.id},${item.count})'>
                    remove
                </button></td>
                
            </tr>
        `;
        tbody.innerHTML += row;
    });
}
async function removeDepartment(id, count) {


    if (count > 0) {
        alert("Cannot delete department with existing employees");
        return;
    }

    const confirmDelete = confirm("Are you sure you want to delete this department?");
    if (!confirmDelete) return;


    const res = await fetch(`${DEPT_API}/${id}`, {
        method: "DELETE",
        headers: {
            "Authorization": `Bearer ${emp?.token}`
        }
    });

    if (!res.ok) {
        alert("Failed to delete department");
        return;
    }

    alert("Department deleted successfully");

    loadDepartmentDetails();



}
loadDepartmentDetails();
loadEmployees();
