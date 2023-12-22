import { backend } from "/script/url.js";
// import { getToken } from "/script/token.js";

const backend_url = backend + `movieinfo/detail/`;
const frontend_url = new URLSearchParams(window.location.search);
const movie = parseInt(frontend_url.get("movie"));
fetch(`${backend_url}${movie}/`, {
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
		if ((data.release_date = !"1930-01-01")) {
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
