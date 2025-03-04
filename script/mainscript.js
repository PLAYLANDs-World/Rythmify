let playlist = [];
let artistsData = {};
let queue = [];
let touchStartX = 0;
let touchEndX = 0;
const SWIPE_THRESHOLD = 50; // Minimum swipe distance in pixels
let currentIndex = -1;
let isPlaying = false;

const audio = document.getElementById('audio-player');
const progressBar = document.getElementById('progress-bar');
const footerSongImg = document.getElementById("footer-song-img");
const footerSongName = document.getElementById("player-song-name-footer");
const footerArtistName = document.getElementById("player-song-artist-name-footer");
const playPauseButton = document.getElementById("play-pause");
const nextButton = document.getElementById("next");
const mainsongImage = document.getElementById("main-song-Image");
const playlistContainer = document.getElementById('playlist-container');
const musicPlayerFooter = document.getElementById('music-player-footer');
const ptsonginfo = document.getElementsByClassName('pt-song-info');
const songinfoimg = document.getElementsByClassName('song-info-img');
const pusongtitle = document.getElementsByClassName('pu-song-title');
const pusongartist = document.getElementsByClassName('pu-song-artist');
const playerFooter = document.querySelector('.pt-main-player-footer');
const mainMusicPlayer = document.querySelector('.main-music-player');
const closePlayer = document.querySelector('.close-player');
// Add these variables at the top
const mainProgressContainer = document.getElementById('main-progress-container');
const mainProgressBar = document.getElementById('main-progress-bar');
const progressThumb = document.querySelector('.main-progress-thumb');
const currentTimeDisplay = document.querySelector('.current-time');
const durationDisplay = document.querySelector('.duration');
const mainplayerimg = document.querySelector('.main-player-img');
const mainplayersongname = document.querySelector('.main-player-song-name');
const mainplayerartistname = document.querySelector('.main-player-artist-name');
const mainprogressbar = document.querySelector('.main-progress-bar');
const mainPlayPauseButton = document.getElementById('main-play-pause');
const mainPreviousButton = document.getElementById('main-previous');
const mainNextButton = document.getElementById('main-next');
const mainSongAlbumName = document.getElementById('main-song-album-name');
const lyricsContainer = document.getElementById('lyrics');
const mainArtistContName = document.getElementById('main-artist-cont-name');
const mainArtistContImg = document.getElementById('main-artist-cont-img');
let isDragging = false;


footerSongImg.crossOrigin = "Anonymous";
songinfoimg.crossOrigin = "Anonymous";

mainPlayPauseButton.addEventListener('click', togglePlayPause);
mainNextButton.addEventListener('click', playNextSong);
mainPreviousButton.addEventListener('click', playPreviousSong);

function getContrastColor(r, g, b) {
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness >= 128 ? 'black' : 'white';
}

function lightenColorArr(r, g, b, factor = 0.3) {
    const newR = Math.min(255, Math.round(r + (255 - r) * factor));
    const newG = Math.min(255, Math.round(g + (255 - g) * factor));
    const newB = Math.min(255, Math.round(b + (255 - b) * factor));
    return [newR, newG, newB];
}

function darkenColorArr(r, g, b, factor = 0.3) {
    const newR = Math.max(0, Math.round(r * (1 - factor)));
    const newG = Math.max(0, Math.round(g * (1 - factor)));
    const newB = Math.max(0, Math.round(b * (1 - factor)));
    return [newR, newG, newB];
}

function rgbArrayToString(rgbArr) {
    return `rgb(${rgbArr[0]}, ${rgbArr[1]}, ${rgbArr[2]})`;
}

// Fetch both playlist.json and artist.json simultaneously
Promise.all([
    fetch("res/playlist.json").then(response => response.json()),
    fetch("res/artist.json").then(response => response.json())
])
    .then(([playlistData, artistData]) => {
        playlist = playlistData;
        // Convert artistData array to an object keyed by artist_id for fast lookup
        artistData.forEach(artist => {
            artistsData[artist.artist_id] = artist;
        });
        createPlaylist();
        // Load the first song (or whichever index you want)
        loadSong(-1);
    })
    .catch(error => console.error("Error loading data:", error));


