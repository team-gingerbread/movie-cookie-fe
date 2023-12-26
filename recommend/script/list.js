// recommend/script/list.js - 추천 목록 JS
import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
console.log("list.js 연결");

const processData = (data, urlKey) => {
    const $tbody = document.querySelector("tbody");
    const $none = document.querySelector("#none");
    $none.setAttribute("style", "display:none;");

    for (let i = 0; i < data.length; i++) {
        const url = `/recommend/detail/?${urlKey}=${data[i].id}`;

        const $tr = document.createElement("tr");
        $tr.setAttribute("class", "click-tr");
        $tr.setAttribute("onclick", "location.href='" + url + "'");

        const $order = document.createElement("td");
        $order.innerText = data[i].id;

        const $inputs = document.createElement("td");
        $inputs.innerText = data[i].genre;

        const $title = document.createElement("td");
        $title.innerText = data[i].movie_title;

        const date = new Date(data[i].created_at);
        const $date = document.createElement("td");
        $date.innerText = `${date.getMonth() + 1}/${date.getDate()}`;

        $tbody.appendChild($tr);
        $tr.appendChild($order);
        $tr.appendChild($inputs);
        $tr.appendChild($title);
        $tr.appendChild($date);
    }
};

const token = await getToken();
if (token) {
    // 로그인O -> DB요청
    const $desc = document.querySelector(".desc");
    $desc.setAttribute("style", "display:none;");
    const response = await fetch(`${backend}recommend/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        method: "GET",
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail);
        window.location.replace("/");
    }

    const res = await response.json();

    if (res.length > 0) {
        processData(res, "db-id");
    }
} else {
    // 로그인X -> 로컬스토리지 이용
    if (localStorage.length > 0) {
        const storedData = [];
        for (let i = localStorage.length; i > 0; i--) {
            const data = JSON.parse(localStorage.getItem(i));
            data["id"] = i;
            storedData.push(data);
        }
        processData(storedData, "local-id");
    }
}
