const { BoardModel } = require("../Model/board.model");

const PostBoard = async (req, res) => {
  const payload = req.body;
  payload.name = "Todo";
  payload.task = [];
  try {
    const board = new BoardModel(payload);
    await board.save();
    res.status(201).send({ message: "Board Created successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

const PostTask = async (req, res) => {
  const { id } = req.params;
  try {
    const board = await BoardModel.findById({ _id: id });
    board.tasks.push(req.body);

    const updatedBoard = await BoardModel.findByIdAndUpdate({ _id: id }, board);
    res.send({ message: "Updated" });
  } catch (error) {
    res.send({ message: error.message });
  }
};

module.exports = { PostBoard, PostTask };
