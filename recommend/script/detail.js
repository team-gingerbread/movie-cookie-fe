// recommend/script/detail.js - 추천 상세정보 JS
import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
console.log("detail.js 연결");
const token = await getToken();
const urlParams = new URLSearchParams(window.location.search);
const localId = urlParams.get("local-id");
const dbId = urlParams.get("db-id");

const $title = document.querySelector(".title");
const $poster = document.querySelector("#poster");
const $movieinfo = document.querySelector("#movieinfo");
const $btn1 = document.querySelector("#btn1");
const $btn2 = document.querySelector("#btn2");

if (token) {
    // 로그인 O
    const saveId = localStorage.getItem("saveId");
    if (saveId && localId) {
        // 로그인X -> 로그인 후 저장하기를 누르고 로그인 하고 왔을 경우
        const data = JSON.parse(localStorage.getItem("recommend"))[saveId];
        const response = await fetch(`${backend}recommend/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: "POST",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail);
            window.location.reload();
        }

        // 해당 추천객체 저장 후 로컬스토리지에서는 삭제
        const res = await response.json();
        const dataSet = JSON.parse(localStorage.getItem("recommend"));
        dataSet.splice(saveId, 1);
        localStorage.setItem("recommend", JSON.stringify(dataSet));
        localStorage.removeItem("saveId");
        window.location.replace(`/recommend/detail/?db-id=${res.id}`);
    }

    //로그인 O - 디테일페이지 채우기
    const response = await fetch(`${backend}recommend/${dbId}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        method: "GET",
    });

    // 실패시 목록으로 돌아감
    if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.detail);
        window.location.replace("/list/");
    }
    const data = await response.json();

    // 받아온 데이터로 내용 채우기
    if (data.poster_url) {
        $poster.setAttribute("src", data.poster_url);
    } else {
        $poster.setAttribute("src", "/img/default.jpg");
    }
    $title.innerText = data.movie_title;

    $movieinfo.addEventListener("click", async function (e) {
        window.location.replace(`/movieinfo/detail/?movie=${data.movie_id}`);
    });

    $btn1.innerText = "수정하기";
    $btn2.innerText = "삭제하기";
    // 수정하기: id와 함께 입력받는 창으로 넘어감
    $btn1.addEventListener("click", async function (e) {
        window.location.replace(`/recommend/?id=${dbId}`);
    });
    // 삭제하기: DELETE요청으로 삭제함
    $btn2.addEventListener("click", async function (e) {
        const response = await fetch(`${backend}recommend/${dbId}/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: "DELETE",
        });

        if (response.ok) {
            alert("삭제되었습니다.");
            window.location.replace("/recommend/list/");
        }
    });
} else {
    // 로그인 X - 디테일페이지 채우기
    const data = JSON.parse(localStorage.getItem("recommend"))[localId];

    // 로컬스토리지 데이터로 내용 채우기
    if (data.poster_url) {
        $poster.setAttribute("src", data.poster_url);
    } else {
        $poster.setAttribute("src", "/img/default.jpg");
    }
    $title.innerText = data.movie_title;

    $movieinfo.addEventListener("click", async function (e) {
        window.location.replace(`/movieinfo/detail/?movie=${data.movie_id}`);
    });

    $btn1.innerText = "로그인 후 저장하기";
    $btn2.innerText = "다시하기";
    // 로그인 후 저장하기: 로그인페이지로 이동 후 다시 여기 오면 post요청 보냄
    $btn1.addEventListener("click", async function (e) {
        localStorage.setItem("saveId", localId);
        window.location.replace(`/accounts/login/?next=/recommend/detail/?local-id=${localId}`);
    });
    // 다시하기: 로컬스토리지에서 삭제 후 입력페이지로 넘어감
    $btn2.addEventListener("click", async function (e) {
        const dataSet = JSON.parse(localStorage.getItem("recommend"));
        dataSet.splice(localId, 1);
        localStorage.setItem("recommend", JSON.stringify(dataSet));
        window.location.replace(`/recommend/`);
    });
}
