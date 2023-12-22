import { backend } from "/script/url.js";

const backend_url = backend + `movieinfo/search/`;
const frontend_url = new URLSearchParams(window.location.search);
const search = frontend_url.get("search");

const $search_btn = document.getElementById("search_btn");
const data = { query: search };

if (search) {
	fetch(backend_url, {
		method: "POST",
		headers: {
			"Content-Type": "application/json",
		},
		body: JSON.stringify(data),
	})
		.then((res) => res.json())
		.then((datas) => {
			const $table_item = document.getElementById("table-item");
			let html = "";
			datas.forEach((data) => {
				const url = `/movieinfo/detail/?movie=${data.id}`;
				html += `<div class='body-item' onclick='location.href="${url}"' style="cursor: pointer"><div class='col1 body-col1'>${data.title}</div><div class='col2'></div></div>`;
			});
			$table_item.innerHTML = html;
		});
}
