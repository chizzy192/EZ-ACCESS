document.addEventListener("DOMContentLoaded", function () {
    const form = document.getElementById("signupForm");

    form.addEventListener("submit", function (event) {
        event.preventDefault();

        const fullName = document.getElementById("fullName").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();
        const confirmPassword = document.getElementById("confirmPassword").value.trim();

        if (!fullName || !email || !password || !confirmPassword) {
            alert("⚠️ Please fill in all fields.");
            return;
        }

        const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
        if (!emailPattern.test(email)) {
            alert("⚠️ Please enter a valid email address.");
            return;
        }

        if (password.length < 6) {
            alert("⚠️ Password must be at least 6 characters long.");
            return;
        }

        if (password !== confirmPassword) {
            alert("⚠️ Passwords do not match.");
            return;
        }

        // Save user data to localStorage
        const user = {
            fullName: fullName,
            email: email,
            password: password // ⚠️ In real systems, never save raw passwords!
        };

        localStorage.setItem("studentUser", JSON.stringify(user));

        alert("✅ Signup successful! Your details are saved.");
        form.reset();
    });
});
