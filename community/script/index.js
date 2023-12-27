// index.js
import { backend } from "/script/url.js";

const backend_url = backend + `community/`;
const frontend_url = new URLSearchParams(window.location.search);
const search = frontend_url.get("search");
const search_url = backend + `community/?search=`;

const tableContent = document.getElementById("table-item");

function fetch_posts(apiurl) {
    fetch(apiurl)
        .then((response) => response.json())
        .then((data) => {
            render_posts(data);
        })
        .catch((error) => {
            console.error("데이터를 불러오는 중 에러 발생:", error);
        });
}
function render_posts(posts) {
    tableContent.innerHTML = "";
    posts.forEach((post) => {
        const newItem = document.createElement("div");
        newItem.classList.add("item");

        newItem.innerHTML = `
            <div class="col1">${post.title}</div>
            <div class="col2">${post.username}</div>
            <div class="col3">${formatDateString(post.created_at)}</div>
        `;

        tableContent.appendChild(newItem);
    });
}

function formatDateString(dateString) {
    // datetimefield 형식 변경 함수
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

document.addEventListener("DOMContentLoaded", function () {
    if (search) {
        const searchApiUrl = search_url + search;
        fetch_posts(searchApiUrl);
    } else {
        fetch_posts(backend_url);
    }
});
