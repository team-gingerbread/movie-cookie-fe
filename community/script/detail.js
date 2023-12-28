import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";

// 현재 URL에서 post_id 추출

const postid = new URLSearchParams(window.location.search).get("postid");
const backendurl = backend + `community/${postid}/`;
const commentposturl = backend + `community/comments/`;

const commentsurl = backend + `community/view/comments/${postid}/`;
const commentcontainer = document.querySelector(".comments-container");

let postauthorid;

document.addEventListener("DOMContentLoaded", function () {
    // 페이지 로딩 시 포스트와 댓글 렌더링

    fetch(backendurl)
        .then((response) => response.json())
        .then((data) => renderpost(data))
        .catch((error) => console.error("포스트 데이터를 불러오는 중 에러 발생:", error));

    fetch(commentsurl)
        .then((response) => response.json())
        .then((data) => rendercomments(data))
        .catch((error) => console.error("포스트 데이터를 불러오는 중 에러 발생:", error));
});

function renderpost(post) {
    const postcontainer = document.querySelector(".post-detail-container");
    const posttitleelement = document.querySelector(".post-title");
    const postauthorelement = document.querySelector(".post-author");
    const postdateelement = document.querySelector(".post-date");
    const postcontentelement = document.querySelector(".post-content textarea");

    posttitleelement.textContent = post.title;
    postauthorelement.textContent = `작성자: ${post.username}`;
    postdateelement.textContent = `작성일: ${formatdatestring(post.created_at)}`;
    postcontentelement.textContent = post.content;
    if (post.image) {
        const postimageelement = document.createElement("img");
        postimageelement.src = post.image;
        postcontainer.appendChild(postimageelement);
    }
    postauthorid = post.user;
}

function rendercomments(comments) {
    const x = comments.parent_comments;
    x.forEach((element) => {
        const comment = document.createElement("div");
        comment.textContent = `${element.username} : ${element.content}         ${formatdatestring(element.created_at)}`;
        commentcontainer.appendChild(comment);
        if (element.reply) {
            renderreply(element.reply, 1);
        }
    });
}
function renderreply(comments, count) {
    comments.forEach((element) => {
        const recomment = document.createElement("div");
        recomment.classList.add("recomment");

        recomment.textContent = `ㄴ`.repeat(count) + `${element.username} : ${element.content}         ${formatdatestring(element.created_at)}`;
        commentcontainer.appendChild(recomment);
        if (element.reply) {
            count = count + 1;
            renderreply(element.reply, count);
        }
    });
}
function formatdatestring(dateString) {
    const date = new Date(dateString);
    return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")} ${date
        .getHours()
        .toString()
        .padStart(2, "0")}:${date.getMinutes().toString().padStart(2, "0")}:${date.getSeconds().toString().padStart(2, "0")}`;
}

// 토큰에서 사용자 ID 추출하는 함수
function getUserIdFromToken(token) {
    try {
        const base64Url = token.split(".")[1];
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        return payload.user_id; // 토큰의 payload에서 user_id 필드 추출
    } catch (error) {
        console.error("토큰 분석 중 오류:", error);
        return null;
    }
}

document.getElementById("comment_btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const accessToken = await getToken();

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }
    const content = document.getElementById("comment_content").value;
    const formdata = new FormData();
    formdata.append("post", postid);
    formdata.append("content", content);

    fetch(commentposturl, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        body: formdata,
    })
        .then((response) => {
            if (!response.ok) {
                alert("write failed...");
            } else {
                location.reload();
            }
            return response.json();
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error:", error);
            alert("write failed");
        });
});
document.getElementById("postdelete_btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const accessToken = await getToken();
    const userId = getUserIdFromToken(accessToken);

    if (userId !== postauthorid) {
        alert("자신의 게시글만 삭제할 수 있습니다.");
        window.location.href = "..";
        return;
    }

    fetch(backendurl, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    })
        .then((response) => {
            if (!response.ok) {
                alert("DELETE failed...");
            } else {
                window.location.href = "..";
            }
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error:", error);
            alert("DELETE failed");
        });
});
document.getElementById("postmodify_btn").addEventListener("click", async function (event) {
    event.preventDefault();
    const accessToken = await getToken();
    const userId = getUserIdFromToken(accessToken);

    if (userId !== postauthorid) {
        alert("자신의 게시글만 수정할 수 있습니다.");
        window.location.href = "..";
        return;
    }
    window.location.href = `../write/index.html?postid=${postid}`;
});
