document.getElementById("search-button").addEventListener("click", function () {
    document.getElementById("search-window").classList.add("show");
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';
});

document.getElementById("close-search-window").addEventListener("click", function () {
    document.getElementById("search-window").classList.remove("show");
    document.body.classList.remove('body-lock');
    document.body.style.touchAction = '';

    // Restore scroll position
    window.scrollTo(0, scrollPosition);
    document.body.style.top = '';
});



let currentIndexGlobal = 0;
let globalPlaylist = [];

async function CreateSearchMusicPlaylist() {
    try {
        const response = await fetch('res/playlist.json');
        if (!response.ok) throw new Error('Network response was not ok');
        const playlist = await response.json();
        globalPlaylist = playlist.slice(); // Reverse the playlist

        // Display the first 10 items
        displayPlaylist(globalPlaylist);
    } catch (error) {
        console.error('Error loading playlist:', error);
    }
}

function displayPlaylist(tracks) {
    const container = document.getElementById('search-playlist-container');
    container.innerHTML = ''; // Clear previous content

    // Limit to 10 items
    const limitedPlaylist = tracks.slice(0, 10);

    limitedPlaylist.forEach((track) => {
        const card = document.createElement('div');
        card.className = 'music-card';
        card.dataset.songId = track.id; // Store the UNIQUE ID from JSON

        card.innerHTML = `
            <img src="${track.img}" alt="${track.song}" class="music-card-img">
            <div class="music-card-content">
                <h3 class="music-card-title">${track.song}</h3>
                <p class="music-card-artist">${track.artist}</p>
                <p class="music-card-album">${track.album}</p>
                <div class="music-card-links">
                    <a href="${track.spotify_track_url}" target="_blank" class="music-card-link" onclick="event.stopPropagation()">
                        <svg class="spotify-icon-search" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-spotify" viewBox="0 0 16 16">
                            <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0m3.669 11.538a.5.5 0 0 1-.686.165c-1.879-1.147-4.243-1.407-7.028-.77a.499.499 0 0 1-.222-.973c3.048-.696 5.662-.397 7.77.892a.5.5 0 0 1 .166.686m.979-2.178a.624.624 0 0 1-.858.205c-2.15-1.321-5.428-1.704-7.972-.932a.625.625 0 0 1-.362-1.194c2.905-.881 6.517-.454 8.986 1.063a.624.624 0 0 1 .206.858m.084-2.268C10.154 5.56 5.9 5.419 3.438 6.166a.748.748 0 1 1-.434-1.432c2.825-.857 7.523-.692 10.492 1.07a.747.747 0 1 1-.764 1.288"/>
                        </svg>
                    </a>
                    <a href="${track.song_youtube_video_url}" target="_blank" class="music-card-link" onclick="event.stopPropagation()">
                        <svg class="youtube-icon-search" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-youtube" viewBox="0 0 16 16">
                            <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"/>
                        </svg>
                    </a>
                </div>
            </div>
        `;

        // Click listener to play the song from globalPlaylist
        card.addEventListener('click', () => {
            const targetIndex = globalPlaylist.findIndex(song => song.id === track.id);

            if (targetIndex !== -1) {
                // Pause if clicking the currently playing song
                if (currentIndexGlobal === targetIndex && isPlaying) {
                    togglePlayPause();
                    return;
                }

                // Load new song
                currentIndexGlobal = targetIndex;
                loadSong(currentIndexGlobal);

                // Force play state and update buttons
                audio.play().then(() => {
                    isPlaying = true;
                    playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-pause-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
            <path d="M5 6.25a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0zm3.5 0a1.25 1.25 0 1 1 2.5 0v3.5a1.25 1.25 0 1 1-2.5 0z"/>
        </svg>`;
                    mainPlayPauseButton.innerHTML = pauseIconSVG;

                    // Add visual feedback
                    card.classList.add('now-playing');
                }).catch(error => {
                    console.error('Play failed:', error);
                    isPlaying = false;
                    playPauseButton.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="25" height="25" fill="currentColor" class="bi bi-play-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16" />
            <path d="M6.271 5.055a.5.5 0 0 1 .52.038l3.5 2.5a.5.5 0 0 1 0 .814l-3.5 2.5A.5.5 0 0 1 6 10.5v-5a.5.5 0 0 1 .271-.445" />
        </svg>`;
                    mainPlayPauseButton.innerHTML = playIconSVG;
                });
            }
        });

        container.appendChild(card);
    });
}

