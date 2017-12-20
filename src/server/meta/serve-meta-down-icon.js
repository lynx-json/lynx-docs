const content = `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>MtDn</title><rect width="40" height="40" style="fill:#f4511e"/><path d="M25.8086,19.94c-.12-2.2563-.2637-4.9687-.2393-6.9848h-.0722c-.5528,1.8965-1.2246,3.9126-2.04,6.1445l-2.8559,7.8486h-1.584L16.4,19.2437c-.7681-2.28-1.416-4.3682-1.8721-6.2886h-.0478c-.0479,2.0161-.168,4.7285-.312,7.1528l-.4322,6.936H11.7441l1.128-16.1767h2.6645l2.76,7.8247c.6723,1.9922,1.2241,3.7681,1.6323,5.4477h.0713c.4082-1.6318.9844-3.4077,1.7036-5.4477l2.8809-7.8247h2.664l1.0078,16.1767h-2.04Z" style="fill:#fff"/><polygon points="39 39 38.998 25.667 25.667 38.998 39 39" style="fill:#fff"/></svg>`;

module.exports = exports = function (req, res, next) {
  if (req.url.indexOf("/meta/icons/meta-down.svg") !== 0) return next();
  res.writeHead(200, {
    "Content-Type": "image/svg+xml"
  });
  res.end(content);
};
