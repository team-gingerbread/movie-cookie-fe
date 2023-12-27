document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access");

    if (accessToken) {
        document.querySelector(".loginfield").innerHTML = `
            <button id="profile_edit" class="btn btn-rd cookiestyle-light">프로필 수정</button>
            <button id="logoutButton" class="btn btn-rd cookiestyle-light">로그아웃</button>

        `;
    }

    document.querySelector(".userimg").addEventListener("click", function () {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/*";

        fileInput.addEventListener("change", function (event) {
            const file = event.target.files[0];
            if (file) {
                updateProfileImage(file);
            }
        });

        function updateProfileImage(file) {
            const accessToken = localStorage.getItem("access");

            if (!accessToken) {
                alert("로그인이 필요합니다.");
                window.location.href = "/accounts/login/index.html";
                return;
            }

            const formData = new FormData();
            formData.append("profile_picture", file);

            fetch(`http://127.0.0.1:8000/accounts/api/user-profile/${getUserIdFromToken(accessToken)}/`, {
                method: "PATCH",
                headers: {
                    Authorization: "Bearer " + accessToken,
                },
                body: formData,
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("프로필 이미지를 업데이트하는 데 실패했습니다.");
                    }
                    return response.json();
                })
                .then((data) => {
                    updateProfileSection(data);
                })
                .catch((error) => {
                    console.error("Error:", error);
                });
        }

        fileInput.click();
    });

    document.getElementById("logoutButton").addEventListener("click", function () {
        localStorage.removeItem("access");
        localStorage.removeItem("refresh");
        window.location.href = "/accounts/login/index.html";
    });

    document.getElementById("profile_edit").addEventListener("click", function () {
        window.location.href = "/accounts/mypage_edit/index.html";
    });
});

document.addEventListener("DOMContentLoaded", function () {
    fetchUserProfile();
});

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

function fetchUserProfile() {
    const accessToken = localStorage.getItem("access");

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/index.html";
        return;
    }

    fetch(`http://127.0.0.1:8000/accounts/api/user-profile/${getUserIdFromToken(accessToken)}`, {
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error("프로필 정보를 불러오는 데 실패했습니다.");
            }
            return response.json();
        })
        .then((data) => {
            console.log("서버 응답 데이터:", data);
            updateProfileSection(data);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
}

function updateProfileSection(userData) {
    document.querySelector(".username").textContent = userData.username;
    document.querySelector(".nickname").textContent = userData.nickname;
    document.querySelector(".genre").textContent = userData.genre;
    document.querySelector(".bio").textContent = userData.bio || "소개가 없습니다.";
    document.querySelector(".password").textContent = userData.password;

    if (userData.profile_picture) {
        document.querySelector(".userimg").style.backgroundImage = `url(${userData.profile_picture})`;
        document.querySelector(".userimg").style.backgroundSize = "cover";
    } else {
        document.querySelector(".userimg").style.backgroundImage = `url('http://127.0.0.1:8000/static/images/profile_basic.png')`;
        document.querySelector(".userimg").style.backgroundSize = "cover";
    }
}