// Load a song into the player
function loadSong(index) {
    if (index < 0 || index >= playlist.length) return;

    currentSongIndex = index;
    const track = playlist[index];
    footerSongImg.src = track.img;
    mainplayerimg.src = track.img;
    if (artistsData && artistsData[track.artist_id] && artistsData[track.artist_id].artist_img) {
        mainArtistContImg.src = artistsData[track.artist_id].artist_img;
    } else {
        mainArtistContImg.src = track.artist_img;
    }
    footerSongName.textContent = track.song;
    mainplayersongname.textContent = track.song;
    footerArtistName.textContent = track.all_artists.join(", ");
    mainplayerartistname.textContent = track.all_artists.join(", ");
    mainArtistContName.textContent = track.artist;
    mainSongAlbumName.textContent = track.album;
    musicPlayerFooter.classList.add('visible');
    audio.src = track.src;
    playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
        </svg>`;
    mainPlayPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
        </svg>`;
    audio.load();

    // Wait for the image to load before extracting the color
    footerSongImg.onload = function () {
        const colorThief = new ColorThief();
        const dominantColor = colorThief.getColor(footerSongImg);
        const rgbString = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.65)`;
        const rgbStringMP = `rgb(${dominantColor[0]}, ${dominantColor[1]}, ${dominantColor[2]}, 0.85)`;
        const rgbStringDark = `rgb(0, 0, 0, 0.2)`;

        musicPlayerFooter.style.backgroundColor = rgbString;
        mainMusicPlayer.style.backgroundColor = rgbStringMP;
        lyricsContainer.style.backgroundColor = rgbStringDark;





        const contrastTextColor = getContrastColor(dominantColor[0], dominantColor[1], dominantColor[2]);
        musicPlayerFooter.style.color = contrastTextColor;
        mainMusicPlayer.style.color = contrastTextColor;

        footerSongName.style.color = contrastTextColor;
        mainplayersongname.style.color = contrastTextColor;
        footerArtistName.style.color = contrastTextColor;
        mainplayerartistname.style.color = contrastTextColor;
        const svgIcons = musicPlayerFooter.querySelectorAll('svg');
        const MainsvgIcons = mainMusicPlayer.querySelectorAll('svg');
        svgIcons.forEach(svg => svg.style.fill = contrastTextColor);
        MainsvgIcons.forEach(svg => svg.style.fill = contrastTextColor);
        progressBar.style.backgroundColor = contrastTextColor;
        mainprogressbar.style.backgroundColor = contrastTextColor;
        mainPlayPauseButton.style.color = contrastTextColor;
        mainArtistContName.style.text = contrastTextColor;



        const lighterArr = lightenColorArr(dominantColor[0], dominantColor[1], dominantColor[2], 0.3);
        let progressColor = lighterArr;
        const brightnessLighter = (lighterArr[0] * 299 + lighterArr[1] * 587 + lighterArr[2] * 114) / 1000;
        const BRIGHTNESS_THRESHOLD = 230;

        if (brightnessLighter > BRIGHTNESS_THRESHOLD) {
            progressColor = darkenColorArr(dominantColor[0], dominantColor[1], dominantColor[2], 0.3);
        }

        const progressRgbString = rgbArrayToString(progressColor);
        const progressContainer = document.querySelector('.progress');
        if (progressContainer) {
            progressContainer.style.backgroundColor = progressRgbString;
            mainPlayPauseButton.style.backgroundColor = progressRgbString;
        }
        killAudiobook();
    };

    lyricsContainer.innerHTML = '';

    // Fetch and display lyrics
    fetch("res/lyrics.json")
        .then(response => response.json())
        .then(lyricsData => {
            const songLyrics = lyricsData.find(l => l.id === track.id)?.lyrics ||
                lyricsData.find(l => l.id === 0)?.lyrics || []; // Default to ID 1 lyrics
            songLyrics.forEach(line => {
                const p = document.createElement('p');
                p.textContent = line.text;
                p.dataset.time = line.time;
                lyricsContainer.appendChild(p);
            });

            // 🔥 FIXED: Attach Click Handlers AFTER Lyrics Are Added
            document.querySelectorAll('#lyrics p').forEach(line => {
                line.addEventListener('click', function () {
                    const time = parseFloat(this.dataset.time);
                    if (!isNaN(time)) {
                        audio.currentTime = time;
                        if (audio.paused)
                            audio.play();
                        playPauseButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
                        </svg>`;
                        mainPlayPauseButton.innerHTML = `
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
                        </svg>`;
                    }
                });
            });

        })
        .catch(error => console.error("Error loading lyrics:", error));



    // Sync lyrics with audio
    let isUserScrollingLyrics = false;
    let scrollTimeout;
    let lastActiveIndex = -1;

    // Detect manual scrolling inside lyricsContainer (only on this container)
    lyricsContainer.addEventListener('wheel', () => {
        isUserScrollingLyrics = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrollingLyrics = false;
        }, 3000);
    });

    lyricsContainer.addEventListener('touchmove', () => {
        isUserScrollingLyrics = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isUserScrollingLyrics = false;
        }, 3000);
    });

    audio.addEventListener('timeupdate', () => {
        // Only update if the user is NOT manually scrolling the lyricsContainer
        if (isUserScrollingLyrics) return;

        const currentTime = audio.currentTime;
        const lines = Array.from(lyricsContainer.getElementsByTagName('p'));
        let newActiveIndex = -1;

        // Find the last lyric whose time is less than or equal to currentTime
        for (let i = 0; i < lines.length; i++) {
            const lineTime = parseFloat(lines[i].dataset.time);
            if (currentTime >= lineTime) {
                newActiveIndex = i;
            } else {
                break;
            }
        }

        // Only update if we found a new active lyric
        if (newActiveIndex !== -1 && newActiveIndex !== lastActiveIndex) {
            // Remove active class from the previous line, if any
            if (lastActiveIndex !== -1) {
                lines[lastActiveIndex].classList.remove('active');
            }
            // Add active class to the new line
            lines[newActiveIndex].classList.add('active');
            lastActiveIndex = newActiveIndex;

            // Compute the scroll adjustment using getBoundingClientRect
            const containerRect = lyricsContainer.getBoundingClientRect();
            const activeRect = lines[newActiveIndex].getBoundingClientRect();

            // We want the active line to appear as the second line from the top.
            // Here, we use the active line’s height as the offset.
            const offset = activeRect.height;
            // Calculate how far the active line is from the top of the container,
            // then adjust by the offset so it appears as the second line.
            const scrollDiff = activeRect.top - containerRect.top - offset;

            lyricsContainer.scrollBy({
                top: scrollDiff,
                behavior: 'smooth'
            });
        }
    });
}



