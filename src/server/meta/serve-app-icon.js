const content = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>Ap</title><rect width="40" height="40" style="fill:#4caf50"/><path d="M17.0957,21.9561l-1.68,5.0878h-2.16L18.752,10.8672h2.5205l5.52,16.1767H24.5605L22.832,21.9561ZM22.4,20.3237l-1.5845-4.6562c-.36-1.0562-.6-2.0161-.84-2.9522h-.0484c-.24.96-.5039,1.9439-.8159,2.9283l-1.584,4.68Z" style="fill:#fff"/></svg>`;

module.exports = exports = function (req, res, next) {
  if (req.url.indexOf("/meta/icons/app.svg") !== 0) return next();
  res.writeHead(200, {
    "Content-Type": "image/svg+xml"
  });
  res.end(content);
};
