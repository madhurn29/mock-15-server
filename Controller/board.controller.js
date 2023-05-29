const { Board, Task, Subtask } = require("../Model/board.model");
var jwt = require("jsonwebtoken");

//*------ add new board ----------//

const PostBoard = async (req, res) => {
  const payload = req.body;
  console.log(payload);
  try {
    const board = new Board(payload);
    await board.save();
    res
      .status(201)
      .send({ message: "Board Created successfully", board: board });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//*------- add new task to the board ------
const PostTask = async (req, res) => {
  const { boardId } = req.params;
  req.body.boardId = boardId;
  try {
    const board = await Board.findById({ _id: boardId });

    const task = new Task(req.body);
    await task.save();

    board.tasks.push(task._id);
    await board.save();

    res.send({ message: "Task added to the board", task });
  } catch (error) {
    res.send({ message: error.message });
  }
};

//*------ add new substask to task ---------
const SubTask = async (req, res) => {
  const { boardId, taskId } = req.params;
  const { title } = req.body;

  try {
    const task = await Task.findOne({ _id: taskId, boardId });

    // Create a new subtask
    for (let i = 0; i < title.length; i++) {
      const subtask = new Subtask({
        title: title[i],
        isCompleted: false,
        taskId,
      });

      // Save the subtask to the database
      await subtask.save();

      // Associate the subtask with the task
      task.subtasks.push(subtask._id);
      await task.save();
    }

    // Return the newly created subtask object
    res.status(201).send({ message: "Subtasks added succussfully" });
  } catch (error) {
    res.send({ message: error.message });
  }
};

//* ----- get boards ------//
const GetBoard = async (req, res) => {
  const token = req.headers.authorization;
  try {
    var decoded = jwt.verify(token, "mock15");

    const boards = await Board.find({ userID: decoded.userID });
    res.status(200).send({ boards });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//* ------get tasks of particualr board-------
const GetBoardTask = async (req, res) => {
  // const token = req.headers.authorization;
  const { boardId } = req.params;

  try {
    // Find the board with the specified boardId
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send({ error: "Board not found" });
    }

    // Find all tasks associated with the board
    const tasks = await Task.find({ _id: { $in: board.tasks } });

    // Return the tasks array
    res.status(200).send(tasks);
  } catch (error) {
    res.status(400).send({ message: error.message + "Not Authorized" });
  }
};

//* ----- edit task --------
const EditTask = async (req, res) => {
  const { taskId } = req.params;
  const { boardId } = req.params;
  const { title, description, status } = req.body;
  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send({ error: "Board not found" });
    }

    const task = await Task.findOne({ _id: taskId, boardId });

    if (title) {
      task.title = title;
    }
    if (description) {
      task.description = description;
    }
    if (status) {
      task.status = status;
    }

    await task.save();

    res.status(200).send({ message: "Task updated successfully", task });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//* ------- get subtasks for a task -------
const getSubtask = async (req, res) => {
  const { taskId } = req.params;
  const { boardId } = req.params;
  try {
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send({ error: "Board not found" });
    }

    // Find the board with the specified boardId
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).send({ error: "Task not found" });
    }

    // Find all tasks associated with the board
    const subtasks = await Subtask.find({ _id: { $in: task.subtasks } });

    // Return the tasks array
    res.status(200).send(subtasks);
  } catch (error) {
    res.status(400).send({ message: error.message + "Not Authorized" });
  }
};

//*----- edit subtasks ---------
const EditSubtask = async (req, res) => {
  const { taskId } = req.params;
  const { subtaskId } = req.params;
  const { title, isCompleted } = req.body;
  try {
    const board = await Task.findById(taskId);
    if (!board) {
      return res.status(404).send({ error: "Task not found" });
    }

    const subtask = await Subtask.findOne({ _id: subtaskId, taskId });
    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found in the task" });
    }
    if (title) {
      subtask.title = title;
    }
    if (isCompleted) {
      subtask.isCompleted = isCompleted;
    }

    await subtask.save();

    res.status(200).send({ message: "SubTask updated successfully", subtask });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
//* ------ Delete subtask -------- //
const DeleteSubtask = async (req, res) => {
  const { boardId, taskId, subtaskId } = req.params;
  try {
    // Find the board with the specified boardId
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send({ error: "Board not found" });
    }

    // Find the task with the specified taskId
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: "Task not found" });
    }

    // Find the subtask within the task with the specified subtaskId
    const subtask = await Subtask.findOne({ _id: subtaskId, taskId: taskId });

    if (!subtask) {
      return res.status(404).json({ error: "Subtask not found in the task" });
    }

    // Remove the subtask from the task's subtasks array
    task.subtasks.pull(subtask._id);
    await task.save();

    // Delete the subtask from the database
    await Subtask.deleteOne({ _id: subtaskId });

    res.status(200).send({ message: "Subtask deleted successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//* ------ Delete task -------- //
const DeteteTask = async (req, res) => {
  const { boardId, taskId } = req.params;

  try {
    // Find the board with the specified boardId
    const board = await Board.findById(boardId);
    if (!board) {
      return res.status(404).send({ error: "Board not found" });
    }
    // Find the task within the board with the specified taskId
    const task = await Task.findOne({ _id: taskId, boardId: boardId });
    if (!task) {
      return res.status(404).json({ error: "Task not found in the board" });
    }

    // Remove the task from the board's tasks array
    board.tasks.pull(task._id);
    await board.save();

    // Delete the task from the database
    await Task.deleteOne({ _id: taskId });
    res.status(200).send({ message: "Task deleted successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//* ------ Delete board -------- //
const DeleteBoard = async (req, res) => {
  const { boardId } = req.params;
  try {
    // Find the board with the specified boardId
    const board = await Board.findByIdAndDelete(boardId);

    res.status(200).send({ message: "Board deleted successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};

//* ------ edit board -------- //
const EditBoard = async (req, res) => {
  const { boardId } = req.params;
  const payload = req.body;
  try {
    const board = await Board.findByIdAndUpdate({ _id: boardId }, payload);
    res.status(201).send({ message: "Board updated successfully" });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
};
module.exports = {
  PostBoard,
  PostTask,
  SubTask,
  GetBoard,
  GetBoardTask,
  EditTask,
  getSubtask,
  EditSubtask,
  DeleteSubtask,
  DeteteTask,
  DeleteBoard,
  EditBoard,
};
