import { getToken } from "/script/token.js";
import { backend } from "/script/url.js";

const accessToken = await getToken();
const backend_url = backend + `movieinfo/`;
const frontend_url = new URLSearchParams(window.location.search);

const $back_btn = document.getElementById("back-btn");
$back_btn.addEventListener("click", (e) => {
    window.location.href = `/movieinfo/?search=${localStorage.getItem("search")}`;
});

const movie = parseInt(frontend_url.get("movie"));
fetch(`${backend_url}detail/${movie}/`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((res) => res.json())
    .then((data) => {
        const $movie_title = document.getElementById("movie-title");
        $movie_title.innerText = `${data.title}`;
        let directors = "";
        try {
            data.directors.forEach((director) => {
                directors += `<div>${director.name}</div><div>,&nbsp</div>`;
            });
        } catch {
            directors = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let actors = "";
        try {
            data.actors.forEach((actor) => {
                actors += `<div>${actor.name}</div><div>,&nbsp</div>`;
            });
        } catch {
            actors = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let genres = "";
        try {
            data.genres.forEach((genre) => {
                genres += `<div>${genre.genre}</div><div>,&nbsp</div>`;
            });
        } catch {
            genres = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let companies = "";
        try {
            data.companies.forEach((company) => {
                companies += `<div>${company.name}</div><div>,&nbsp</div>`;
            });
        } catch {
            companies = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let release_date = "";
        if (data.release_date != "1930-01-01") {
            release_date = data.release_date;
        } else {
            release_date = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let image_url = "";
        try {
            image_url = `<img src="${data.posters[0].url}"/>`;
        } catch {
            image_url = `제공된 포스터가 없습니다.`;
        }

        let runtime = "";
        try {
            runtime = data.runtime;
        } catch {
            runtime = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        let rating = "";
        if (data.rating) {
            rating = data.rating;
        } else {
            rating = `<div class='nodata'>정보가 없습니다.</div>`;
        }

        const $moveinfo_area = document.getElementById("movieinfo-area");
        const html = `
		<div class="movie-poster cookiestyle-medium">
			${image_url}
		</div>
		<div class="movie-text">
			<div class='info'>
				<div class="info-title" id="director">
					<div class='bullet'></div>
						감독: 
				</div>
				<div class='info-content'>${directors.slice(0, -17)}</div>
				</div>
			<div class='info'>
				<div class="info-title" id="actor">
					<div class='bullet'></div>
						배우: 
				</div>
				<div class='info-content'>${actors.slice(0, -17)}</div>
				</div>
			<div class='info'>
				<div class="info-title" id="runingtime">
					<div class='bullet'></div>
					상영시간: 
				</div>
				<div class='info-content'>${runtime} 분</div>
			</div>
			<div class='info'>
				<div class="info-title" id="ratomg">
					<div class='bullet'></div>
						등급: 
				</div>
				<div class='info-content'>${rating}</div>
				</div>
			<div class='info'>
				<div class="info-title" id="genre">
					<div class='bullet'></div>
						장르: 
				</div>
				<div class='info-content'>${genres.slice(0, -17)}</div>
				</div>
			<div class='info'>
				<div class="info-title" id="release">
					<div class='bullet'></div>
						개봉일: 
				</div>
				<div class='info-content'>${release_date}</div>
				</div>
			<div class='info'>
				<div class="info-title" id="company">
					<div class='bullet'></div>
						제작사: 
				</div>
				<div class='info-content'>${companies.slice(0, -17)}</div>
			</div>
		</div>
		`;
        $moveinfo_area.innerHTML = html;

        const $video_area = document.getElementById("video-area");

        let vod_url = "";
        try {
            vod_url = `<div class='vod vod cookiestyle-medium'><video src="${data.vods[0].url}" controls="" autoplay="" muted="muted" controlslist="nodownload"></video></div>`;
        } catch {
            vod_url = `<div class='vod cookiestyle-medium'>제공된 VOD가 없습니다.</div>`;
        }

        $video_area.innerHTML = vod_url;

        const $plot = document.getElementById("plot");
        if (data.plot) {
            $plot.innerText = data.plot;
        } else {
            $plot.innerText = `제공된 줄거리 정보가 없습니다.`;
        }
        $plot.innerText = data.plot;
    });

const $like = document.getElementById("like");
const $watched = document.getElementById("watched");
const $watchlist = document.getElementById("watchlist");

$like.addEventListener("click", async (e) => {
    const response = await fetch(`${backend_url}detail/${movie}/like/userlike/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
        },
    });
    if (await response.ok) {
        alert("좋아요를 눌렀습니다.");
    } else if ((await response.status) == 401) {
        alert("로그인 후 사용할 수 있습니다.");
    } else {
        const response = await fetch(`${backend_url}detail/${movie}/like/userlike/${decodeJwt(accessToken).payload.user_id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
        });
        if (await response.ok) {
            alert("좋아요를 취소했습니다.");
        }
    }
});
$watched.addEventListener("click", async (e) => {
    const response = await fetch(`${backend_url}detail/${movie}/watched/userlike/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
        },
    });
    if (await response.ok) {
        alert("본 영화에요 표시했습니다.");
    } else if ((await response.status) == 401) {
        alert("로그인 후 사용할 수 있습니다.");
    } else {
        const response = await fetch(`${backend_url}detail/${movie}/watched/userlike/${decodeJwt(accessToken).payload.user_id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
        });
        if (await response.ok) {
            alert("본 영화에요 표시를 해제했습니다.");
        }
    }
});
$watchlist.addEventListener("click", async (e) => {
    const response = await fetch(`${backend_url}detail/${movie}/watchlist/userlike/`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: "Bearer " + accessToken,
        },
    });
    if (await response.ok) {
        alert("볼 영화에요 표시했습니다");
    } else if ((await response.status) == 401) {
        alert("로그인 후 사용할 수 있습니다.");
    } else {
        const response = await fetch(`${backend_url}detail/${movie}/watchlist/userlike/${decodeJwt(accessToken).payload.user_id}/`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + accessToken,
            },
        });
        if (await response.ok) {
            alert("볼 영화에요 표시를 해제했습니다.");
        }
    }
});

const $onelinecritic_list = document.getElementById("onelinecritic-list");
fetch(`${backend_url}detail/${movie}/onelinecritic/`, {
    method: "GET",
    headers: {
        "Content-Type": "application/json",
    },
})
    .then((res) => res.json())
    .then((datas) => {
        let html = "";
        let option = "";
        let author_content;
        datas.forEach((data) => {
            try {
                const jwt_id = decodeJwt(accessToken).payload.user_id;
                if (data.author.id == jwt_id) {
                    option = `id='author'`;
                    author_content = data.id;
                }
            } catch {}

            html += `
			<div class='onelinecritic' ${option}><div class='onelinecritic-item'><div class='onelinecritic-user cookiestyle-light'>${data.author.username}</div><div class='onelinecritic-content'>${data.content}</div><div class='onelinecritic-starpoint'>${data.starpoint}</div></div></div>
			`;
        });
        $onelinecritic_list.innerHTML = html;
        const $author = document.getElementById("author");
        if ($author != null) {
            const author_menu = document.createElement("div");
            author_menu.id = "author-menu";
            author_menu.innerHTML = `
		<div class='menu'><button class='btn cookiestyle-light' id='edit'>수정</button><button class='btn cookiestyle-light' id='delete'>삭제</button></div>
		`;
            $author.appendChild(author_menu);

            const $edit = document.getElementById("edit");
            const $delete = document.getElementById("delete");

            $edit.addEventListener("click", (e) => {
                try {
                    const $onelinecritic_editform = document.getElementById("edit-area");
                    $onelinecritic_editform.remove();
                } catch {
                    const html = `<form method="post" class="search-area" id="onelinecritic-editform">
							<input
								type="text"
								class="searchbar cookiestyle-light"
								placeholder="이 영화의 한줄평을 수정하세요"
								id="search"
								name="search" />
							<ul class="starpoint-ul-edit">
								<li>
									<input type="radio" id="starpoint1-edit" name="starpoint-edit" value="1" />
									<label for="starpoint1-edit">★</label>
								</li>
								<li>
									<input type="radio" id="starpoint2-edit" name="starpoint-edit" value="2" />
									<label for="starpoint2-edit">★</label>
								</li>
								<li>
									<input type="radio" id="starpoint3-edit" name="starpoint-edit" value="3" />
									<label for="starpoint3-edit">★</label>	
								</li>
								<li>
									<input type="radio" id="starpoint4-edit" name="starpoint-edit" value="4" />
									<label for="starpoint4-edit">★</label>
								</li>
								<li>
									<input type="radio" id="starpoint5-edit" name="starpoint-edit" value="5" />
									<label for="starpoint5-edit">★</label>
								</li>
							</ul>
							<input type="button" class="btn cookiestyle-light" value="입력" id="onelinecritic-editbtn" />
						</form>`;
                    const new_edit = document.createElement("div");
                    new_edit.id = "edit-area";
                    new_edit.innerHTML = html;
                    $author.appendChild(new_edit);
                    const $onelinecritic_editbtn = document.getElementById("onelinecritic-editbtn");
                    $onelinecritic_editbtn.addEventListener("click", async (e) => {
                        e.preventDefault();
                        if (!accessToken) {
                            alert("로그인 후 사용할 수 있습니다.");
                        } else {
                            let is_saveok = true;
                            const content = document.getElementById("search").value;
                            let starpoint;
                            try {
                                starpoint = document.querySelector('input[name="starpoint-edit"]:checked').value;
                                if (!content) {
                                    alert("한 줄 평을 입력하지 않았습니다.");
                                    is_saveok = false;
                                }
                            } catch (error) {
                                alert("별점을 입력하지 않았습니다.");
                                is_saveok = false;
                            }
                            if (is_saveok) {
                                const data = {
                                    starpoint: starpoint,
                                    content: content,
                                };

                                const response = await fetch(`${backend_url}detail/${movie}/onelinecritic/${author_content}/`, {
                                    method: "PATCH",
                                    headers: {
                                        "Content-Type": "application/json",
                                        Authorization: "Bearer " + accessToken,
                                    },
                                    body: JSON.stringify(data),
                                });

                                if (await response.ok) {
                                    location.href = location.href;
                                } else if ((await response.status) == 401) {
                                    alert("로그인 후 사용할 수 있습니다.");
                                } else {
                                    alert("이미 작성된 한 줄 평이 있습니다.");
                                }
                            }
                        }
                    });

                    const starpointInputs = document.querySelectorAll(".starpoint-ul-edit input[type='radio']");
                    const starpointLabels = document.querySelectorAll(".starpoint-ul-edit label");

                    starpointInputs.forEach((input, index) => {
                        input.addEventListener("change", function () {
                            updateStarpointStyle(index + 1);
                        });
                    });

                    function updateStarpointStyle(selectedIndex) {
                        starpointLabels.forEach((label, index) => {
                            if (index < selectedIndex) {
                                label.style.color = "#ffc700"; // 선택된 별표 이전의 별표들에 스타일 적용
                            } else {
                                label.style.color = "#ffefb5"; // 선택된 별표 이후의 별표들에 스타일 적용
                            }
                        });
                    }
                }
            });
            $delete.addEventListener("click", async (e) => {
                if (confirm("한 줄 평을 삭제하시겠습니까?")) {
                    const response = await fetch(`${backend_url}detail/${movie}/onelinecritic/${author_content}/`, {
                        method: "DELETE",
                        headers: {
                            "Content-Type": "application/json",
                            Authorization: "Bearer " + accessToken,
                        },
                    });
                    if (await response.ok) {
                        location.href = location.href;
                    } else {
                        alert("오류가 발생했습니다.");
                    }
                }
            });
        }
    });

const $onelinecritic_btn = document.getElementById("onelinecritic-btn");
$onelinecritic_btn.addEventListener("click", async (e) => {
    e.preventDefault();
    if (!accessToken) {
        alert("로그인 후 사용할 수 있습니다.");
    } else {
        let is_saveok = true;
        const content = document.getElementById("search").value;
        let starpoint;
        try {
            starpoint = document.querySelector('input[name="starpoint"]:checked').value;
            if (!content) {
                alert("한 줄 평을 입력하지 않았습니다.");
                is_saveok = false;
            }
        } catch (error) {
            alert("별점을 입력하지 않았습니다.");
            is_saveok = false;
        }
        if (is_saveok) {
            const data = {
                starpoint: starpoint,
                content: content,
            };

            const response = await fetch(`${backend_url}detail/${movie}/onelinecritic/`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: "Bearer " + accessToken,
                },
                body: JSON.stringify(data),
            });

            if (await response.ok) {
                location.href = location.href;
            } else if ((await response.status) == 401) {
                alert("로그인 후 사용할 수 있습니다.");
            } else {
                alert("이미 작성된 한 줄 평이 있습니다.");
            }
        }
    }
});

