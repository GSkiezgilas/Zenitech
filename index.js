const fs = require('fs');
const https = require('https');
const http = require('http');
const url = require('url');

const replaceTemplate = (temp, item) => {
  let output = temp.replace(/{%AUTHOR%}/g, item.author);
  output = output.replace(/{%IMAGE%}/g, item.download_url);
  return output;
};

const tempHome = fs.readFileSync(`${__dirname}/templates/template_home.html`, 'utf-8');
const tempCard = fs.readFileSync(`${__dirname}/templates/template_card.html`, 'utf-8');
const myUrl = 'https://picsum.photos/v2/list';
let json;

https
  .get(myUrl, (res) => {
    let body = '';

    res.on('data', (chunk) => {
      body += chunk;
    });

    res.on('end', () => {
      try {
        json = JSON.parse(body);
      } catch (error) {
        console.error(error.message);
      }
    });
  })
  .on('error', (error) => {
    console.error(error.message);
  });

const server = http.createServer((req, res) => {
  const { query, pathname } = url.parse(req.url, true);

  if (pathname === '/') {
    res.writeHead(200, { 'Content-type': 'text/html' });
    const cardsHtml = json.map((el) => replaceTemplate(tempCard, el)).join('');
    const output = tempHome.replace('{%CARDS%}', cardsHtml);
    res.end(output);
  } else {
    res.writeHead(404, {
      'Content-type': 'text/html',
    });
    res.end('<h1>Page not found!</h1>');
  }
  res.end('Hello from the server!');
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}!`);
});
