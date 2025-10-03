document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signinForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!email || !password) {
            alert("⚠️ Please fill in all fields.");
            return;
        }

        // Get saved user from localStorage
        const savedUser = JSON.parse(localStorage.getItem("studentUser"));

        if (!savedUser) {
            alert("❌ No account found. Please sign up first.");
            return;
        }

        // Check if credentials match
        if (email === savedUser.email && password === savedUser.password) {
            alert(`✅ Welcome back, ${savedUser.fullName}!`);
            // redirect to dashboard (later you can change this)
            window.location.href = "/dashboard.html";
        } else {
            alert("❌ Invalid email or password.");
        }
    });
});
