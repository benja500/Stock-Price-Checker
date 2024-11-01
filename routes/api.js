'use strict';

let fetch; // Declarar la variable fetch

(async () => {
  fetch = (await import('node-fetch')).default; // Importación dinámica
})();

let likes = {}; // Almacenará los "me gusta" por acción
let ipLikes = {}; // Almacenará los "me gusta" por IP

module.exports = function (app) {
  app.route('/api/stock-prices')
    .get(async (req, res) => {
      const { stock, like } = req.query;
      const stocks = Array.isArray(stock) ? stock : [stock];

      const stockData = await Promise.all(stocks.map(async (ticker) => {
        const response = await fetch(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${ticker}/quote`);
        const data = await response.json();

        // Manejo de "me gusta"
        if (like) {
          // Anonimiza la IP
          const ip = req.ip;

          if (!ipLikes[ip]) {
            ipLikes[ip] = {};
          }

          if (!ipLikes[ip][ticker]) {
            ipLikes[ip][ticker] = true;
            if (!likes[ticker]) {
              likes[ticker] = 1;
            } else {
              likes[ticker]++;
            }
          }
        }

        return {
          stock: ticker,
          price: data.latestPrice,
          likes: likes[ticker] || 0
        };
      }));

      if (stocks.length === 2) {
        const relLikes = likes[stocks[0]] - likes[stocks[1]];
        res.json({
          stockData: [
            { stock: stocks[0], price: stockData[0].price, rel_likes: relLikes },
            { stock: stocks[1], price: stockData[1].price, rel_likes: -relLikes }
          ]
        });
      } else {
        res.json({ stockData: stockData[0] });
      }
    });
};
