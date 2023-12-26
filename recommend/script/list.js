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
        $order.innerText = data.length - i;

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
    const dataSet = JSON.parse(localStorage.getItem("recommend")).reverse() || [];
    if (dataSet.length > 0) {
        dataSet.forEach((data, index) => {
            data["id"] = dataSet.length - index - 1;
        });
        processData(dataSet, "local-id");
    }
}