// Add a click event listener for the Instagram icon
document.getElementById('instagramIcon').addEventListener('click', function () {
    // Create a popup message element
    const popup = document.createElement('div');
    popup.className = 'redirect-popup';
    popup.textContent = 'Redirecting to Instagram...';

    // Inline styles for the popup (or add these to your CSS)
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.width = '250px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.backdropFilter = 'blur(20px)';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';
    popup.style.padding = '10px';
    popup.style.borderRadius = '50px';
    popup.style.zIndex = '6000';

    // Append the popup to the body
    document.body.appendChild(popup);

    // After 2 seconds, remove the popup and open the Instagram URL in a new tab
    setTimeout(function () {
        // Remove the popup
        document.body.removeChild(popup);

        // Retrieve the current track using the global index
        const currentTrack = playlist[currentSongIndex];
        if (currentTrack) {
            let instagramUrl = '';

            // Attempt to use the artist.json data via artist_id
            if (artistsData && artistsData[currentTrack.artist_id] && artistsData[currentTrack.artist_id].instagram_url) {
                instagramUrl = artistsData[currentTrack.artist_id].instagram_url;
            } else if (currentTrack.instagram_url) {
                // Fallback to the track's own instagram_url if artist data is unavailable
                instagramUrl = currentTrack.instagram_url;
            }

            if (instagramUrl) {
                window.open(instagramUrl, '_blank');
            } else {
                console.error('Instagram URL not found for the current track or artist.');
            }
        } else {
            console.error('Current track not found.');
        }
    }, 2000);
});


