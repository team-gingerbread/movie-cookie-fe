// index.js
import { backend } from "/script/url.js";

const backend_url = backend + `community/`;
const frontend_url = new URLSearchParams(window.location.search);
const search = frontend_url.get("search");
const searchdata = { query: search };
// const search_input = document.querySelector("search").value;
const search_url = backend + `community/?search=`;
const $search_btn = document.getElementById("search_btn");

const tableContent = document.getElementById("table-item");

function fetchPosts(apiUrl) {
    fetch(apiUrl)
        .then((response) => response.json())
        .then((data) => {
            renderPosts(data);
        })
        .catch((error) => {
            console.error("데이터를 불러오는 중 에러 발생:", error);
        });
}
function renderPosts(posts) {
    tableContent.innerHTML = "";
    posts.forEach((post) => {
        const newItem = document.createElement("div");
        newItem.classList.add("item");

        newItem.innerHTML = `
            <div class="col1">${post.title}</div>
            <div class="col2">${post.username}</div>
            <div class="col3">${post.created_at}</div>
        `;

        tableContent.appendChild(newItem);
    });
}
document.addEventListener("DOMContentLoaded", function () {
    fetchPosts(backend_url);
});
