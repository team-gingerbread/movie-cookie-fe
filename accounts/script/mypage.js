import { backend } from "/script/url.js";
import { getToken } from "/script/token.js";
document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = await getToken();

    fetchUserProfile();

    if (accessToken) {
        document.querySelector(".loginfield").innerHTML = `
            <button id="profile-edit" class="btn btn-rd cookiestyle-light">프로필 수정</button>
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

        async function updateProfileImage(file) {
            const accessToken = await getToken();

            if (!accessToken) {
                alert("로그인이 필요합니다.");
                window.location.href = "/accounts/login/";
                return;
            }

            const formData = new FormData();
            formData.append("profile_picture", file);

            fetch(`${backend}accounts/api/user-profile/${getUserIdFromToken(accessToken)}/`, {
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
        window.location.href = "/accounts/login/";
    });

    document.getElementById("profile-edit").addEventListener("click", function () {
        window.location.href = "/accounts/mypage-edit/";
    });
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

async function fetchUserProfile() {
    const accessToken = await getToken();

    if (!accessToken) {
        alert("로그인이 필요합니다.");
        window.location.href = "/accounts/login/";
        return;
    }

    fetch(`${backend}accounts/api/user-profile/${getUserIdFromToken(accessToken)}`, {
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

    if (userData.profile_picture) {
        document.querySelector(".userimg").style.backgroundImage = `url(${userData.profile_picture})`;
        document.querySelector(".userimg").style.backgroundSize = "cover";
    } else {
        document.querySelector(".userimg").style.backgroundImage = `url(/img/profile_basic.png)`;
        document.querySelector(".userimg").style.backgroundSize = "cover";
    }
}

function getFirstPosterUrl(movieInfo) {
    const posters = movieInfo.movie ? movieInfo.movie.posters : [];
    const firstPoster = posters[0];
    return firstPoster ? firstPoster.url : "/img/default.jpg";
}

function displayMoviesInSection(sectionId, moviesData) {
    const sectionContainer = document.getElementById(sectionId);
    const movieGrid = document.createElement("div");
    movieGrid.classList.add("movie-grid");

    moviesData.forEach((movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        const posterElement = document.createElement("img");
        posterElement.src = getFirstPosterUrl(movie.movie);
        posterElement.alt = movie.movie.title;
        posterElement.classList.add("movie-poster");
        movieElement.appendChild(posterElement);

        const titleElement = document.createElement("h2");
        titleElement.textContent = movie.movie.title;
        movieElement.appendChild(titleElement);

        movieGrid.appendChild(movieElement);
    });

    sectionContainer.appendChild(movieGrid);
}

document.addEventListener("DOMContentLoaded", async function () {
    const accessToken = await getToken();

    // 사용자가 좋아요한 영화 가져오기
    const likedMoviesResponse = await fetch(`${backend}accounts/api/liked-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });
    if (likedMoviesResponse.ok) {
        const likedMoviesData = await likedMoviesResponse.json();
        displayMoviesInSection("liked-movies-container", likedMoviesData);
    }

    // 사용자가 본 영화 가져오기
    const watchedMoviesResponse = await fetch(`${backend}accounts/api/watched-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });
    if (watchedMoviesResponse.ok) {
        const watchedMoviesData = await watchedMoviesResponse.json();
        displayMoviesInSection("watched-movies-container", watchedMoviesData);
    }

    // 사용자가 볼 영화 가져오기
    const watchlistMoviesResponse = await fetch(`${backend}accounts/api/watchlist-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });
    if (watchlistMoviesResponse.ok) {
        const watchlistMoviesData = await watchlistMoviesResponse.json();
        displayMoviesInSection("watchlist-movies-container", watchlistMoviesData);
    }
});
