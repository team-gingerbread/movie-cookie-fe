import { backend } from "/script/url.js";

const backend_url = backend + `community/`;

document.getElementById("write_btn").addEventListener("click", function (event) {
    event.preventDefault();
    const accessToken = localStorage.getItem("access");

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }
    const title = document.getElementById("title").value;
    const content = document.getElementById("content").value;
    const image = document.getElementById("image").files[0];
    const formdata = new FormData();
    formdata.append("title", title);
    formdata.append("content", content);
    if (image) {
        formdata.append("image", image);
    }
    fetch(backend_url, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        body: formdata,
    })
        .then((response) => {
            if (!response.ok) {
                alert("write failed...");
            } else {
                window.location.href = "..";
            }
            return response.json();
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error:", error);
            alert("write failed");
        });
});
