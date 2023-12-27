// index.js
import { backend } from "/script/url.js";

const backend_url = backend + `community/`;
const frontend_url = new URLSearchParams(window.location.search);
const search = frontend_url.get("search");
const search_url = backend + `community/?search=`;

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
    posts.forEach((post) => {
        const $tbody = document.querySelector("tbody");
        const $tr = document.createElement("tr");
        const $title = document.createElement("td");
        $title.innerText = post.title;
        const $author = document.createElement("td");
        $author.innerText = post.username;
        const $date = document.createElement("td");
        $date.innerText = formatDateString(post.created_at);

        $tbody.appendChild($tr);
        $tr.appendChild($title);
        $tr.appendChild($author);
        $tr.appendChild($date);
    });
}

function formatDateString(dateString) {
    // datetimefield 형식 변경용
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
