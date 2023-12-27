document.addEventListener("DOMContentLoaded", function () {
    const accessToken = localStorage.getItem("access");

    const usernameInput = document.getElementById("username");
    const emailInput = document.getElementById("email");
    const currentPasswordInput = document.getElementById("currentPassword");
    const newPasswordInput = document.getElementById("newPassword");
    const newPassword2Input = document.getElementById("newPassword2");
    const nicknameInput = document.getElementById("nickname");
    const bioInput = document.getElementById("bio");
    const updateProfileButton = document.getElementById("updateProfileButton");

    const userId = getUserIdFromToken(accessToken);
    fetchUserProfile();

    function fetchUserProfile() {
        if (!accessToken || !userId) {
            alert("로그인이 필요합니다.");
            window.location.href = "/accounts/login/index.html";
            return;
        }

        fetch(`http://127.0.0.1:8000/accounts/api/user-profile/${userId}/`, {
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
                updateProfileForm(data);
            })
            .catch((error) => {
                console.error("Error:", error);
            });
    }

    function updateProfileForm(userData) {
        usernameInput.value = userData.username;
        emailInput.value = userData.email;
        nicknameInput.value = userData.nickname;
        bioInput.value = userData.bio || "";

        updateProfileButton.addEventListener("click", function (event) {
            event.preventDefault();

            const requestBody = {
                new_password1: newPasswordInput.value,
                new_password2: newPassword2Input.value,
                old_password: currentPasswordInput.value,
                email: emailInput.value,
                nickname: nicknameInput.value,
                bio: bioInput.value,
            };

            fetch(`http://127.0.0.1:8000/accounts/password/change/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify(requestBody),
            })
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("프로필 수정에 실패했습니다.");
                    }
                    return response.json();
                })
                .then((data) => {
                    window.location.href = "/accounts/mypage/index.html";
                })
                .catch((error) => {
                    console.error("Error:", error);
                    alert("프로필 수정에 실패했습니다.");
                });
        });
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
});
