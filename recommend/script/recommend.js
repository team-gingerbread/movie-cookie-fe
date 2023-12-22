// recommend/script/recommend.js - 추천 입력 JS
import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
console.log("recommend.js 연결");
const token = await getToken();

// csv파일에 있는 장르들 리스트
const genreList = [
    "SF",
    "가족",
    "갱스터",
    "공포",
    "공포(호러)",
    "교육",
    "군사",
    "기업ㆍ기관ㆍ단체",
    "느와르",
    "동성애",
    "드라마",
    "로드무비",
    "멜로/로맨스",
    "멜로드라마",
    "모험",
    "무협",
    "문화",
    "뮤지컬",
    "뮤직",
    "미스터리",
    "반공/분단",
    "범죄",
    "사회",
    "사회물(경향)",
    "서부",
    "스릴러",
    "스포츠",
    "시대극/사극",
    "신파",
    "실험",
    "아동",
    "애니메이션",
    "액션",
    "어드벤처",
    "역사",
    "옴니버스",
    "인권",
    "인물",
    "자연ㆍ환경",
    "재난",
    "전기",
    "전쟁",
    "종교",
    "지역",
    "첩보",
    "청춘영화",
    "코메디",
    "판타지",
    "하이틴(고교)",
    "합작(번안물)",
    "해양액션",
    "활극",
];

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

    // 성공 시 저장 후 상세보기 창으로 넘어감
    const result = await response.json();
    console.log(result);
    if (token) {
        const response = await fetch(`${backend}recommend/`, {
            headers: {
                Authorization: `Bearer ${token}`,
                "Content-Type": "application/json",
            },
            credentials: "include",
            method: "POST",
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
        localStorage.setItem(localStorage.length, JSON.stringify(result));
        window.location.replace(`/recommend/detail/?local-id=${localStorage.length - 1}`);
    }
});
