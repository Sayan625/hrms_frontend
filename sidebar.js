const sidebar = document.getElementById("sidebar");
const userType = JSON.parse(localStorage.getItem("user"))?.type || null;



if (!userType)
    window.location.href = "login.html";

let menuHtml = `
    <li class="nav-item">
        <a href="index.html" class="nav-link text-white">
            User
        </a>
    </li>
    <li class="nav-item">
        <a href="Actions.html" class="nav-link text-white">
            Actions
        </a>
    </li>
`;

if (userType == "admin") {
    menuHtml += `
        <li class="nav-item my-2">
            <div class="border-top border-success opacity-75 border-4"></div>
        </li>
        <li class="nav-item">
            <a href="attendance.html" class="nav-link text-white">
                Attendance
            </a>
        </li>
        <li class="nav-item">
            <a href="employee.html" class="nav-link text-white">
                Employees
            </a>
        </li>
        <li class="nav-item">
            <a href="department.html" class="nav-link text-white">
                Department
            </a>
        </li>
        <li class="nav-item">
            <a href="Request.html" class="nav-link text-white">
                Request
            </a>
        </li>
    `;
}

menuHtml += `
    <li class="nav-item mt-auto">
        <a href="#" class="nav-link text-white" onclick="logout()">
            Logout
        </a>
    </li>
`;

sidebar.innerHTML = `
    <div class="d-flex flex-column h-100  bg-dark text-white">
        <h4 class="text-center py-3 border-bottom">HRM</h4>
        <ul class="nav nav-pills flex-column mb-auto px-2">
            ${menuHtml}
        </ul>
    </div>
`;



const currentPath = window.location.pathname.split("/").pop();

const links = sidebar.querySelectorAll(".nav-link");

links.forEach(link => {
    if (link.getAttribute("href") === currentPath) {
        link.classList.add("active", "bg-primary");
    } else {
        link.classList.remove("active", "bg-primary");
    }
});

const restrictedPages = ["attendance.html", "employee.html", "department.html"];

if (userType != "admin" && restrictedPages.includes(currentPath)) {
    window.location.href = "index.html";
}

function logout() {
    localStorage.removeItem("user");
    window.location.href = "login.html";
}