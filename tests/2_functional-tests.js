'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function () {
  this.timeout(15000);
  let threadId;
  let replyId;

  test('Creating a new thread', function (done) {
    chai.request(server).post('/api/threads/test-board')
      .send({ text: 'test text', delete_password: 'test' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.status, 200);
        assert.equal(response.body.text, 'test text');
        threadId = response.body._id;
        done();
      });
  });

  test('Viewing the 10 most recent threads with 3 replies each', function (done) {
    chai.request(server).get('/api/threads/test-board')
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.status, 200);
        assert.equal(response.body[0].text, 'test text');
        assert.notProperty(response.body[0], 'delete_password');
        done();
      });
  });

  test('Reporting a thread', function (done) {
    chai.request(server).put('/api/threads/test-board')
      .send({ report_id: threadId })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'reported');
        done();
      });
  });

  test('Creating a new reply', function (done) {
    chai.request(server).post('/api/replies/test-board')
      .send({ thread_id: threadId, text: 'test reply', delete_password: 'testreply' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.status, 200);
        replyId = response.body.threads[0].replies[0]._id;
        done();
      });
  });

  test('Viewing a single thread with all replies', function (done) {
    chai.request(server).get('/api/replies/test-board')
      .query({ thread_id: threadId })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.body._id, threadId);
        assert.equal(response.body.replies[0].text, 'test reply');
        assert.notProperty(response.body.replies[0], 'delete_password');
        done();
      });
  });

  test('Deleting a reply with the incorrect password', function (done) {
    chai.request(server).delete('/api/replies/test-board')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'wrong' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a reply with the correct password', function (done) {
    chai.request(server).delete('/api/replies/test-board')
      .send({ thread_id: threadId, reply_id: replyId, delete_password: 'testreply' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'success');
        done();
      });
  });

  test('Reporting a reply', function (done) {
    chai.request(server).put('/api/replies/test-board')
      .send({ thread_id: threadId, reply_id: replyId })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'reported');
        done();
      });
  });

  test('Deleting a thread with the incorrect password', function (done) {
    chai.request(server).delete('/api/threads/test-board')
      .send({ thread_id: threadId, delete_password: 'wrong' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'incorrect password');
        done();
      });
  });

  test('Deleting a thread with the correct password', function (done) {
    chai.request(server).delete('/api/threads/test-board')
      .send({ thread_id: threadId, delete_password: 'test' })
      .end(function (error, response) {
        assert.isNull(error);
        assert.equal(response.text, 'success');
        done();
      });
  });
});
