const API = "https://hrms-backend-mcxm.onrender.com/api/login";

document.getElementById("loginForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const password = document.getElementById("password").value.trim();
    const email = document.getElementById("email").value.trim();

    if (!password || !email) return;

    try {
        const res = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ password, email })
        });

        console.log(res);

        if (res.ok) {
            const emp = await res.json();
            alert("login successful")
            localStorage.setItem("user", JSON.stringify(emp));
            window.location.href = "index.html";
        } else {
            const text = await res.text();
            const msg = text || "Invalid credentials";
            alert(msg)

        }
    } catch (err) {
        console.error(err);
        alert("server error")
    }
});
