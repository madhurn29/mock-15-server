const express = require("express");
const { PostBoard, PostTask } = require("../Controller/board.controller");

const boardRouter = express.Router();

boardRouter.post("/", PostBoard);
boardRouter.post("/:id", PostTask);

module.exports = { boardRouter };