document.addEventListener('DOMContentLoaded', CreateSearchMusicPlaylist);





let globalAudiobooks = [];

async function CreateAudiobookPlaylist() {
    try {
        const response = await fetch('res/audiobook_playlist.json');
        if (!response.ok) {
            throw new Error(`Network response was not ok. Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched audiobook data:', data);

        // Ensure the data has an "audiobooks" array
        if (!data.audiobooks || !Array.isArray(data.audiobooks)) {
            throw new Error("Invalid JSON structure: 'audiobooks' array is missing.");
        }

        // Reverse the array so the last audiobook shows first and store globally
        globalAudiobooks = data.audiobooks.slice().reverse();

        // Initially display the first 10 items from the full reversed list
        displayAudiobookPlaylist(globalAudiobooks);
    } catch (error) {
        console.error('Error loading audiobook playlist:', error);
        document.getElementById('search-audiobook-playlist-containe').innerHTML = `<p>Error loading audiobook playlist: ${error.message}</p>`;
    }
}

function displayAudiobookPlaylist(audiobooks) {
    const container = document.getElementById('search-audiobook-playlist-containe');
    container.innerHTML = ''; // Clear any previous content

    // Limit to 10 items
    const limitedAudiobooks = audiobooks.slice(0, 10);

    limitedAudiobooks.forEach(audiobook => {
        // Validate required properties
        if (!audiobook.coverImage || !audiobook.name || !audiobook.author) {
            console.error("Missing required fields in audiobook:", audiobook);
            return;
        }

        const card = document.createElement('div');
        card.className = 'search-audiobook-card';
        card.dataset.bookId = audiobook.id; // Unique ID stored here 🔑
        card.innerHTML = `
          <img src="${audiobook.coverImage}" alt="${audiobook.name}" class="audiobook-card-img">
          <div class="search-audiobook-card-content">
            <h3 class="search-audiobook-card-title">${audiobook.name}</h3>
            <p class="search-audiobook-card-author">by ${audiobook.author}</p>
          </div>
        `;
        card.addEventListener('click', () => {
            // Find the actual book in globalAudiobooks using ID
            const actualBook = globalAudiobooks.find(b => b.id === audiobook.id);
            if (actualBook) showEpisodes(actualBook); // Pass the correct book
        });

        container.appendChild(card);
    });

}

document.addEventListener('DOMContentLoaded', CreateAudiobookPlaylist);



document.getElementById('playlist-search').addEventListener('input', function (e) {
    const searchQuery = e.target.value.toLowerCase();



    // Filter from the full playlist using song title, artist, album, related keywords, and genres
    const filteredTracks = globalPlaylist.filter(track => {
        return track.song.toLowerCase().includes(searchQuery) ||
            track.artist.toLowerCase().includes(searchQuery) ||
            (track.album && track.album.toLowerCase().includes(searchQuery)) ||
            (track.related_keywords && track.related_keywords.join(' ').toLowerCase().includes(searchQuery)) ||
            (track.genres && track.genres.join(' ').toLowerCase().includes(searchQuery));
    });

    // Update the display with only the first 10 filtered results
    displayPlaylist(filteredTracks);

    // Filter audiobook playlist cards

    // Filter from the full audiobook list (globalAudiobooks) using audiobook name and author
    const filteredAudiobooks = globalAudiobooks.filter(audiobook => {
        return audiobook.name.toLowerCase().includes(searchQuery) ||
            audiobook.author.toLowerCase().includes(searchQuery);
    });

    // Update the display with only the first 10 filtered results
    displayAudiobookPlaylist(filteredAudiobooks);
});

document.getElementById("clear-search").addEventListener("click", function () {
    const searchInput = document.getElementById("playlist-search");
    searchInput.value = "";
    // Optionally trigger the 'input' event to update any filtering logic
    searchInput.dispatchEvent(new Event("input"));
});
