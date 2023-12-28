// recommend/script/recommend.js - 추천 입력 JS
import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
console.log("recommend.js 연결");
const token = await getToken();
const urlParams = new URLSearchParams(window.location.search);
const id = urlParams.get("id");

// csv파일에 있는 장르들 리스트
const response = await fetch(`${backend}recommend/genres/`, {
    headers: {
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

const genreList = await response.json();

// HTML에 장르 체크박스 추가
const $genres = document.querySelector("#genres");

genreList.forEach((genre) => {
    const $label = document.createElement("label");

    const $checkbox = document.createElement("input");
    $checkbox.type = "checkbox";
    $checkbox.name = "genre";
    $checkbox.value = genre;

    const $labelSpan = document.createElement("span");
    $labelSpan.textContent = `${genre}`;

    $label.appendChild($checkbox);
    $label.appendChild($labelSpan);

    $genres.appendChild($label);
    $genres.appendChild(document.createElement("br"));
});

// 파라미터에 id가 있을경우 -> 기존 정보의 입력 수정후 재추천
if (token && id) {
    // 기존 정보를 받아오기 위한 GET요청
    const editResponse = await fetch(`${backend}recommend/${id}/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        },
        credentials: "include",
        method: "GET",
    });

    if (!editResponse.ok) {
        const errorData = await editResponse.json();
        alert(errorData.detail + " 수정이 불가능합니다.");
        window.location.replace("/recommend/list/");
    }

    // 입력 항목에 기존 정보들을 채워줌
    const originRes = await editResponse.json();

    const selectedGenres = originRes.genre;
    const checkboxes = document.querySelectorAll('input[name="genre"]');
    checkboxes.forEach(($checkbox) => {
        if (selectedGenres.includes($checkbox.value)) {
            $checkbox.checked = true;
        }
    });

    document.querySelectorAll('input[name="nation"]').forEach(($checkbox) => {
        const checkboxName = $checkbox.value === "국내" ? "nation_korean" : "nation_foreign";
        $checkbox.checked = originRes[checkboxName];
    });

    document.querySelectorAll('input[name="period"]').forEach(($checkbox) => {
        $checkbox.checked = originRes[`period_${$checkbox.value}`];
    });
}

const $submit = document.querySelector('button[type="submit"]');
$submit.addEventListener("click", async function (e) {
    e.preventDefault();

    // 입력값 가져오기
    const getCheckedValues = (name) => {
        const $checkboxes = document.querySelectorAll(`input[name="${name}"]:checked`);
        return Array.from($checkboxes).map((checkbox) => checkbox.value);
    };

    const $checkedGenres = getCheckedValues("genre");
    const $checkedNations = getCheckedValues("nation");
    const $checkedPeriods = getCheckedValues("period");

    const inputData = {
        genre: $checkedGenres,
        nation_korean: $checkedNations.includes("국내"),
        nation_foreign: $checkedNations.includes("해외"),
        period_2000: $checkedPeriods.includes("2000"),
        period_2010: $checkedPeriods.includes("2010"),
        period_2020: $checkedPeriods.includes("2020"),
    };

    // 영화 추천 요청 보내기
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

    // 성공 시 저장/수정 후 상세보기 창으로 넘어감
    let url, method;
    if (id) {
        // 수정
        url = `${backend}recommend/${id}/`;
        method = "PATCH";
    } else {
        // 저장
        url = `${backend}recommend/`;
        method = "POST";
    }

    const result = await response.json();
    console.log(result);
    if (token) {
        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: method,
            body: JSON.stringify(result),
        });

        if (!response.ok) {
            const errorData = await response.json();
            alert(errorData.detail);
            window.location.reload();
        }

        const res = await response.json();
        console.log(res);
        window.location.replace(`/recommend/detail/?db-id=${res.id}`);
    } else {
        result["created_at"] = new Date();
        let dataSet = JSON.parse(localStorage.getItem("recommend")) || [];
        dataSet.push(result);
        localStorage.setItem("recommend", JSON.stringify(dataSet));
        window.location.replace(`/recommend/detail/?local-id=${dataSet.length - 1}`);
    }
});
