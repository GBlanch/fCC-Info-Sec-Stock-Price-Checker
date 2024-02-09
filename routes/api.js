'use strict';
const StockModel = require('../models').Stock;

import('node-fetch').then((fetch) => {

}).catch((error) => {

  console.error('Failed to import node-fetch:', error);

});

// Create a new stock record, likes being optional
async function createStock(stock, like, ip) {
  const newStock = new StockModel({
    symbol: stock,
    likes: like ? [ip] : [],
  });

  const savedNew = await newStock.save();
  return savedNew;
}

// Find stock data by symbol using async MongoDB query
async function findStock(stock) {
  return await StockModel.findOne({ symbol: stock }).exec();
}

// Save stock data based on existence of stock and likes
async function saveStock(stock, like, ip) {
  let saved = await findStock(stock);

  if (!saved) {
    saved = await createStock(stock, like, ip);

  } else if (like && !saved.likes.includes(ip)) {
    saved.likes.push(ip);
    saved = await saved.save();
  }

  return saved;
}

// Fetch stock data from an external API..
async function getStock(stock) {
  const response = await fetch(
    `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`
  );
//..and extract its symbol and latest price
  const { symbol, latestPrice } = await response.json();
  return { symbol, latestPrice };
}

module.exports = function (app) {

  app.route('/api/stock-prices').get(async function (req, res) {
    const { stock, like } = req.query;

    if (Array.isArray(stock)) {
      console.log('stocks', stock);
      //  Fetch stock data for two different stocks
      const { symbol, latestPrice } = await getStock(stock[0]);
      const { symbol: symbol2, latestPrice: latestPrice2 } = await getStock(
        stock[1]
      );

      const firststock = await saveStock(stock[0], like, req.ip);
      const secondstock = await saveStock(stock[1], like, req.ip);

      let stockData = [];

      // First stock data
      if (!symbol) {
        stockData.push({
          rel_likes: firststock.likes.length - secondstock.likes.length,
        });
      } else {
        stockData.push({
          stock: symbol,
          price: latestPrice,
          rel_likes: firststock.likes.length - secondstock.likes.length,
        });
      }

      // Second stock data
      if (!symbol2) {
        stockData.push({
          rel_likes: secondstock.likes.length - firststock.likes.length,
        });
      } else {
        stockData.push({
          stock: symbol2,
          price: latestPrice2,
          rel_likes: secondstock.likes.length - firststock.likes.length,
        });
      }

      res.json({
        stockData,
      });
      
      return;

    }

    const { symbol, latestPrice } = await getStock(stock);
    if (!symbol) {
      res.json({ stockData: { likes: like ? 1 : 0 } });
      return;
    }

    const oneStockData = await saveStock(symbol, like, req.ip);
    console.log('One Stock Data', oneStockData);

    res.json({
      stockData: {
        stock: symbol,
        price: latestPrice,
        likes: oneStockData.likes.length,
      },
    });

  });
};