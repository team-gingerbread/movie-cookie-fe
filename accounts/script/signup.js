document.getElementById("signupForm").addEventListener("submit", function (event) {
    event.preventDefault();

    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;
    const password2 = document.getElementById("password2").value;
    const nickname = document.getElementById("nickname").value;
    const bio = document.getElementById("bio").value;

    if (password !== password2) {
        alert("Passwords must be the same");
        return;
    }

    fetch("http://127.0.0.1:8000/accounts/signup/", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password, password2, nickname, bio }),
    })
        .then((response) => response.json())
        .then((data) => {
            if (data.id) {
                window.location.href = "/accounts/login/index.html";
            } else {
                alert("Signup failed");
            }
        })
        .catch((error) => {
            console.error("Error:", error);
            alert("Signup failed");
        });
});
