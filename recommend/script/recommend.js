// recommend/script/recommend.js - 추천 입력 JS
console.log("recommend.js 연결");

const $submit = document.querySelector('button[type="submit"]');
$submit.addEventListener("click", async function (e) {
    e.preventDefault();

    // 입력값 가져오기
    const inputData = {
        input_genre: document.querySelector("#genre").value,
        input_nation: document.querySelector("#nation").value,
        input_period: document.querySelector("#period").value,
    };

    const response = await fetch("http://52.79.54.190/recommend/generate/", {
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
    const res = await response.json();
    console.log(res);
    // window.location.replace(`/recommend/detail/?id=${res.id}`);
});