document.getElementById('facebookIcon').addEventListener('click', function () {
    // Create a popup message element
    const popup = document.createElement('div');
    popup.className = 'redirect-popup';
    popup.textContent = 'Redirecting to Facebook...';

    // Inline styles for the popup (or add these to your CSS file)
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.width = '250px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.backdropFilter = 'blur(20px)';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';
    popup.style.padding = '10px';
    popup.style.borderRadius = '50px';
    popup.style.zIndex = '6000';

    // Append the popup to the body
    document.body.appendChild(popup);

    // After 2 seconds, remove the popup and open the Facebook URL in a new tab
    setTimeout(function () {
        // Remove the popup
        document.body.removeChild(popup);

        // Retrieve the current track using the global index
        const currentTrack = playlist[currentSongIndex];
        if (currentTrack) {
            let facebookUrl = '';

            // Check if artist data contains a facebook_url for the current track's artist
            if (artistsData && artistsData[currentTrack.artist_id] && artistsData[currentTrack.artist_id].facebook_url) {
                facebookUrl = artistsData[currentTrack.artist_id].facebook_url;
            } else if (currentTrack.facebook_url) {
                // Fallback to the track's own facebook_url
                facebookUrl = currentTrack.facebook_url;
            }

            if (facebookUrl) {
                window.open(facebookUrl, '_blank');
            } else {
                console.error('Facebook URL not found for the current track or artist.');
            }
        } else {
            console.error('Current track not found.');
        }
    }, 2000);
});


document.getElementById('xIcon').addEventListener('click', function () {
    // Create a popup message element
    const popup = document.createElement('div');
    popup.className = 'redirect-popup';
    popup.textContent = 'Redirecting to X...';

    // Inline styles for the popup (or add these to your CSS file)
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.width = '250px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.backdropFilter = 'blur(20px)';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';
    popup.style.padding = '10px';
    popup.style.borderRadius = '50px';
    popup.style.zIndex = '6000';

    // Append the popup to the body
    document.body.appendChild(popup);

    // After 2 seconds, remove the popup and open the X (Twitter) URL in a new tab
    setTimeout(function () {
        // Remove the popup
        document.body.removeChild(popup);

        // Retrieve the current track from the playlist using the global index
        const currentTrack = playlist[currentSongIndex];
        if (currentTrack) {
            let twitterUrl = '';

            // Check if the artist.json data has a twitter_url for the current track's artist
            if (
                artistsData &&
                artistsData[currentTrack.artist_id] &&
                artistsData[currentTrack.artist_id].twitter_url
            ) {
                twitterUrl = artistsData[currentTrack.artist_id].twitter_url;
            } else if (currentTrack.twitter_url) {
                // Fallback to the track's own twitter_url if artist data is unavailable
                twitterUrl = currentTrack.twitter_url;
            }

            if (twitterUrl) {
                window.open(twitterUrl, '_blank');
            } else {
                console.error('X URL not found for the current track or artist.');
            }
        } else {
            console.error('Current track not found.');
        }
    }, 2000);
});


document.getElementById('spoIcon').addEventListener('click', function () {
    // Create a popup message element
    const popup = document.createElement('div');
    popup.className = 'redirect-popup';
    popup.textContent = 'Redirecting to Spotify...';

    // Inline styles for the popup (or add these to your CSS file)
    popup.style.position = 'fixed';
    popup.style.bottom = '20px';
    popup.style.left = '50%';
    popup.style.width = '250px';
    popup.style.transform = 'translateX(-50%)';
    popup.style.background = 'rgba(0, 0, 0, 0.5)';
    popup.style.backdropFilter = 'blur(20px)';
    popup.style.textAlign = 'center';
    popup.style.color = '#fff';
    popup.style.padding = '10px';
    popup.style.borderRadius = '50px';
    popup.style.zIndex = '6000';

    // Append the popup to the body
    document.body.appendChild(popup);

    // After 2 seconds, remove the popup and open the Spotify URL in a new tab
    setTimeout(function () {
        // Remove the popup
        document.body.removeChild(popup);

        // Retrieve the current track from the playlist using the global index
        const currentTrack = playlist[currentSongIndex];
        if (currentTrack) {
            let spotifyUrl = '';

            // Check if artist.json data contains a spotify_artist_url for the current track's artist
            if (
                artistsData &&
                artistsData[currentTrack.artist_id] &&
                artistsData[currentTrack.artist_id].spotify_artist_url
            ) {
                spotifyUrl = artistsData[currentTrack.artist_id].spotify_artist_url;
            } else if (currentTrack.spotify_artist_url) {
                // Fallback to the track's own spotify_artist_url if artist data is unavailable
                spotifyUrl = currentTrack.spotify_artist_url;
            }

            if (spotifyUrl) {
                window.open(spotifyUrl, '_blank');
            } else {
                console.error('Spotify URL not found for the current track or artist.');
            }
        } else {
            console.error('Current track not found.');
        }
    }, 2000);
});



