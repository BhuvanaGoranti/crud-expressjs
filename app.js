const express = require("express");
const app = express();
app.use(express.json());
const path = require("path");
const dbPath = path.join(__dirname, "moviesData.db");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
let db = null;
const objConv = (obj) => {
  return {
    movieName: obj.movie_name,
  };
};
const dbConnection = async () => {
  db = await open({
    filename: dbPath,
    driver: sqlite3.Database,
  });
};
dbConnection();
app.get("/movies/", async (request, response) => {
  const getQuery = `
    SELECT movie_name 
    FROM movie;`;
  const res = await db.all(getQuery);
  let result = [];
  for (let i = 0; i < res.length; i++) {
    result.push(objConv(res[i]));
  }
  response.send(result);
});
app.post("/movies/", async (request, response) => {
  const new_movie = request.body;
  const { directorId, movieName, leadActor } = new_movie;
  const postQuery = `
    INSERT INTO movie(director_id,movie_name,lead_actor)
    VALUES(${directorId},'${movieName}','${leadActor}');`;
  const res = await db.run(postQuery);
  const movieId = res.lastID;
  console.log(movieId);
  response.send("Movie Successfully Added");
});
app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getQuery = `
    SELECT * 
    FROM movie
    WHERE movie_id=${movieId}`;
  const res = await db.get(getQuery);
  const result = {
    movieId: res.movie_id,
    directorId: res.director_id,
    movieName: res.movie_name,
    leadActor: res.lead_actor,
  };
  response.send(result);
});
app.put("/movies/:movieId/", async (request, response) => {
  const update = request.body;
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = update;
  const putQuery = `
        UPDATE movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE movie_id= ${movieId};`;
  const res = await db.run(putQuery);
  response.send("Movie Details Updated");
});
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteQuery = `
        DELETE FROM movie
        WHERE movie_id=${movieId};`;
  db.run(deleteQuery);
  response.send("Movie Removed");
});
const objC = (obj) => {
  return {
    directorId: obj.director_id,
    directorName: obj.director_name,
  };
};
app.get("/directors/", async (request, response) => {
  const getQuery = `
        SELECT * FROM director;`;
  const res = await db.all(getQuery);
  let result = [];
  for (let i = 0; i < res.length; i++) {
    result.push(objC(res[i]));
  }
  response.send(result);
});
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getQuery = `
        select movie.movie_name from movie
        inner join director
        on movie.director_id = director.director_id
        and movie.director_id = ${directorId}`;
  const res = await db.all(getQuery);
  console.log(res);
  let result = [];
  for (let i = 0; i < res.length; i++) {
    result.push(objConv(res[i]));
  }
  response.send(result);
});
module.exports = app;
