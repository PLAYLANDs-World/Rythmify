let movies = []; // Global declaration

fetch('res/movies.json')
    .then(response => response.json())
    .then(data => {
        movies = data.reverse();
        initGallery(); // Initialize after data load
    })
    .catch(error => console.error('Error loading movies:', error));

function initGallery() {
    const searchInput = document.getElementById('moviesSearch');
    const loadMoreButton = document.getElementById('loadMoreMoviesButton');
    const container = document.getElementById('moviesContainer');
    const itemsPerPage = 6;
    let currentIndex = 0;
    let currentSearchQuery = '';

    // Search functionality
    function filterMovies(query) {
        return movies.filter(movie => {
            const lowerQuery = query.toLowerCase();
            return (
                movie.title.toLowerCase().includes(lowerQuery) ||
                movie.genre.some(genre => genre.toLowerCase().includes(lowerQuery)) ||
                movie.key_words.some(keyword => keyword.toLowerCase().includes(lowerQuery))
            );
        });
    }

    function handleSearch() {
        currentSearchQuery = searchInput.value.trim();
        container.innerHTML = '';
        currentIndex = 0;

        if (currentSearchQuery) {
            const filteredMovies = filterMovies(currentSearchQuery);
            filteredMovies.forEach(movie => {
                container.appendChild(createMovieCard(movie));
            });
            loadMoreButton.style.display = 'none';
        } else {
            loadItems();
            loadMoreButton.style.display = 'flex';
        }
    }

    function createMovieCard(movie) {
        const card = document.createElement('div');
        card.className = 'movie-card';
        card.innerHTML = `
            <img src="${movie.poster}" class="movie-poster" alt="${movie.title}">
            <h3 class="movie-title">${movie.title}</h3>
        `;

        // Updated click handler for hash-based routing
        card.addEventListener('click', () => {
            // Create URL-friendly slug
            const movieSlug = movie.title.toLowerCase()
                .replace(/:/g, '')
                .replace(/ /g, '-')
                .replace(/[^\w-]+/g, '');


            // Update URL without reload
            window.location.hash = `/movies/${movieSlug}`;

            // Update document title immediately
            document.title = `${movie.title} | Rythmify`;
        });

        const originalIndex = movies.indexOf(movie);
        card.dataset.index = originalIndex;
        card.addEventListener('click', () => displayMovieDetails(originalIndex));
        return card;
    }

    function loadItems() {
        const items = movies.slice(currentIndex, currentIndex + itemsPerPage);
        items.forEach(movie => {
            container.appendChild(createMovieCard(movie));
        });
        currentIndex += items.length;
        loadMoreButton.style.display = currentIndex >= movies.length ? 'none' : 'flex';
    }

    // Event listeners
    searchInput.addEventListener('input', handleSearch);
    loadMoreButton.addEventListener('click', loadItems);

    // Initial load
    loadItems();
}

let scrollPosition = 0;

function displayMovieDetails(index) {

    const movie = movies[index];

    // Update URL
    const movieSlug = movie.title.toLowerCase().replace(/ /g, '-');
    window.location.hash = `/movies/${movieSlug}`;

    // Update document title
    document.title = `${movie.title} | Rythmify`;


    const Movpopup = document.getElementById('moviePopup');
    const MovmainsrcURL = document.getElementById('OGmovieMedia');
    const MovOwnSrcURL = document.getElementById('OGmovieMedia2');
    const MovLogoIMG = document.getElementById('moviesLogoMain');
    const tagContainer = document.getElementById('MovieGenretagContainer');
    const disMovCont = document.getElementById('movieDisMain');
    const MoviePosterMainInner = document.getElementById('MoviePosterMainInner');
    const MoviePosterMainInner2 = document.getElementById('MoviePosterMainInner2');
    const MOVTrailerMainWin = document.getElementById('MOVTrailerMainWin');
    const MainMovPlayTitle = document.getElementById('MainMovPlayTitle');
    const MainMovPlayTitle2 = document.getElementById('MainMovPlayTitle2');

    // Clear existing tags to prevent duplication
    tagContainer.innerHTML = "";

    // Store scroll position
    scrollPosition = window.pageYOffset || document.documentElement.scrollTop;

    // Lock body
    document.body.classList.add('body-lock');
    document.body.style.top = `-${scrollPosition}px`;

    // Disable touch actions
    document.body.style.touchAction = 'none';

    // Show popup with movie details
    MovmainsrcURL.src = movies[index].main_src;
    MovOwnSrcURL.src = movies[index].own_src;
    MovLogoIMG.src = movies[index].logo_img;
    MovLogoIMG.alt = movies[index].title;
    disMovCont.innerText = movies[index].description;
    MoviePosterMainInner.src = movies[index].backDropPoster;
    MoviePosterMainInner2.src = movies[index].backDropPoster2;
    MoviePosterMainInner.alt = movies[index].title;
    MoviePosterMainInner2.alt = movies[index].title;
    MainMovPlayTitle.innerText = movies[index].title;
    MainMovPlayTitle2.innerText = movies[index].title;
    MOVTrailerMainWin.src = movies[index].yt_trailer_src;

    // Create tags dynamically from the selected movie's genres
    movies[index].genre.forEach(genre => {
        const tag = document.createElement('span');
        tag.classList.add('Genretag');
        tag.textContent = genre;
        tagContainer.appendChild(tag);
    });

    // Display the popup
    Movpopup.style.display = 'flex';
}


