import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = await getToken();

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
            window.location.href = "/accounts/login/";
            return;
        }

        fetch(`${backend}accounts/api/user-profile/${userId}/`, {
            method: "GET",
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

    // function updateProfileForm(userData) {
    //     usernameInput.value = userData.username;
    //     emailInput.value = userData.email;
    //     nicknameInput.value = userData.nickname;
    //     bioInput.value = userData.bio || "";

    //     updateProfileButton.addEventListener("click", function (event) {
    //         event.preventDefault();

    //         const requestBody = {
    //             new_password1: newPasswordInput.value,
    //             new_password2: newPassword2Input.value,
    //             old_password: currentPasswordInput.value,
    //             email: emailInput.value,
    //             nickname: nicknameInput.value,
    //             bio: bioInput.value,
    //         };

    //         fetch(`${backend}accounts/password/change/`, {
    //             method: "POST",
    //             headers: {
    //                 "Content-Type": "application/json",
    //                 Authorization: "Bearer " + accessToken,
    //             },
    //             body: JSON.stringify(requestBody),
    //         })
    //             .then((response) => {
    //                 if (!response.ok) {
    //                     throw new Error(`프로필 수정에 실패했습니다. 응답코드: ${response.status}`);
    //                 }
    //                 return response.json();
    //             })
    //             .then((data) => {
    //                 window.location.href = "/accounts/mypage/";
    //             })
    //             .catch((error) => {
    //                 console.error("Error:", error);
    //                 alert("프로필 수정에 실패했습니다.");
    //             });
    //     });
    // }

    function updateProfileForm(userData) {
        usernameInput.value = userData.username;
        emailInput.value = userData.email;
        nicknameInput.value = userData.nickname;
        bioInput.value = userData.bio || "";

        updateProfileButton.addEventListener("click", function (event) {
            event.preventDefault();

            const profileUpdateBody = {
                email: emailInput.value,
                nickname: nicknameInput.value,
                bio: bioInput.value,
            };

            const passwordChangeBody = {
                new_password1: newPasswordInput.value,
                new_password2: newPassword2Input.value,
                old_password: currentPasswordInput.value,
            };

            // 프로필 업데이트 요청
            updateProfile(profileUpdateBody);

            // 비밀번호 변경 요청
            changePassword(passwordChangeBody);
        });
    }

    function updateProfile(body) {
        fetch(`${backend}accounts/api/user-profile/${userId}/`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`프로필 수정에 실패했습니다. 응답코드: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("프로필이 성공적으로 업데이트되었습니다.", data);
                fetchUserProfile();

                // MyPage로 이동
                window.location.pathname = "/accounts/mypage/";
                window.location.pathname = "/accounts/mypage/";
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("프로필 수정에 실패했습니다.");
            });
    }

    function changePassword(body) {
        fetch(`${backend}accounts/password/change/`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
            body: JSON.stringify(body),
        })
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`비밀번호 변경에 실패했습니다. 응답코드: ${response.status}`);
                }
                return response.json();
            })
            .then((data) => {
                console.log("비밀번호가 성공적으로 변경되었습니다.", data);
                // 비밀번호 변경 후 추가 작업 수행
            })
            .catch((error) => {
                console.error("Error:", error);
                alert("비밀번호 변경에 실패했습니다.");
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
