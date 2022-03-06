const visit = require("unist-util-visit-parents");
const cheerio = require("cheerio");

module.exports = ({ markdownAST }) => {
  const htmls = [];
  visit(markdownAST, "html", (node) => {
    htmls.push(node);
  });
  const imageNodes = htmls.filter((html) => html.value.indexOf("<img") >= 0);
  const videoNodes = htmls.filter((html) => html.value.indexOf("<video") >= 0);
  const iframeNodes = htmls.filter(
    (html) => html.value.indexOf("<iframe") >= 0
  );

  return Promise.all([
    ...imageNodes.map(
      (item) =>
        new Promise((resolve) => {
          const $ = cheerio.load(item.value);

          // Add class lazyload
          $("img").addClass("lazy");
          let html = $.html();
          // Replace src to data-src
          html = html.replace("src=", "data-src=");
          // Replace srcset to data-srcset
          html = html.replace("srcset=", "data-srcset=");
          // Replace sizes to data-sizes
          html = html.replace("sizes=", "data-sizes=");

          // console.log("img", html);

          item.value = html;
          resolve(item);
        })
    ),
    ...videoNodes.map(
      (item) =>
        new Promise((resolve) => {
          const $ = cheerio.load(item.value);

          // Add class lazyload
          $("video").addClass("lazy");
          let html = $.html();
          html = html.replace("poster=", "data-poster=");
          html = html.replace("src=", "data-src=");

          // console.log("video", html);

          item.value = html;
          resolve(item);
        })
    ),
    ...iframeNodes.map(
      (item) =>
        new Promise((resolve) => {
          const $ = cheerio.load(item.value);

          $("iframe").addClass("lazy");
          let html = $.html();
          // Replace src to data-src
          html = html.replace("src=", "data-src=");

          // console.log("iframe", html);

          item.value = html;
          resolve(item);
        })
    ),
  ]);
};
