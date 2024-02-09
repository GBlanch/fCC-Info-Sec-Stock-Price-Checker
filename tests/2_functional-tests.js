// Require chai/chai-http and main server file
const chai = require('chai');
const { assert, expect } = require('chai');
const chaiHttp = require('chai-http');
const server = require('../server');

// Enable chai-http plugin 
chai.use(chaiHttp);
   

suite('Functional tests:', function () {
  suite('', function () {

    // Assert the response status, stock symbol, and price existence 
    // after making a GET request to '/api/stock-prices/'  
    // querying 'MSFT' as stock parameter 
    test('#1. Viewing one stock: GET request to endpoint `/api/stock-prices/`',
     function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/')
        .set('content-type', 'application/json')
        .query({ stock: 'MSFT' })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'MSFT');
          assert.exists(res.body.stockData.price, 'Price for MSFT exists');
          done();
        });
    });
    
    // Same structure as #1, just add query parameter `like`
    // and add an assertion for it
    test('#2. Viewing one stock and liking it: GET request to endpoint `/api/stock-prices/`"',
     function (done) {
        chai
          .request(server)
          .get('/api/stock-prices/')
          .set('content-type', 'application/json')
          .query({ stock: 'AMZN', like: true })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData.stock, 'AMZN');
            assert.equal(res.body.stockData.likes, 1);
            assert.exists(res.body.stockData.price, 'Price for AMZN exists');
            done();
          });
      });
      
    // Iterate test #2
    test('#3. Viewing the same stock and liking it again: GET request to endpoint `/api/stock-prices/`',
     function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/')
        .set('content-type', 'application/json')
        .query({ stock: 'AMZN', like: true })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData.stock, 'AMZN');
          assert.equal(res.body.stockData.likes, 1);
          assert.exists(res.body.stockData.price, 'Price for AMZN exists');
          done();
        });
    });
    // Same structure as #1, in this case the query param. is a list
    test('#4. Viewing two stocks: GET request to endpoint `/api/stock-prices/`',
     function (done) {
      chai
        .request(server)
        .get('/api/stock-prices/')
        .set('content-type', 'application/json')
        .query({ stock: ['GOOG', 'AAPL'] })
        .end(function (err, res) {
          assert.equal(res.status, 200);
          assert.equal(res.body.stockData[0].stock, 'GOOG');
          assert.equal(res.body.stockData[1].stock, 'AAPL');
          assert.exists(res.body.stockData[0].price, 'Price for GOOG exists');
          assert.exists(res.body.stockData[1].price, 'Price for AAPL exists');
          done();
        });
    });
    // Same structure as #4, plus asserting for existance of `rel-likes` property
    test('#5. Viewing two stocks and liking them: GET request to endpoint `/api/stock-prices/`',
     function (done) {
        chai
          .request(server)
          .get('/api/stock-prices/')
          .set('content-type', 'application/json')
          .query({ stock: ['GOOG', 'AAPL'], like: true })
          .end(function (err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.stockData[0].stock, 'GOOG');
            assert.equal(res.body.stockData[1].stock, 'AAPL');
            assert.exists(res.body.stockData[0].price, 'Price for GOOG exists');
            assert.exists(res.body.stockData[1].price, 'Price for AAPL exists');
            assert.exists(res.body.stockData[0].rel_likes, 'rel_likes exist');
            assert.exists(res.body.stockData[1].rel_likes, 'rel_likes exist');
            done();
          });
      });

  });
});
