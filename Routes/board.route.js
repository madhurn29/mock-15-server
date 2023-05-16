const express = require("express");
const {
  PostBoard,
  PostTask,
  GetBoard,
} = require("../Controller/board.controller");

const boardRouter = express.Router();

boardRouter.post("/", PostBoard);
boardRouter.get("/", GetBoard);
boardRouter.post("/:id", PostTask);

module.exports = { boardRouter };
