function handleHashChange() {
    const hash = window.location.hash.slice(1); // Remove #
    if (hash.startsWith('/movies/')) {
        const movieSlug = hash.split('/movies/')[1];
        const movie = movies.find(m =>
            m.title.toLowerCase().replace(/ /g, '-') === movieSlug
        );
        if (movie) {
            const index = movies.indexOf(movie);
            displayMovieDetails(index);
        }
    } else {
        hideMovieDetails();
    }
}



window.addEventListener('load', function () {
    // Initial check for hash
    handleHashChange();

    // Your existing fetch call
    fetch('res/movies.json')
        .then(response => response.json())
        .then(data => {
            movies = data.reverse();

            // Check hash again after data load
            handleHashChange();
        })
        .catch(error => console.error('Error loading movies:', error));
});

window.addEventListener('hashchange', handleHashChange);