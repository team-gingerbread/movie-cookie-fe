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

    // 프로필 이미지 클릭 시 파일 업로드 창 표시
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

    displayUserMovies(accessToken);
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

// 프로필 정보 가져오기
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

// 프로필 섹션 업데이트
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

// 사용자가 좋아요한 영화, 본 영화, 볼 영화 가져와서 표시
async function displayUserMovies(accessToken) {
    const likedMoviesResponse = await fetch(`${backend}accounts/api/liked-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    if (likedMoviesResponse.ok) {
        const likedMoviesData = await likedMoviesResponse.json();
        console.log("좋아요한 영화 데이터:", likedMoviesData);
        const likedMoviesWithPosters = await fetchPosters(likedMoviesData);
        displayMoviesInSection("liked-movies-container", likedMoviesWithPosters);
    }

    const watchedMoviesResponse = await fetch(`${backend}accounts/api/watched-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    if (watchedMoviesResponse.ok) {
        const watchedMoviesData = await watchedMoviesResponse.json();
        const watchedMoviesWithPosters = await fetchPosters(watchedMoviesData);
        displayMoviesInSection("watched-movies-container", watchedMoviesWithPosters);
    }

    const watchlistMoviesResponse = await fetch(`${backend}accounts/api/watchlist-movies/`, {
        method: "GET",
        headers: {
            Authorization: "Bearer " + accessToken,
        },
    });

    if (watchlistMoviesResponse.ok) {
        const watchlistMoviesData = await watchlistMoviesResponse.json();
        const watchlistMoviesWithPosters = await fetchPosters(watchlistMoviesData);
        displayMoviesInSection("watchlist-movies-container", watchlistMoviesWithPosters);
    }
}

// 각 영화의 포스터 URL을 가져오는 함수
async function fetchPosters(moviesData) {
    const accessToken = await getToken();
    const moviesWithPosters = [];

    for (const movie of moviesData) {
        // 각각의 영화에 대한 추가 정보 가져오기
        const movieInfoResponse = await fetch(`${backend}movieinfo/detail/${movie.id}/`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        if (movieInfoResponse.ok) {
            const movieInfoData = await movieInfoResponse.json();
            // 포스터 URL을 추가한 새로운 객체 생성
            const movieWithPoster = {
                ...movie,
                posterUrl: getFirstPosterUrl(movieInfoData),
            };
            moviesWithPosters.push(movieWithPoster);
        }
    }

    return moviesWithPosters;
}

function displayMoviesInSection(sectionId, moviesData) {
    const sectionContainer = document.getElementById(sectionId);
    const movieGrid = document.createElement("div");
    movieGrid.classList.add("movie-grid");

    moviesData.forEach((movie) => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie");

        // 포스터 이미지 추가
        const posterElement = document.createElement("img");
        posterElement.src = movie.posterUrl;
        posterElement.alt = movie.title;
        posterElement.classList.add("movie-poster");
        movieElement.appendChild(posterElement);

        // 영화 제목 추가
        const titleElement = document.createElement("h2");
        titleElement.textContent = movie.title;
        movieElement.appendChild(titleElement);

        movieGrid.appendChild(movieElement);
    });

    sectionContainer.appendChild(movieGrid);
}

function getFirstPosterUrl(movieInfo) {
    const posters = movieInfo.posters || [];
    const firstPoster = posters[0];
    const posterUrl = firstPoster ? firstPoster.url : "/img/default.jpg";
    console.log("포스터 URL:", posterUrl);
    return posterUrl;
}
