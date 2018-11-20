const request = require('request');

describe('GET /test', () => {
  const data = {};
  beforeAll(done => {
    Request.get('http://localhost:3000/test', (error, response, body) => {
      data.status = response.statusCode;
      data.body = JSON.parse(body);
      done();
    });
  });
  it('Status 200', () => {
    expect(data.status).toBe(500);
  });
  it('Body', () => {
    expect(data.body.message).toBe('This is an error response');
  });
});