document.addEventListener("DOMContentLoaded", function () {
    const starpointInputs = document.querySelectorAll(".starpoint-ul input[type='radio']");
    const starpointLabels = document.querySelectorAll(".starpoint-ul label");

    starpointInputs.forEach((input, index) => {
        input.addEventListener("change", function () {
            updateStarpointStyle(index + 1);
        });
    });

    function updateStarpointStyle(selectedIndex) {
        starpointLabels.forEach((label, index) => {
            if (index < selectedIndex) {
                label.style.color = "#ffc700"; // 선택된 별표 이전의 별표들에 스타일 적용
            } else {
                label.style.color = "#ffefb5"; // 선택된 별표 이후의 별표들에 스타일 적용
            }
        });
    }
});

function decodeJwt(token) {
    // JWT는 세 부분으로 이루어져 있으며, 각 부분은 점('.')으로 구분됩니다.
    const [header, payload, signature] = token.split(".");

    // Base64 디코딩을 위한 함수
    function base64Decode(str) {
        try {
            // URL 및 Base64 문자열을 일반적인 Base64 문자열로 변환
            str = str.replace("-", "+").replace("_", "/");
            // Base64 디코딩
            return decodeURIComponent(
                atob(str)
                    .split("")
                    .map(function (c) {
                        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
                    })
                    .join("")
            );
        } catch (error) {
            return null;
        }
    }

    // 디코딩된 헤더와 페이로드를 반환
    return {
        header: JSON.parse(base64Decode(header)),
        payload: JSON.parse(base64Decode(payload)),
    };
}
