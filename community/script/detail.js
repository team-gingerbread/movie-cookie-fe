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
    const postcontentelement = document.querySelector(".post-content");

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
    comments.parent_comments.forEach((element) => {
        const commentbox = document.createElement("div");
        commentbox.setAttribute("class", "commentbox");
        const comment = document.createElement("div");
        comment.setAttribute("id", `${element.id}`);
        comment.textContent = `${element.username} : ${element.content} ${formatdatestring(element.created_at)}`;
        commentbox.appendChild(comment);
        addcommentbutton(commentbox, element.id);
        commentcontainer.appendChild(commentbox);
        renderreply(element.reply, 1);
    });
}

function renderreply(replies, count) {
    replies.forEach((element) => {
        const recomment = document.createElement("div");
        recomment.classList.add("recomment");
        recomment.setAttribute("id", `${element.id}`);
        recomment.textContent = `ㄴ`.repeat(count) + `${element.username} : ${element.content} ${formatdatestring(element.created_at)}`;
        commentcontainer.appendChild(recomment);
        addcommentbutton(recomment, element.id);
        // Recursive call for nested replies
        if (element.reply) {
            renderreply(element.reply, count + 1);
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

function addcommentbutton(div, commentid) {
    const modifybutton = document.createElement("button");
    const deletebutton = document.createElement("button");
    const recommentbutton = document.createElement("button");

    modifybutton.setAttribute("type", "submit");
    modifybutton.setAttribute("id", "comment-modify-btn");
    modifybutton.setAttribute("class", "btn cookiestyle-light");

    deletebutton.setAttribute("type", "submit");
    deletebutton.setAttribute("id", "comment-delete-btn");
    deletebutton.setAttribute("class", "btn cookiestyle-light");

    recommentbutton.setAttribute("type", "submit");
    recommentbutton.setAttribute("id", "comment-recomment-btn");
    recommentbutton.setAttribute("class", "btn cookiestyle-light");

    modifybutton.textContent = "수정";
    deletebutton.textContent = "삭제";
    recommentbutton.textContent = "대댓글";

    modifybutton.addEventListener("click", async function (event) {
        event.preventDefault();
        if (!isRecommentWindowOpen(commentid)) {
            modifycommentwindow(commentid);
        }
    });
    deletebutton.addEventListener("click", function (event) {
        event.preventDefault();
        deletecomment(commentid);
    });
    recommentbutton.addEventListener("click", function (event) {
        event.preventDefault();
        if (!isRecommentWindowOpen(commentid)) {
            makerecommentwindow(commentid);
        }
    });
    div.append(modifybutton);
    div.append(deletebutton);
    div.append(recommentbutton);
}

function makerecommentwindow(parentCommentId) {
    const parentCommentElement = document.getElementById(parentCommentId);
    const recommentWindow = document.createElement("div");
    recommentWindow.classList.add("recomment-window");

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "내용을 작성하세요");
    recommentWindow.appendChild(input);

    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "button");
    submitButton.textContent = "작성";
    submitButton.addEventListener("click", function () {
        const content = input.value;
        if (content.trim() !== "") {
            submitRecomment(parentCommentId, content);
            recommentWindow.remove();
        } else {
            alert("내용을 입력하세요.");
        }
    });
    recommentWindow.appendChild(submitButton);
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("type", "button");
    cancelButton.textContent = "취소";
    cancelButton.addEventListener("click", function () {
        recommentWindow.remove();
    });
    recommentWindow.appendChild(cancelButton);

    parentCommentElement.appendChild(recommentWindow);
}
function modifycommentwindow(parentCommentId) {
    const parentCommentElement = document.getElementById(parentCommentId);
    const recommentWindow = document.createElement("div");
    recommentWindow.classList.add("recomment-window");

    const input = document.createElement("input");
    input.setAttribute("type", "text");
    input.setAttribute("placeholder", "내용을 작성하세요");
    recommentWindow.appendChild(input);

    const submitButton = document.createElement("button");
    submitButton.setAttribute("type", "button");
    submitButton.textContent = "수정";
    submitButton.addEventListener("click", function () {
        const content = input.value;
        if (content.trim() !== "") {
            modifycomment(parentCommentId, content);
            recommentWindow.remove();
        } else {
            alert("내용을 입력하세요.");
        }
    });
    recommentWindow.appendChild(submitButton);
    const cancelButton = document.createElement("button");
    cancelButton.setAttribute("type", "button");
    cancelButton.textContent = "취소";
    cancelButton.addEventListener("click", function () {
        recommentWindow.remove();
    });
    recommentWindow.appendChild(cancelButton);

    parentCommentElement.appendChild(recommentWindow);
}

function isRecommentWindowOpen(parentCommentId) {
    const parentCommentElement = document.getElementById(parentCommentId);
    return parentCommentElement.querySelector(".recomment-window") !== null;
}
async function submitRecomment(parentCommentId, content) {
    const accessToken = await getToken();

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }
    const submiturl = commentposturl;

    const formdata = new FormData();
    formdata.append("post", postid);
    formdata.append("parent", parentCommentId);
    formdata.append("content", content);

    fetch(submiturl, {
        method: "POST",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        body: formdata,
    })
        .then((response) => {
            if (!response.ok) {
                alert("대댓글 작성 실패...");
            } else {
                window.location.reload();
            }
            return response.json();
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error:", error);
            alert("대댓글 작성 실패");
        });
}
async function modifycomment(CommentId, content) {
    const accessToken = await getToken();
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }
    const submiturl = commentposturl + `${CommentId}/`;
    const commentsResponse = await fetch(submiturl, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    if (!commentsResponse.ok) {
        alert("댓글 데이터를 불러오는 중 에러 발생");
        return;
    }

    const commentdata = await commentsResponse.json();

    // 현재 사용자의 id를 가져옴
    const userid = getUserIdFromToken(accessToken);

    // Comment의 작성자 id
    const commentauthorid = commentdata.user;

    if (userid !== commentauthorid) {
        alert("자신의 댓글만 수정할 수 있습니다.");
        window.location.href = "..";
        return;
    }

    const formdata = new FormData();
    formdata.append("post", postid);
    formdata.append("content", content);

    fetch(submiturl, {
        method: "PUT",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
        body: formdata,
    })
        .then((response) => {
            if (!response.ok) {
                alert("댓글 수정 실패...");
            } else {
                window.location.reload();
            }
            return response.json();
        })
        .then(() => {})
        .catch((error) => {
            console.error("Error:", error);
            alert("댓글 수정 실패");
        });
}
async function deletecomment(commentid) {
    const accessToken = await getToken();
    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }
    const submiturl = commentposturl + `${commentid}/`;

    const commentsResponse = await fetch(submiturl, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    if (!commentsResponse.ok) {
        alert("댓글 데이터를 불러오는 중 에러 발생");
        return;
    }

    const commentdata = await commentsResponse.json();

    // 현재 사용자의 id를 가져옴
    const userid = getUserIdFromToken(accessToken);

    // Comment의 작성자 id
    const commentauthorid = commentdata.user;

    if (userid !== commentauthorid) {
        alert("자신의 댓글만 삭제할 수 있습니다.");
        window.location.href = "..";
        return;
    }
    fetch(submiturl, {
        method: "DELETE",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    })
        .then((response) => {
            if (!response.ok) {
                alert("댓글 삭제 실패...");
            } else {
                window.location.reload();
            }
        })

        .catch((error) => {
            console.error("Error:", error);
            alert("댓글 삭제 실패");
        });
}
