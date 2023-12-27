// 공통 JS
import { getToken } from "./token.js";
import { backend } from "./url.js";
console.log("공통 JS 연결");

const token = await getToken();

if (token) {
    // 로그인 O -> 로그인/회원가입 안 보이게 함
    const $login = document.querySelector("header a:nth-child(4)");
    const $signup = document.querySelector("header a:nth-child(5)");
    $login.setAttribute("style", "display: none;");
    $signup.setAttribute("style", "display: none;");

    const $logout = document.querySelector("#logout");
    $logout.addEventListener("click", async function (e) {
        e.preventDefault();
        logout();
    });
} else {
    // 로그인 X -> 마이페이지/로그아웃 안 보이게 함
    const $mypage = document.querySelector("header a:nth-child(6)");
    const $logout = document.querySelector("header a:nth-child(7)");
    $mypage.setAttribute("style", "display: none;");
    $logout.setAttribute("style", "display: none;");
}

// 유저 로그아웃 POST 요청
async function logout() {
    const response = await fetch(`${backend}accounts/logout/`, {
        headers: {
            Authorization: `Bearer ${token}`,
            "Content-type": "application/json",
        },
        method: "POST",
    });
    const res = await response.json();
    // 로컬스토리지의 토큰정보도 비움
    localStorage.removeItem("access");
    localStorage.removeItem("refresh");
    alert(res.detail);
    window.location.replace("/");
}
