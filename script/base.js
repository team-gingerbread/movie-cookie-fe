// 공통 JS
import { getToken } from "./token.js";
console.log("공통 JS 연결");

const token = await getToken();

if (token) {
    // 로그인 O -> 로그인/회원가입 안 보이게 함
    const $login = document.querySelector("header a:nth-child(4)");
    const $signup = document.querySelector("header a:nth-child(5)");
    $login.setAttribute("style", "display: none;");
    $signup.setAttribute("style", "display: none;");
} else {
    // 로그인 X -> 마이페이지/로그아웃 안 보이게 함
    const $mypage = document.querySelector("header a:nth-child(6)");
    const $logout = document.querySelector("header a:nth-child(7)");
    $mypage.setAttribute("style", "display: none;");
    $logout.setAttribute("style", "display: none;");
}
