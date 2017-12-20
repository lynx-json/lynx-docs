var svg = "image/svg+xml";

var images = {
  "/meta/icons/app.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>Ap</title><rect width="40" height="40" style="fill:#4caf50"/><path d="M17.0957,21.9561l-1.68,5.0878h-2.16L18.752,10.8672h2.5205l5.52,16.1767H24.5605L22.832,21.9561ZM22.4,20.3237l-1.5845-4.6562c-.36-1.0562-.6-2.0161-.84-2.9522h-.0484c-.24.96-.5039,1.9439-.8159,2.9283l-1.584,4.68Z" style="fill:#fff"/></svg>`
  },
  "/meta/icons/meta.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>Mt</title><rect width="40" height="40" style="fill:#f4511e"/><path d="M25.8086,19.94c-.12-2.2563-.2637-4.9687-.2393-6.9848h-.0722c-.5528,1.8965-1.2246,3.9126-2.04,6.1445l-2.8559,7.8486h-1.584L16.4,19.2437c-.7681-2.28-1.416-4.3682-1.8721-6.2886h-.0478c-.0479,2.0161-.168,4.7285-.312,7.1528l-.4322,6.936H11.7441l1.128-16.1767h2.6645l2.76,7.8247c.6723,1.9922,1.2241,3.7681,1.6323,5.4477h.0713c.4082-1.6318.9844-3.4077,1.7036-5.4477l2.8809-7.8247h2.664l1.0078,16.1767h-2.04Z" style="fill:#fff"/></svg>`
  },
  "/meta/icons/meta-down.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>MtDn</title><rect width="40" height="40" style="fill:#f4511e"/><path d="M25.8086,19.94c-.12-2.2563-.2637-4.9687-.2393-6.9848h-.0722c-.5528,1.8965-1.2246,3.9126-2.04,6.1445l-2.8559,7.8486h-1.584L16.4,19.2437c-.7681-2.28-1.416-4.3682-1.8721-6.2886h-.0478c-.0479,2.0161-.168,4.7285-.312,7.1528l-.4322,6.936H11.7441l1.128-16.1767h2.6645l2.76,7.8247c.6723,1.9922,1.2241,3.7681,1.6323,5.4477h.0713c.4082-1.6318.9844-3.4077,1.7036-5.4477l2.8809-7.8247h2.664l1.0078,16.1767h-2.04Z" style="fill:#fff"/><polygon points="39 39 38.998 25.667 25.667 38.998 39 39" style="fill:#fff"/></svg>`
  },
  "/meta/icons/meta-here.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>Mt</title><rect width="40" height="40" style="fill:#f4511e"/><path d="M25.8086,19.94c-.12-2.2563-.2637-4.9687-.2393-6.9848h-.0722c-.5528,1.8965-1.2246,3.9126-2.04,6.1445l-2.8559,7.8486h-1.584L16.4,19.2437c-.7681-2.28-1.416-4.3682-1.8721-6.2886h-.0478c-.0479,2.0161-.168,4.7285-.312,7.1528l-.4322,6.936H11.7441l1.128-16.1767h2.6645l2.76,7.8247c.6723,1.9922,1.2241,3.7681,1.6323,5.4477h.0713c.4082-1.6318.9844-3.4077,1.7036-5.4477l2.8809-7.8247h2.664l1.0078,16.1767h-2.04Z" style="fill:#fff"/><rect x="1" y="1" width="38" height="38" style="fill:none;stroke:#fff;stroke-miterlimit:10"/></svg>`
  },
  "/meta/icons/meta-up.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>MtUp</title><rect width="40" height="40" style="fill:#f4511e"/><path d="M25.8086,19.94c-.12-2.2563-.2637-4.9687-.2393-6.9848h-.0722c-.5528,1.8965-1.2246,3.9126-2.04,6.1445l-2.8559,7.8486h-1.584L16.4,19.2437c-.7681-2.28-1.416-4.3682-1.8721-6.2886h-.0478c-.0479,2.0161-.168,4.7285-.312,7.1528l-.4322,6.936H11.7441l1.128-16.1767h2.6645l2.76,7.8247c.6723,1.9922,1.2241,3.7681,1.6323,5.4477h.0713c.4082-1.6318.9844-3.4077,1.7036-5.4477l2.8809-7.8247h2.664l1.0078,16.1767h-2.04Z" style="fill:#fff"/><polygon points="1 1 1.002 14.333 14.333 1.002 1 1" style="fill:#fff"/></svg>`
  },
  "/meta/icons/template.svg": {
    type: svg,
    content: `<svg id="Layer_1" data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><title>T</title><rect width="40" height="40" style="fill:#2196f3"/><path d="M18.9321,12.6431h-4.92V10.8672H25.9893v1.7759H21.0449V27.0439H18.9321Z" style="fill:#fff"/></svg>`
  },
  "/favicon.ico": {
    type: "image/x-icon",
    base64: true,
    content: `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AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=`
  },
  "/lynx-icon.png": {
    type: "image/png",
    base64: true,
    content: `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`
  }
};

module.exports = exports = function (req, res, next) {
  var image = images[req.url];
  if (!image) return next();
  
  res.writeHead(200, {
    "Content-Type": image.type
  });
  
  if (image.base64) {
    res.end(new Buffer(image.content, "base64"));
  } else {
    res.end(image.content);
  }
};
