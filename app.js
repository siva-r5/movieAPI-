const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");

const databasePath = path.join(__dirname, "moviesData.db");

const app = express();

app.use(express.json());

let database = null;

const initializeDbAndServer = async () => {
  try {
    database = await open({
      filename: databasePath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () =>
      console.log("Server Running at http://localhost:3002/")
    );
  } catch (error) {
    console.log(`DB Error: ${error.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

//GET Allmovies API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name 
        FROM movie;
    `;
  const movieArray = await database.all(getMoviesQuery);
  response.send(movieArray);
});

//POST movie API
app.post("/movies", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const postMovieQuery = `
        INSERT INTO movie(director_id,movie_Name,lead_actor)
        VALUES(${directorId},'${movieName}','${leadActor}')
    `;
  const movie = await database.run(postMovieQuery);
  response.send("Movie successfully Added");
});

//GET movie_id API
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
            SELECT * 
            FROM movie
            WHERE movie_id=${movieId}
    `;
  const movie = await database.get(getMovieQuery);
  response.send(movie);
});

app.put("/movies/:movieId", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const { movieId } = request.params;
  const updateMovieQuery = `
            UPDATE
                 movie
            SET 
                 director_id=${directorId},
                 movie_name='${movieName}',
                 lead_actor='${leadActor}'
            WHERE 
                movie_id=${movieId}
  `;
  await database.run(updateMovieQuery);
  response.send("Movie Details Updated");
});

//DELETE movie API
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deletemovieQuery = `
  DELETE FROM 
        movie
  WHERE
    movie_id = ${movieId};`;
  await database.run(deletemovieQuery);
  response.send("Movie Removed");
});

//GET directors API
app.get("/directors/", async (request, response) => {
  const getMoviesQuery = `
        SELECT *
        FROM director;
    `;
  const movieArray = await database.all(getMoviesQuery);
  response.send(movieArray);
});
//GET DirectorAllMovies API
app.get("/directors/:directorId/movies", async (request, response) => {
  const { directorId } = request.params;
  const getMovieNames = `
        SELECT movie_name
        
        FROM movie
        WHERE director_id=${directorId}
    `;
  const movieNames = await database.all(getMovieNames);
  response.send(movieNames);
});

module.exports = app;
