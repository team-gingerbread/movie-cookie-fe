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

            try {
                const response = await fetch(`${backend}accounts/api/user-profile/${getUserIdFromToken(accessToken)}/`, {
                    method: "PATCH",
                    headers: {
                        Authorization: "Bearer " + accessToken,
                    },
                    body: formData,
                });

                if (!response.ok) {
                    throw new Error("프로필 이미지를 업데이트하는 데 실패했습니다.");
                }

                const data = await response.json();
                updateProfileSection(data);
            } catch (error) {
                console.error("Error:", error);
            }
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

    try {
        const response = await fetch(`${backend}accounts/api/user-profile/${getUserIdFromToken(accessToken)}`, {
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        if (!response.ok) {
            throw new Error("프로필 정보를 불러오는 데 실패했습니다.");
        }

        const data = await response.json();
        console.log("서버 응답 데이터:", data);
        updateProfileSection(data);
    } catch (error) {
        console.error("Error:", error);
    }
}

function updateProfileSection(userData) {
    const userimgElement = document.querySelector(".userimg");
    userimgElement.style.backgroundImage = `url(${userData.profile_picture || "/img/profile_basic.png"})`;
    userimgElement.style.backgroundSize = "cover";

    document.querySelector(".username").textContent = userData.username;
    document.querySelector(".nickname").textContent = userData.nickname;
    document.querySelector(".genre").textContent = userData.genre;
    document.querySelector(".bio").textContent = userData.bio || "소개가 없습니다.";
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
        console.log("좋아요한 영화 데이터:", likedMoviesData);

        // 좋아요한 영화의 ID 배열 추출
        const likedMovieIds = likedMoviesData.map((entry) => entry.movie);

        // 각 영화의 포스터 정보 가져오기
        const likedMoviesWithPosters = await fetchPosters(likedMovieIds);
        displayMoviesInSection("liked-movies-container", likedMoviesWithPosters);
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

        // 본 영화의 ID 배열 추출
        const watchedMovieIds = watchedMoviesData.map((entry) => entry.movie);

        // 각 영화의 포스터 정보 가져오기
        const watchedMoviesWithPosters = await fetchPosters(watchedMovieIds);
        displayMoviesInSection("watched-movies-container", watchedMoviesWithPosters);
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

        // 볼 영화의 ID 배열 추출
        const watchlistMovieIds = watchlistMoviesData.map((entry) => entry.movie);

        // 각 영화의 포스터 정보 가져오기
        const watchlistMoviesWithPosters = await fetchPosters(watchlistMovieIds);
        displayMoviesInSection("watchlist-movies-container", watchlistMoviesWithPosters);
    }
});

// 각 영화의 포스터 URL을 가져오는 함수
async function fetchPosters(movieIds) {
    const accessToken = await getToken();
    const moviesWithPosters = [];

    for (const movieId of movieIds) {
        // 각각의 영화에 대한 추가 정보 가져오기
        const movieInfoResponse = await fetch(`${backend}movieinfo/detail/${movieId}/`, {
            method: "GET",
            headers: {
                Authorization: "Bearer " + accessToken,
            },
        });

        if (movieInfoResponse.ok) {
            const movieInfoData = await movieInfoResponse.json();
            console.log("영화 정보 데이터:", movieInfoData); // 디버깅을 위한 로그 추가

            // 포스터 URL을 가져오는 함수를 통해 포스터 URL을 얻습니다.
            const posterUrl = getFirstPosterUrl(movieInfoData);

            // 포스터 URL을 추가한 새로운 객체 생성
            const movieWithPoster = {
                id: movieId, // 영화 ID 추가
                movie: movieInfoData, // 영화 정보 추가
                posterUrl: posterUrl, // 포스터 URL 추가
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

        const posterElement = document.createElement("img");
        posterElement.src = getFirstPosterUrl(movie.movie) || "/img/default.jpg"; // 수정: movie.movie로 접근

        console.log("포스터 URL:", getFirstPosterUrl(movie)); // 디버깅을 위한 로그 추가
        posterElement.alt = movie.movie.title; // 여기도 수정
        posterElement.classList.add("movie-poster");
        movieElement.appendChild(posterElement);

        // 영화 제목 추가
        const titleElement = document.createElement("h2");
        titleElement.textContent = movie.movie.title; // 여기도 수정
        movieElement.appendChild(titleElement);

        movieGrid.appendChild(movieElement);
    });

    sectionContainer.appendChild(movieGrid);
}

function getFirstPosterUrl(movie) {
    const posters = movie.posters || []; // 수정: movie.posters로 접근
    const firstPoster = posters[0];
    const posterUrl = firstPoster ? firstPoster.url : "/img/default.jpg";
    console.log("포스터 URL:", posterUrl);
    return posterUrl;
}
