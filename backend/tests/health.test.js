const request = require('supertest');
const app = require('../server');

describe('Health Endpoint', () => {
  it('should return a 200 OK status', async () => {
    // We bypass SSL checking for the test environment since we use self-signed certs
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    
    const response = await request(app).get('/health');
    expect(response.statusCode).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('message', 'Auth service is running securely');
  });
});
