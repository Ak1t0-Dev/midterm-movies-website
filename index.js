/* -------------------- global --------------------  */
const apiKey = '7906b2011d3fb14c70c4e1c6ad0fe3bb';
const imagePath = 'https://image.tmdb.org/t/p/w500/';
const movies = document.querySelector('#movies');
const genresId = document.querySelector('#genres');
const checkboxName = document.getElementsByName('checkbox');

/* -------------------- fetch the data --------------------  */
const fetchGenreData = async (search) => {
    try {
        const data = await fetch(`https://api.themoviedb.org/3/genre/movie/list?api_key=${apiKey}&language=en-US`);
        const jsonData = await data.json();
        const { genres } = jsonData;
        createGenres(genres);
        fetchMovieData(search, genres);
    } catch (error) {
        alert(error);
    }
}

const fetchMovieData = async (search, genres) => {
    try {
        const data = await fetch(`https://api.themoviedb.org/3/trending/movie/week?api_key=${apiKey}`);
        const jsonData = await data.json();
        createUI(jsonData, search, genres);
    } catch (error) {
        alert(error);
    }
}

/* -------------------- create genres components --------------------  */
const createGenres = (genres) => {
    genresId.innerHTML = "";
    genres.forEach(({ id, name }) => {
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
        label.appendChild(checkbox);
        label.appendChild(span);
    })
}

/* -------------------- create main components --------------------  */
const createUI = (data, search, genres) => {
    movies.innerHTML = "";
    let movieItems = [];
    const { results } = data;

    if (search !== undefined && search !== "") {
        // console.log("hello", search);
        movieItems = results.filter((item) => item.title.toLowerCase().includes(search.toLowerCase()));
    } else {
        movieItems = results;
    }

    movieItems.forEach(({ title, poster_path, backdrop_path, media_type, release_date, popularity, vote_average, vote_count, overview, genre_ids }) => {
        // make an article tag for each movie
        const article = document.createElement('article');
        article.className = 'item';
        const img = document.createElement('img');
        img.src = imagePath + poster_path;
        // detail of the movie
        const itemDetail = document.createElement('div');
        const titleItem = document.createElement('h3');
        titleItem.textContent = title;
        const releaseDate = document.createElement('h4');
        releaseDate.textContent = release_date;
        const divCollection = document.createElement('div');
        divCollection.id = 'collected-data';
        const divPopularity = document.createElement('div');
        divPopularity.className = 'collected';
        divPopularity.textContent = popularity;
        const divNumberVote = document.createElement('div');
        divNumberVote.className = 'collected';
        divNumberVote.textContent = vote_count;
        const divAverageVote = document.createElement('div');
        divNumberVote.className = 'collected';
        divAverageVote.textContent = vote_average;
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
        divCollection.appendChild(divNumberVote);
        divCollection.appendChild(divAverageVote);
        itemDetail.appendChild(divGenre);
        showGenre(genre_ids, divGenre, genres);
    });
}

/* -------------------- show genres in an article --------------------  */
const showGenre = (genre, divGenre, genres) => {
    genre.map((item) => {
        genres.forEach(({ id, name }) => {
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
    fetchGenreData(search.value);
}

/* -------------------- checkbox event --------------------  */
const getCheckboxValue = () => {
    const checkedArray = [];
    checkboxName.forEach((item) => {
        if(item.checked) checkedArray.push(item.value);
    })
    console.log(checkedArray);
}

fetchGenreData();