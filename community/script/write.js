import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";

const postid = new URLSearchParams(window.location.search).get("postid");
const backend_url = backend + `community/`;
const backendurl = backend + `community/${postid}/`;

document.addEventListener("DOMContentLoaded", function () {
    const urlParams = new URLSearchParams(window.location.search);
    const postid = urlParams.get("postid");

    if (window.location.pathname === "/community/write/") {
        document.getElementById("write_btn").addEventListener("click", async function (event) {
            event.preventDefault();
            const accessToken = await getToken();

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
    } else if (postid) {
        fetch(backendurl)
            .then((response) => response.json())
            .then((data) => updateForm(data))
            .catch((error) => {
                console.error("Error:", error);
                alert("error...");
            });
        document.getElementById("write_btn").addEventListener("click", async function (event) {
            event.preventDefault();
            const accessToken = await getToken();

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
            fetch(backendurl, {
                method: "PUT",
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
    }
});

function updateForm(data) {
    const titleinput = document.getElementById("title");
    const contentinput = document.getElementById("content");
    const imagename = document.getElementById("filename");
    titleinput.value = data.title;
    contentinput.value = data.content;
    if (data.image) {
        imagename.textContent = data.image.split("media/")[1];
    }
}
