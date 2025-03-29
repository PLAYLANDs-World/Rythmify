let isAnimating = false;
let currentAudio = null;
let currentBook = null;

fetch('res/audiobook_playlist.json')
    .then(response => response.json())
    .then(data => {
        renderPlaylist(data.audiobooks);
    });

function renderPlaylist(audiobooks) {
    const container = document.getElementById('playlistContainer');
    // Clear container (in case of re-render)
    container.innerHTML = '';

    // Create a reversed copy of the audiobooks array without mutating the original
    const reversedAudiobooks = [...audiobooks].reverse();
    const itemsPerPage = 6;
    let currentIndex = 0;
    const loadMoreButton = document.getElementById('loadMoreButton');

    function loadItems() {
        // Load next set of items
        const items = reversedAudiobooks.slice(currentIndex, currentIndex + itemsPerPage);
        items.forEach(book => {
            const card = document.createElement('div');
            card.className = 'audiobook-card';
            card.innerHTML = `
              <img class="audiobook-cover" src="${book.coverImage}" alt="Cover">
              <div class="pt-audiobook-info">
                <h3 class="audiobook-title">${book.name}</h3>
                <div class="audiobook-author">${book.author}</div>
              </div>
            `;
            card.addEventListener('click', () => showEpisodes(book));
            container.appendChild(card);
        });

        currentIndex += items.length;
        // Hide the button if no more items to load
        if (currentIndex >= reversedAudiobooks.length) {
            loadMoreButton.style.display = 'none';
        }
    }

    // Initial load of items
    loadItems();

    // Add event listener to the button to load more items on click
    loadMoreButton.addEventListener('click', loadItems);
}

function showEpisodes(book) {
    const modal = document.getElementById('episodeModal');
    const list = document.getElementById('episodeList');
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';
    list.innerHTML = '';


    const header = document.createElement('div');
    header.className = 'modal-header';
    header.innerHTML = `
        <div class="header-content">
            <img src="${book.coverImage}" class="modal-cover">
            <h2 class="modal-title">${book.name}</h2>
            ${book.author ? `<p class="modal-author">By ${book.author}</p>` : ''}
        </div>
        <div class="pt-ep-close-btn">
            <button class="ep-close-btn">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" id="downward-arrow" fill="white">
                    <g>
                        <path d="M12 16a1 1 0 0 1-.64-.23l-6-5a1 1 0 1 1 1.28-1.54L12 13.71l5.36-4.32a1 1 0 0 1 1.41.15 1 1 0 0 1-.14 1.46l-6 4.83A1 1 0 0 1 12 16z"></path>
                    </g>
                </svg>
            </button>
        </div>
    `;

    const episodeContainer = document.createElement('div');
    episodeContainer.className = 'episode-container';


    book.episodes.forEach((episode, index) => {
        const episodeItem = document.createElement('div');
        episodeItem.className = 'episode-item';
        episodeItem.innerHTML = `
            <span class="episode-number">${index + 1}.</span>
            <span class="episode-title">${episode.name}</span>
        `;
        episodeItem.addEventListener('click', () => {
            loadAudiobook(book, index);
            modal.style.display = 'flex';
        });
        episodeContainer.appendChild(episodeItem);
    });

    list.appendChild(header);
    list.appendChild(episodeContainer);

    modal.style.display = 'flex';
    modal.classList.add('active');

    const epcloseBtn = header.querySelector('.ep-close-btn');
    epcloseBtn.addEventListener('click', () => {
        modal.style.display = 'none'
        document.body.classList.remove('body-lock');
        document.body.style.touchAction = '';

        // Restore scroll position
        window.scrollTo(0, scrollPosition);
        document.body.style.top = '';
    });


}


function loadAudiobook(book, episodeIdentifier) {
    // Stop existing audio
    if (currentAudio) {
        currentAudio.pause();
        currentAudio = null;
    }

    // Find episode by ID or index
    const episode = book.episodes.find(ep => ep.id === episodeIdentifier)
        || book.episodes[episodeIdentifier];

    if (!episode || !episode.audioUrl) { // Changed to audioUrl
        console.error('Episode not found:', episodeIdentifier);
        return;
    }

    currentBook = book;

    // Get actual episode index
    const episodeIndex = book.episodes.findIndex(ep => ep.id === episode.id);

    // Update UI
    const footerPlayer = document.getElementById('audiobookFooterPlayer');
    footerPlayer.style.display = 'grid';
    document.getElementById('playerCover').src = book.coverImage;
    document.getElementById('playerBookTitle').textContent = book.name;
    document.getElementById('playerEpisodeTitle').textContent =
        `EP ${episodeIndex + 1} - ${episode.name}`;
    document.getElementById('playPauseBtn').innerHTML = pauseIcon;

    // Initialize audio with CORRECT PROPERTY NAME
    currentAudio = new Audio(episode.audioUrl); // Changed to audioUrl

    // Add event listeners
    currentAudio.addEventListener('timeupdate', updateProgress);
    currentAudio.addEventListener('ended', handleAudioEnd);

    // Set up controls
    setupPlayPauseControl();

    // Start playback
    currentAudio.play().catch(error => {
        console.error('Playback failed:', error);
        alert('Error playing audio: ' + error.message);
    });

    killMainSongs();
}

// Helper functions
function updateProgress() {
    const progressBar = document.getElementById('audiobookprogress');
    if (currentAudio.duration) {
        const progress = (currentAudio.currentTime / currentAudio.duration) * 100;
        progressBar.style.width = `${progress}%`;
    }
}

function handleAudioEnd() {
    const currentIndex = currentBook.episodes.findIndex(ep => ep.id === currentAudio.src);
    if (currentIndex < currentBook.episodes.length - 1) {
        loadAudiobook(currentBook, currentBook.episodes[currentIndex + 1].id);
    } else {
        killAudiobook();
    }
}

function setupPlayPauseControl() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    playPauseBtn.onclick = () => {
        if (currentAudio.paused) {
            currentAudio.play();
            playPauseBtn.innerHTML = pauseIcon;
        } else {
            currentAudio.pause();
            playPauseBtn.innerHTML = playIcon;
        }
    };
}

// SVG icons
const pauseIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pause-fill" viewBox="0 0 16 16">
    <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5"/>
</svg>`;

const playIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-play-fill" viewBox="0 0 16 16">
    <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393"/>
</svg>`;

function openTab(evt, tabName) {
    if (isAnimating || evt.currentTarget.classList.contains('active')) return;

    isAnimating = true;

    const activeTab = document.querySelector('.tab-content.active');
    const activeButton = document.querySelector('.tab-button.active');

    if (activeTab) {
        activeTab.style.animation = 'none';
        activeTab.offsetHeight;
        activeTab.style.opacity = '0';
        activeTab.style.transform = 'translateX(-20px)';
        setTimeout(() => {
            activeTab.classList.remove('active');
        }, 300);
    }

    activeButton.classList.remove('active');

    evt.currentTarget.classList.add('active');

    const newTab = document.getElementById(tabName);
    newTab.classList.add('active');
    newTab.style.animation = 'none';
    newTab.offsetHeight;
    newTab.style.animation = '';

    setTimeout(() => {
        isAnimating = false;
    }, 400);
}



function killAudiobook() {
    currentAudio.pause();
    playPauseBtn.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
                class="bi bi-play-fill" viewBox="0 0 16 16" fill="white">
                    <path
                        d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
            </svg>
            `;
    const footerPlayer = document.getElementById('audiobookFooterPlayer');
    footerPlayer.style.display = 'none';
}
