const app = (function () {
  const addForm = document.querySelector(".jsAddForm");
  const addInput = document.querySelector("#addInput");
  let videoArea = document.querySelector(".jsVideoArea");
  let playlistArea = document.querySelector(".jsPlaylistArea");
  let userData = {
    videosArr: [],
  };
  let isDuplicate = false;

  if (!localStorage.hasOwnProperty("vydlistApp")) {
    updateLocalStorage();
  } else {
    userData = JSON.parse(localStorage.getItem("vydlistApp"));
  }

  function updateLocalStorage() {
    localStorage.setItem("vydlistApp", JSON.stringify(userData));
    events.emit("userDataChange", userData);
  }

  function createVideoElement(videoInfo) {
    console.log("createVideoElement");
    if (videoInfo.site === "youtube") {
      return `<iframe class="playlist-iframe" src="https://www.youtube.com/embed/${videoInfo.id}" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    }

    if (videoInfo.site === "vimeo") {
      return `<iframe src="https://player.vimeo.com/video/${videoInfo.id}" class="playlist-iframe" frameborder="0" allow="autoplay; fullscreen; picture-in-picture" allowfullscreen></iframe>`;
    }
  }

  function selectActiveVideo(e) {
    const selectedVideo = e.currentTarget;
    const el = createVideoElement({
      id: selectedVideo.dataset.id,
      site: selectedVideo.dataset.site,
    });

    videoArea.innerHTML = el;
  }

  function createPlaylistElement(videoInfo) {
    let videoEl = document.createElement("div");
    videoEl.classList.add("playlist-item");
    videoEl.setAttribute("data-id", videoInfo.id);
    videoEl.setAttribute("data-site", videoInfo.site);
    videoEl.setAttribute("data-link", videoInfo.link);

    videoEl.innerHTML = `<div class="playlist-item-overlay"></div>${createVideoElement(
      videoInfo
    )};`;
    videoEl.addEventListener("click", selectActiveVideo);

    return videoEl;
  }

  function createVideoListItem(videoLink) {
    let videoInfo = {
      id: "",
      img: "",
      site: "",
      link: "",
    };

    if (videoLink.includes("youtube")) {
      videoInfo = {
        id: videoLink.slice(videoLink.indexOf("v=") + 2),
        img: `https://i.ytimg.com/vi_webp/${videoLink.slice(
          videoLink.indexOf("v=") + 2
        )}/sddefault.webp`,
        site: "youtube",
        link: videoLink,
      };
    }

    if (videoLink.includes("vimeo")) {
      videoInfo = {
        id: videoLink.slice(videoLink.indexOf(".com/") + 5),
        img: "",
        site: "vimeo",
        link: videoLink,
      };
    }

    userData.videosArr.forEach((item) => {
      if (item.id === videoInfo.id && item.site === videoInfo.site) {
        isDuplicate = true;
      }
    });

    if (isDuplicate) {
      return;
    }

    let videoEl = createPlaylistElement(videoInfo);

    userData = { ...userData, videosArr: [...userData.videosArr, videoInfo] };

    updateLocalStorage();

    return videoEl;
  }

  function addVideo(e) {
    e.preventDefault();
    if (!addInput.value.replace(/ /g, "")) {
      return;
    }

    const videoListItem = createVideoListItem(addInput.value);
    addInput.value = "";
    if (!videoListItem) {
      alert("This video is already in your playlist");
      return;
    }

    playlistArea.appendChild(videoListItem);
  }

  function populatePlaylist() {
    let htmlToAppend = document.createDocumentFragment();

    if (userData.videosArr.length > 0) {
      userData.videosArr.forEach((item, index) => {
        htmlToAppend.appendChild(createPlaylistElement(item));
      });
    } else {
      htmlToAppend += `<p>no videos</p>`;
    }

    playlistArea.appendChild(htmlToAppend);
  }

  addForm.addEventListener("submit", addVideo);

  populatePlaylist();
})();
