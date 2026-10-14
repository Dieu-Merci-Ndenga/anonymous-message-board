'use strict';

const Board_Model = require('./mongoose-models').Board;
const Thread_Model = require('./mongoose-models').Thread;
const Reply_Model = require('./mongoose-models').Reply;

function publicReply(reply) {
  return {
    _id: reply._id,
    text: reply.text,
    created_on: reply.created_on,
  };
}

function publicThread(thread, replyLimit) {
  const replies = thread.replies
    .slice()
    .sort((left, right) => right.created_on - left.created_on)
    .slice(0, replyLimit);

  return {
    _id: thread._id,
    text: thread.text,
    created_on: thread.created_on,
    bumped_on: thread.bumped_on,
    replies: replies.map(publicReply),
    replycount: thread.replies.length,
  };
}

function findThread(board, threadId) {
  return board && board.threads.id(threadId);
}

module.exports = function (app) {
  app.route("/api/threads/:board")
    .post((req, res) => {
      const { text, delete_password } = req.body;
      const board = req.params.board;
      const newThread = new Thread_Model({
        text,
        delete_password,
      });
      Board_Model.findOne({ name: board }, (err, Boarddata) => {
        if (err) return res.status(500).send('database error');
        if (!Boarddata) {
          const newBoard = new Board_Model({ name: board });
          newBoard.threads.push(newThread);
          newBoard.save((err, data) => {
            if (err || !data) {
              res.status(500).send('database error');
            } else {
              res.json(newThread);
            }
          });
        } else {
          Boarddata.threads.push(newThread);
          Boarddata.save((err, data) => {
            if (err || !data) {
              res.status(500).send('database error');
            } else {
              res.json(newThread);
            }
          });
        }
      });
    })
    .get((req, res) => {
      Board_Model.findOne({ name: req.params.board }, (err, data) => {
        if (err) return res.status(500).send('database error');
        if (!data) return res.json([]);
        const threads = data.threads
          .slice()
          .sort((left, right) => right.bumped_on - left.bumped_on)
          .slice(0, 10)
          .map((thread) => publicThread(thread, 3));
        res.json(threads);
      });
    })
    .put((req, res) => {
      const reportId = req.body.thread_id || req.body.report_id;
      Board_Model.findOne({ name: req.params.board }, (err, boardData) => {
        const reportedThread = findThread(boardData, reportId);
        if (err || !reportedThread) return res.status(404).send('thread not found');
        reportedThread.reported = true;
        boardData.save((saveError) => {
          if (saveError) return res.status(500).send('database error');
          res.send('reported');
        });
      });
    })
    .delete((req, res) => {
      const { thread_id, delete_password } = req.body;
      Board_Model.findOne({ name: req.params.board }, (err, boardData) => {
        const threadToDelete = findThread(boardData, thread_id);
        if (err || !threadToDelete) return res.status(404).send('thread not found');
        if (threadToDelete.delete_password !== delete_password) return res.send('incorrect password');
        threadToDelete.remove();
        boardData.save((saveError) => {
          if (saveError) return res.status(500).send('database error');
          res.send('success');
        });
      });
    });

  app
    .route("/api/replies/:board")
    .post((req, res) => {
      const { thread_id, text, delete_password } = req.body;
      const newReply = new Reply_Model({
        text,
        delete_password,
      });
      Board_Model.findOne({ name: req.params.board }, (err, boardData) => {
        const threadToAddReply = findThread(boardData, thread_id);
        if (err || !threadToAddReply) return res.status(404).send('thread not found');
        threadToAddReply.bumped_on = newReply.created_on;
        threadToAddReply.replies.push(newReply);
        boardData.save((saveError, updatedData) => {
          if (saveError) return res.status(500).send('database error');
          res.json(updatedData);
        });
      });
    })
    .get((req, res) => {
      Board_Model.findOne({ name: req.params.board }, (err, data) => {
        const thread = findThread(data, req.query.thread_id);
        if (err || !thread) return res.status(404).send('thread not found');
        res.json(publicThread(thread, thread.replies.length));
      });
    })
    .put((req, res) => {
      const { thread_id, reply_id } = req.body;
      Board_Model.findOne({ name: req.params.board }, (err, data) => {
        const thread = findThread(data, thread_id);
        const reply = thread && thread.replies.id(reply_id);
        if (err || !reply) return res.status(404).send('reply not found');
        reply.reported = true;
        data.save((saveError) => {
          if (saveError) return res.status(500).send('database error');
          res.send('reported');
        });
      });
    })
    .delete((req, res) => {
      const { thread_id, reply_id, delete_password } = req.body;
      Board_Model.findOne({ name: req.params.board }, (err, data) => {
        const thread = findThread(data, thread_id);
        const reply = thread && thread.replies.id(reply_id);
        if (err || !reply) return res.status(404).send('reply not found');
        if (reply.delete_password !== delete_password) return res.send('incorrect password');
        reply.text = '[deleted]';
        data.save((saveError) => {
          if (saveError) return res.status(500).send('database error');
          res.send('success');
        });
      });
    });
};