// Play or pause the song
function togglePlayPause() {
    if (isPlaying) {
        audio.pause();
        isPlaying = false;
    } else {
        audio.play().catch(error => {
            console.error('Play failed:', error);
            return;
        });
        isPlaying = true;
    }

    // Update both buttons using predefined SVGs
    playPauseButton.innerHTML = isPlaying ? `
                        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
                            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                            <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
                        </svg>` : `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
        </svg>`;
    mainPlayPauseButton.innerHTML = isPlaying ? pauseIconSVG : playIconSVG;

    // Update card highlighting
    const currentCard = document.querySelector(`[data-index="${currentIndexGlobal}"]`);
    if (currentCard) {
        currentCard.classList.toggle('now-playing', isPlaying);
    }
}

// Play the next song
function playNextSong() {
    if (queue.length > 0) {
        // Play the next song from the queue.
        const nextTrack = queue.shift(); // Remove the first song from the queue
        currentIndex = playlist.indexOf(nextTrack); // Get its original index
        loadSong(currentIndex);
    } else {
        // Convert currentIndex (original order) to display order.
        const currentDisplayIndex = playlist.length - 1 - currentIndex;
        // Get the next display index (with wrap-around).
        const nextDisplayIndex = (currentDisplayIndex + 1) % playlist.length;
        // Convert back to the original index.
        const nextOriginalIndex = playlist.length - 1 - nextDisplayIndex;
        currentIndex = nextOriginalIndex;
        loadSong(currentIndex);
    }

    // Update UI and play/pause state.
    if (isPlaying) {
        audio.play();
        isPlaying = true;
        playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
        </svg>`;
        mainPlayPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
            <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
        </svg>`;
    } else {
        audio.pause();
        isPlaying = false;
        playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
        </svg>`;
        mainPlayPauseButton.innerHTML = `        
        <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 17.259V6.741a1 1 0 0 1 1.504-.864l9.015 5.26a1 1 0 0 1 0 1.727l-9.015 5.259A1 1 0 0 1 7 17.259Z"></path>
        </svg>`;
    }
}

// Add SVG constants
const playIconSVG = `        
        <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 17.259V6.741a1 1 0 0 1 1.504-.864l9.015 5.26a1 1 0 0 1 0 1.727l-9.015 5.259A1 1 0 0 1 7 17.259Z"></path>
        </svg>`;

const pauseIconSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
        <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
    </svg>`;





// Create playlist UI
function createPlaylist() {
    // Clear the container before populating
    playlistContainer.innerHTML = '';

    // Create a reversed copy so the last song appears first
    const reversedPlaylist = playlist.slice().reverse();
    const itemsPerPage = 10;
    let currentIndex = 0;

    function loadItems() {
        // Get the next set of 10 items
        const items = reversedPlaylist.slice(currentIndex, currentIndex + itemsPerPage);
        items.forEach((track, localIndex) => {
            // overallIndex represents the current position in the reversed array
            const overallIndex = currentIndex + localIndex;
            const songItem = document.createElement('div');
            songItem.classList.add('song-item');
            songItem.innerHTML = `
          <img src="${track.img}" alt="Song Image">
          <div class="song-info">
            <span class="song-title">${track.song}</span>
            <span class="song-artist">${track.artist}</span>
          </div>
          <div class="three-dots">&#8942;</div>
        `;

            // Calculate the original index: originalIndex = (playlist.length - 1) - overallIndex
            const originalIndex = playlist.length - 1 - overallIndex;

            // Click event to play the song using the original index
            songItem.addEventListener('click', () => {
                currentIndexGlobal = originalIndex;
                loadSong(originalIndex);
                audio.play();
                isPlaying = true;
            });

            // Click event for the three-dots menu to open a popup
            const threeDots = songItem.querySelector('.three-dots');
            threeDots.addEventListener('click', (e) => {
                e.stopPropagation();
                openPopup(track);
            });

            // Hover events to handle border styling on the previous sibling
            songItem.addEventListener('mouseenter', () => {
                if (songItem.previousElementSibling) {
                    songItem.previousElementSibling.classList.add('remove-border-bottom');
                }
            });
            songItem.addEventListener('mouseleave', () => {
                if (songItem.previousElementSibling) {
                    songItem.previousElementSibling.classList.remove('remove-border-bottom');
                }
            });

            // Append the song item to the playlist container
            playlistContainer.appendChild(songItem);
        });

        // Update the current index
        currentIndex += items.length;

        // Hide the "Load More" button if no more items remain
        const loadMoreButton = document.getElementById('playlistLoadMoreButton');
        if (currentIndex >= reversedPlaylist.length) {
            loadMoreButton.style.display = 'none';
        }
    }

    // Initial load of 10 items
    loadItems();

    // Add event listener to the "Load More" button
    const loadMoreButton = document.getElementById('playlistLoadMoreButton');
    loadMoreButton.addEventListener('click', loadItems);
}

// Update progress bar
// Update the updateProgressBar function
function updateProgressBar() {
    if (audio.duration) {
        const progress = (audio.currentTime / audio.duration) * 100;

        // Update both progress bars
        document.getElementById('progress-bar').style.width = `${progress}%`;
        mainProgressBar.style.width = `${progress}%`;

        // Update time displays
        currentTimeDisplay.textContent = formatTime(audio.currentTime);
        if (!isNaN(audio.duration)) {
            durationDisplay.textContent = formatTime(audio.duration);
        }
    }
}

// Add time formatting
function formatTime(seconds) {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

// Main progress bar interactions
mainProgressContainer.addEventListener('click', (e) => {
    const rect = mainProgressContainer.getBoundingClientRect();
    const x = e.clientX - rect.left;
    audio.currentTime = (x / rect.width) * audio.duration;
});

// Drag functionality
mainProgressContainer.addEventListener('mousedown', () => isDragging = true);
document.addEventListener('mouseup', () => isDragging = false);
document.addEventListener('mousemove', (e) => {
    if (isDragging) handleProgressMove(e.clientX);
});

// Touch support
mainProgressContainer.addEventListener('touchstart', () => isDragging = true);
document.addEventListener('touchend', () => isDragging = false);
document.addEventListener('touchmove', (e) => {
    if (isDragging) handleProgressMove(e.touches[0].clientX);
});

function handleProgressMove(clientX) {
    const rect = mainProgressContainer.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    audio.currentTime = (x / rect.width) * audio.duration;
}

// Seek through the progress bar
const progressContainer = document.getElementById('progress-container');
progressContainer.addEventListener('click', (e) => {
    const containerWidth = progressContainer.offsetWidth;
    const clickPosition = e.offsetX;
    const newTime = (clickPosition / containerWidth) * audio.duration;
    audio.currentTime = newTime;
});

// Event listeners
audio.addEventListener("timeupdate", updateProgressBar);
audio.addEventListener("ended", playNextSong);
playPauseButton.addEventListener("click", togglePlayPause);
nextButton.addEventListener("click", playNextSong);

let touchStartY = 0;

function openPopup(track) {
    const overlay = document.createElement('div');
    overlay.classList.add('overlay');
    document.body.appendChild(overlay);

    const popup = document.createElement('div');
    popup.classList.add('popup');
    popup.innerHTML = `
        <div class="pt-main-pt-song-info-cont"><div class="main-pt-song-info-cont"></div></div>
        <div class="main-pt-song-info">
            <div class="pt-song-info">
                <img class="song-info-img" src="${track.img}" alt="Song Image">
                <div class="song-details">
                        <span class="pu-song-title">${track.song}</span>
                        <span class="pu-song-artist">${track.artist}</span>
                </div>
            </div>
        </div>
        <div class="options">
            <button id="pt-add-to-queue" onclick="addToQueue('${track.song}')"><svg id="Add-to-queue" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6"><path d="M5.625 3.75a2.625 2.625 0 1 0 0 5.25h12.75a2.625 2.625 0 0 0 0-5.25H5.625ZM3.75 11.25a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75ZM3 15.75a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75ZM3.75 18.75a.75.75 0 0 0 0 1.5h16.5a.75.75 0 0 0 0-1.5H3.75Z" /></svg>Add to Queue</button>
            <button id="pt-download-this-song" onclick="downloadSong('${track.song}')"><svg id="download-this-song" xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-cloud-download-fill" viewBox="0 0 16 16"><path fill-rule="evenodd" d="M8 0a5.53 5.53 0 0 0-3.594 1.342c-.766.66-1.321 1.52-1.464 2.383C1.266 4.095 0 5.555 0 7.318 0 9.366 1.708 11 3.781 11H7.5V5.5a.5.5 0 0 1 1 0V11h4.188C14.502 11 16 9.57 16 7.773c0-1.636-1.242-2.969-2.834-3.194C12.923 1.999 10.69 0 8 0m-.354 15.854a.5.5 0 0 0 .708 0l3-3a.5.5 0 0 0-.708-.708L8.5 14.293V11h-1v3.293l-2.146-2.147a.5.5 0 0 0-.708.708z"/></svg>Download</button>
            <button id="pt-close-bt" onclick="closePopup()">
                <svg id="close-bt" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#fff" class="size-6">
                    <path fill-rule="evenodd"
                        d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z"
                        clip-rule="evenodd" />
                </svg>Close
            </button>
        </div>
    `;

    // Add touch event listeners for swipe-down gesture
    popup.addEventListener('touchstart', handleTouchStart, false);
    popup.addEventListener('touchmove', handleTouchMove, false);
    popup.addEventListener('touchend', handleTouchEnd, false);

    document.body.appendChild(popup);
    setTimeout(() => {
        popup.classList.add('active');
        overlay.classList.add('active');
    }, 10);

    // Close the popup when clicking outside of it
    overlay.addEventListener('click', closePopup);
}

// Function to handle touch start
function handleTouchStart(event) {
    touchStartY = event.touches[0].clientY;
}

// Function to handle touch move
function handleTouchMove(event) {
    if (!touchStartY) return;

    const touchEndY = event.touches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    // If the user swipes down (deltaY is positive), move the popup down
    if (deltaY > 0) {
        event.currentTarget.style.transform = `translateY(${deltaY}px)`;
    }
}

// Function to handle touch end
function handleTouchEnd(event) {
    if (!touchStartY) return;

    const touchEndY = event.changedTouches[0].clientY;
    const deltaY = touchEndY - touchStartY;

    // If the user swipes down significantly, close the popup
    if (deltaY > 50) {
        closePopup();
    } else {
        // Reset the popup position if the swipe is not significant
        event.currentTarget.style.transform = 'translateY(0)';
    }

    touchStartY = 0;
}

// Function to close the popup
function closePopup() {
    const popup = document.querySelector('.popup');
    const overlay = document.querySelector('.overlay');
    if (popup) {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
    }
    if (overlay) {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300); // Adjust the timeout to match your transition duration
    }
}

// Example functions for the options
// Add this CSS for the notification
const style = document.createElement('style');
style.textContent = `
.queue-notification {
    position: fixed;
    bottom: 8%;
    left: 50%;
    transform: translateX(-50%);
    background:rgba(215, 215, 215, 0.20);
    backdrop-filter: blur(20px);
    color: white;
    padding: 12px 24px;
    border-radius: 25px;
    font-size: 14px;
    display: flex;
    align-items: center;
    gap: 8px;
    opacity: 0;
    transition: opacity 0.3s ease;
    z-index: 6000;
}
.queue-notification.active {
    opacity: 1;
}
`;
document.head.appendChild(style);

function addToQueue(songName) {
    const track = playlist.find(track => track.song === songName);
    if (track) {
        queue.push(track);
        showQueueNotification(`Added to Your Queue`);
    }
    closePopup();
}

function showQueueNotification(message) {
    const existingNotification = document.querySelector('.queue-notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    const notification = document.createElement('div');
    notification.className = 'queue-notification';
    notification.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
        </svg>
        ${message}
    `;

    document.body.appendChild(notification);

    // Trigger the fade-in animation
    setTimeout(() => notification.classList.add('active'), 10);

    // Remove notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('active');
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

function likeSong(songName) {
    alert(`Liked "${songName}"`);
    closePopup();
}

function downloadSong(songName) {
    alert(`Downloading "${songName}"`);
    closePopup();
}

// Close popup when clicking outside
document.addEventListener('click', (e) => {
    const popup = document.querySelector('.popup');
    if (popup && !popup.contains(e.target)) {
        closePopup();
    }
});

// Close popup when pressing the escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closePopup();
    }
});

//disable pinch zoom
document.addEventListener('touchstart', function (event) {
    if (event.touches.length > 1) {
        // If more than one finger is detected, prevent default behavior
        event.preventDefault();
    }
}, { passive: false });

document.addEventListener('touchmove', function (event) {
    if (event.touches.length > 1) {
        // If more than one finger is detected, prevent default behavior
        event.preventDefault();
    }
}, { passive: false });


document.getElementById("menuButton").addEventListener("click", function () {
    document.getElementById("sideMenu").classList.add("open");
});

document.getElementById("closeButton").addEventListener("click", function () {
    document.getElementById("sideMenu").classList.remove("open");
});

playerFooter.addEventListener('touchstart', handleTouchStartfooter, false);
playerFooter.addEventListener('touchmove', handleTouchMovefooter, false);
playerFooter.addEventListener('touchend', handleTouchEndfooter, false);

function handleTouchStartfooter(event) {
    touchStartX = event.touches[0].clientX;
    touchEndX = touchStartX; // Initialize touchEndX
}

function handleTouchMovefooter(event) {
    touchEndX = event.touches[0].clientX;
}

function handleTouchEndfooter() {
    const deltaX = touchEndX - touchStartX;

    // Check if swipe distance meets threshold
    if (Math.abs(deltaX) > SWIPE_THRESHOLD) {
        if (deltaX > 0) { // Swipe right
            playPreviousSong();
        } else { // Swipe left
            playNextSong();
        }
    }

    // Reset values
    touchStartX = 0;
    touchEndX = 0;
}

// Add this new function for previous song
function playPreviousSong() {
    // Convert current original index to display index:
    // displayIndex = playlist.length - 1 - currentIndex
    const currentDisplayIndex = playlist.length - 1 - currentIndex;

    // Compute previous display index (with wrap-around):
    // Subtract one, and use modulo to handle the first element.
    const previousDisplayIndex = (currentDisplayIndex - 1 + playlist.length) % playlist.length;

    // Convert the display index back to the original index:
    // originalIndex = playlist.length - 1 - displayIndex
    const previousOriginalIndex = playlist.length - 1 - previousDisplayIndex;

    // Update currentIndex and load the song.
    currentIndex = previousOriginalIndex;
    loadSong(currentIndex);

    // Update audio and UI based on play state.
    if (isPlaying) {
        audio.play();
        isPlaying = true;
        playPauseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
            </svg>`;
        mainPlayPauseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
                <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
            </svg>`;
    } else {
        audio.pause();
        isPlaying = false;
        playPauseButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
                <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
            </svg>`;
        mainPlayPauseButton.innerHTML = `
            <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
                <path fill="currentColor" d="M7 17.259V6.741a1 1 0 0 1 1.504-.864l9.015 5.26a1 1 0 0 1 0 1.727l-9.015 5.259A1 1 0 0 1 7 17.259Z"></path>
            </svg>`;
    }
}

// Open full player
musicPlayerFooter.addEventListener('click', (e) => {
    // Only open if click is not on controls or progress
    if (!e.target.closest('#play-pause') && !e.target.closest('#pt-progress-container') && !e.target.closest('#next')) {
        mainMusicPlayer.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
});

// Add stopPropagation to control buttons
playPauseButton.addEventListener('click', e => e.stopPropagation());
nextButton.addEventListener('click', e => e.stopPropagation());

// Close full player
closePlayer.addEventListener('click', () => {
    mainMusicPlayer.classList.remove('active');
    document.body.style.overflow = 'auto';
});







const accordionHeader = document.querySelector('.accordion-header');
const accordion = document.querySelector('.accordion');

accordionHeader.addEventListener('click', () => {
    accordion.classList.toggle('active');

    if (!accordion.classList.contains('active')) {
        const items = document.querySelectorAll('.link-item');
        items.forEach(item => {
            item.addEventListener('transitionend', () => {
                item.style.opacity = '';
                item.style.transform = '';
            }, { once: true });
        });
    }
});

// Prevent accordion from closing when clicking menu items
document.querySelectorAll('.link-item a').forEach(link => {
    link.addEventListener('click', (e) => {
        e.stopPropagation(); // Prevent event from bubbling up to header
    });
});


function killMainSongs() {
    audio.pause();
    isPlaying = false;
    playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
        </svg>`;
    mainPlayPauseButton.innerHTML = `
        <svg id="play-icon" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
            <path fill="currentColor" d="M7 17.259V6.741a1 1 0 0 1 1.504-.864l9.015 5.26a1 1 0 0 1 0 1.727l-9.015 5.259A1 1 0 0 1 7 17.259Z"></path>
        </svg>`;
    musicPlayerFooter.classList.remove('visible');
}