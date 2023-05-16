const mongoose = require("mongoose");
const boardSchema = mongoose.Schema(
  {
    userId: String,
    name: String,
    tasks: [
      {
        title: String,
        description: String,
        status: {
          type: String,
        },
        subtask: [
          {
            title: String,
            isCompleted: Boolean,
          },
        ],
      },
    ],
  },
  {
    versionKey: false,
  }
);
const BoardModel = mongoose.model("board", boardSchema);

module.exports = { BoardModel };
