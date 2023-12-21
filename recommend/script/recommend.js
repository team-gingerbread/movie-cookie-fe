// recommend/script/recommend.js - 추천 입력 JS
import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
console.log("recommend.js 연결");

const token = await getToken();
console.log(backend, token);

const $submit = document.querySelector('button[type="submit"]');
$submit.addEventListener("click", async function (e) {
    e.preventDefault();

    // 입력값 가져오기
    const inputData = {
        input_genre: document.querySelector("#genre").value,
        input_nation: document.querySelector("#nation").value,
        input_period: document.querySelector("#period").value,
    };

    const response = await fetch(`${backend}recommend/generate/`, {
        headers: {
            "Content-Type": "application/json",
        },
        credentials: "include",
        method: "POST",
        body: JSON.stringify(inputData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail);
        window.location.reload();
    }

    // 성공 시 상세보기 창으로 넘어감
    // 성공 시 로그인여부 확인해서 로그인하면 저장요청 또보내고 로그인안했으면 로컬스토리지에 저장하고 상세보기 창으로 넘어가기? 로컬에 저장할때는 구분값 id같은걸 키로 줘서 그걸로 받아오면 될듯 - 근데이제 id는 로컬스토리지 길이로 차례차례 1부터 추가???
    const res = await response.json();
    console.log(res);
    // window.location.replace(`/recommend/detail/?id=${res.id}`);
});
