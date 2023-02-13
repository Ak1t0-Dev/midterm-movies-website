/* -------------------- global --------------------  */
const apiKey = '7906b2011d3fb14c70c4e1c6ad0fe3bb';
const imagePath = 'https://image.tmdb.org/t/p/w500/';
const movies = document.querySelector('#movies');
const genresId = document.querySelector('#genres');
const searchBtn = document.querySelector('.search-btn');
const checkboxName = document.getElementsByName('checkbox');
const sortName = document.getElementsByName('sort');
const total = document.querySelector('#total');
let checkedArray = [];
let genresData = [];

/* -------------------- fetch the data --------------------  */
const fetchGenreData = async () => {
    try {
        const data = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const jsonData = await data.json();
        const { genres } = jsonData;
        genresData = genres;
        createGenres();
        fetchMovieData();
    } catch (error) {
        alert(error);
    }
}

const fetchMovieData = async (search) => {
    try {
        const data = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        const jsonData = await data.json();
        createUI(jsonData, search);
    } catch (error) {
        alert(error);
    }
}

/* -------------------- create genres components --------------------  */
const createGenres = () => {
    genresId.innerHTML = "";
    genresData.forEach(({ id, name }) => {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        const span = document.createElement("span");
        checkbox.type = "checkbox";
        checkbox.name = "checkbox";
        checkbox.value = id;
        checkbox.id = id;
        span.textContent = name;
        checkbox.addEventListener('change', getCheckboxValue);
        // append
        genresId.appendChild(label);
        label.append(checkbox, span);
    })
}

/* -------------------- create main components --------------------  */
const createUI = (data, search) => {
    movies.innerHTML = "";
    let movieItems = [];
    const { results } = data;
    let sortedFilter = [];
    let checkedFilter = [];
    let popularities = [];
    let sortValue = "";


    // sort data in the selected order
    // sortName.forEach((item) => {
    //     if (item.checked) {let sortValue = sortName.value};
    // })
    for (let i = 0; i < sortName.length; i++) {
        if (sortName[i].checked) {
            sortValue = sortName[i].value;
            break;
        }
    }

    switch (sortValue) {
        case '1': // trend
            sortedFilter = sortData(results, 'popularity', true);
            break;
        case '2': // votes
            sortedFilter = sortData(results, 'vote_count', true);
            break;
        case '3': // rates
            sortedFilter = sortData(results, 'vote_average', true);
            break;
        default: // none
            sortedFilter = results;
            break;
    }

    // add a genres filtering function
    if (checkedArray.length > 0) {
        checkedFilter = sortedFilter.filter(({ genre_ids }) => {
            return isAllIncludes(checkedArray, genre_ids);
        })
    } else {
        checkedFilter = sortedFilter;
    }

    // check if a searchbox has a value or not
    // first rendering case, radio change event case, search value is empty case 
    if (search !== undefined && typeof search === 'string' && search !== "") {
        movieItems = checkedFilter.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
    } else {
        movieItems = checkedFilter;
    }

    // data shaping of popularity (create a ranking and add a new property to newItems)
    movieItems.forEach(({ popularity }) => {
        popularities.push(popularity);
    });

    let sorted = popularities.slice().sort((a, b) => b - a);
    let rankings = popularities.slice().map((i) => sorted.indexOf(i) + 1);

    for (let i = 0; i < rankings.length; i++) {
        movieItems[i].rank = rankings[i];
    }

    // show movies total
    total.innerHTML = "";
    const moviesTotal = movieItems.length;
    const headMoviesTotal = document.createElement('h2');
    headMoviesTotal.textContent = moviesTotal + ' Movies';
    total.appendChild(headMoviesTotal);

        movieItems.forEach(({ title, poster_path, backdrop_path, media_type, release_date, popularity, vote_average, vote_count, overview, genre_ids, rank }) => {

            // calculating
            const roundVoteAverage = ((Math.round(vote_average * 10)) / 10).toFixed(1);

            // make an article tag for each movie
            const article = document.createElement('article');
            article.className = 'item';
            const img = document.createElement('img');
            img.src = imagePath + poster_path;
            // detail of the movie
            const itemDetail = document.createElement('div');
            itemDetail.className = 'item-detail';
            const titleItem = document.createElement('h3');
            titleItem.textContent = title;
            const releaseDate = document.createElement('h4');
            releaseDate.textContent = release_date;

            // evaluations
            const divCollection = document.createElement('div');
            divCollection.className = 'collected-data';

            // popularity part
            const divPopularity = document.createElement('div');
            divPopularity.className = 'collected';
            const iconPopularity = document.createElement('i');
            iconPopularity.setAttribute('class', 'fa-solid fa-arrow-trend-up');
            const spanPopularity = document.createElement('span');
            spanPopularity.textContent = rank;

            // number vote part
            const divNumberVote = document.createElement('div');
            divNumberVote.className = 'collected';
            const iconNumberVote = document.createElement('i');
            iconNumberVote.setAttribute('class', 'fa-regular fa-hand');
            const spanNumberVote = document.createElement('span');
            spanNumberVote.textContent = vote_count;

            // average vote part
            const divAverageVote = document.createElement('div');
            divAverageVote.className = 'collected';
            const iconAverageVote = document.createElement('i');
            iconAverageVote.setAttribute('class', 'fa-solid fa-star');
            const spanAverageVote = document.createElement('span');
            spanAverageVote.textContent = roundVoteAverage;

            // genres part
            const divGenre = document.createElement('div');
            divGenre.className = 'item-genres';

            // appending
            movies.appendChild(article);
            article.appendChild(img);
            article.appendChild(itemDetail);
            itemDetail.appendChild(titleItem);
            itemDetail.appendChild(releaseDate);
            itemDetail.appendChild(divCollection);
            divCollection.appendChild(divPopularity);
            divPopularity.append(iconPopularity, spanPopularity);
            divCollection.appendChild(divNumberVote);
            divNumberVote.append(iconNumberVote, spanNumberVote);
            divCollection.appendChild(divAverageVote);
            divAverageVote.append(iconAverageVote, spanAverageVote);
            itemDetail.appendChild(divGenre);
            showGenre(genre_ids, divGenre);
        });
}
/* -------------------- sort data in the selected order --------------------  */
const sortData = (array, type, order) => {
    return array.slice().sort((a, b) => order ? b[type] - a[type] : a[type] - b[type]);
}

/* -------------------- search the genres from the item --------------------  */
const isAllIncludes = (array, target) => array.every(item => target.includes(item));

/* -------------------- show genres in an article --------------------  */
const showGenre = (genre, divGenre) => {
    genre.map((item) => {
        genresData.forEach(({ id, name }) => {
            if (id === item) {
                const span = document.createElement('span');
                span.className = 'item-genre';
                divGenre.appendChild(span);
                span.textContent = name;
            }
        })
    })
}

/* -------------------- search box --------------------  */
const fetchDataOnSearch = () => {
    const search = document.querySelector('.search-input');
    fetchMovieData(search.value);
}

/* -------------------- checkbox event --------------------  */
const getCheckboxValue = () => {
    checkedArray = [];
    checkboxName.forEach((item) => {
        if (item.checked) checkedArray.push(parseInt(item.value));
    })
    fetchMovieData();
}

/* -------------------- add events to exisiting elements --------------------  */
searchBtn.addEventListener('click', fetchDataOnSearch);
sortName.forEach((radioBtn) => {
    radioBtn.addEventListener('change', fetchMovieData);
})

fetchGenreData();