function hideMovieDetails() {
    const Movpopup = document.getElementById('moviePopup');

    // Get current active tab
    const activeTab = document.querySelector('.tab-content.active');
    const activeTabId = activeTab ? activeTab.id : 'tab3'; // Default to movies tab

    // Reset to current tab's URL and title
    const tabConfig = {
        'tab1': { path: '/Rythmify', title: 'Rythmify' },
        'tab2': { path: '/Rythmify', title: 'Rythmify' },
        'tab3': { path: 'Rythmify', title: 'Rythmify' }
    };

    // Update URL and title without triggering hashchange
    if (tabConfig[activeTabId]) {
        window.history.replaceState({}, '', `/${tabConfig[activeTabId].path}`);
        document.title = tabConfig[activeTabId].title;
    }

    // Rest of your original code
    document.body.classList.remove('body-lock');
    document.body.style.touchAction = '';
    window.scrollTo(0, scrollPosition);
    document.body.style.top = '';
    Movpopup.style.display = 'none';
    document.querySelector('.mov-poster-image-container').style.display = 'flex';
    document.querySelector('.mov-poster-image-container-2').style.display = 'flex';
    document.querySelector('.movie-media-player-og-ser').style.display = 'none';
    document.querySelector('.movie-media-player-og-ser-2').style.display = 'none';
}
// Close popup when clicking outside content

// Handle window resize
window.addEventListener('resize', () => {
    if (document.body.classList.contains('body-lock')) {
        document.body.style.top = `-${window.pageYOffset}px`;
    }
});

// Initialize gallery
document.addEventListener('DOMContentLoaded', createMovieCards);






function switchMovieTab(event, tabId) {
    let i, movieTabContent, movieTabButtons;

    // Hide all movie tab contents
    movieTabContent = document.getElementsByClassName("movie-tab-content");
    for (i = 0; i < movieTabContent.length; i++) {
        movieTabContent[i].classList.remove("active");
    }

    // Remove active class from all buttons
    movieTabButtons = document.getElementsByClassName("movie-tab-button");
    for (i = 0; i < movieTabButtons.length; i++) {
        movieTabButtons[i].classList.remove("active");
    }

    // Show the selected tab and mark button as active
    document.getElementById(tabId).classList.add("active");
    event.currentTarget.classList.add("active");
}





document.addEventListener("DOMContentLoaded", function () {
    const container = document.querySelector(".movie-Genretag-container");
    let scrollSpeed = 50; // Adjust speed as needed
    let isUserInteracting = false;
    let autoScrollInterval;
    let userInteractionTimeout;

    // Duplicate items for smooth infinite scrolling
    function duplicateItems() {
        const items = Array.from(container.children);
        items.forEach((item) => {
            let clone = item.cloneNode(true);
            container.appendChild(clone);
        });
    }

    function startAutoScroll() {
        if (autoScrollInterval) clearInterval(autoScrollInterval);
        autoScrollInterval = setInterval(() => {
            if (!isUserInteracting) {
                container.scrollLeft += scrollSpeed;

                // Reset scroll to create infinite loop
                if (container.scrollLeft >= container.scrollWidth / 2) {
                    container.scrollLeft = 0;
                }
            }
        }, 15); // Smooth interval
    }

    function stopAutoScroll() {
        isUserInteracting = true;
        clearInterval(autoScrollInterval);
        clearTimeout(userInteractionTimeout);
    }

    function resumeAutoScroll() {
        clearTimeout(userInteractionTimeout);
        userInteractionTimeout = setTimeout(() => {
            isUserInteracting = false;
            startAutoScroll();
        }, 2000); // Resume after 2s of no user interaction
    }

    // Detect user interaction
    container.addEventListener("mousedown", stopAutoScroll);
    container.addEventListener("mouseup", resumeAutoScroll);
    container.addEventListener("wheel", stopAutoScroll);
    container.addEventListener("touchstart", stopAutoScroll);
    container.addEventListener("touchend", resumeAutoScroll);
    container.addEventListener("scroll", () => {
        stopAutoScroll();
        resumeAutoScroll();
    });

    // Setup infinite scroll & start auto-scroll
    duplicateItems();
    startAutoScroll();
});

function hideImage() {
    document.querySelector('.mov-poster-image-container').style.display = 'none';
    document.querySelector('.movie-media-player-og-ser').style.display = 'grid';
    document.querySelector('.mov-poster-image-container-2').style.display = 'flex';
    document.querySelector('.movie-media-player-og-ser-2').style.display = 'none';
}

function hideImage2() {
    document.querySelector('.mov-poster-image-container').style.display = 'flex';
    document.querySelector('.movie-media-player-og-ser').style.display = 'none';
    document.querySelector('.mov-poster-image-container-2').style.display = 'none';
    document.querySelector('.movie-media-player-og-ser-2').style.display = 'grid';
}
