require('dotenv').config();
const express = require('express');
const cors = require('cors');
// const shortid = require('shortid');
const app = express();
const { MongoClient } = require('mongodb');

const client = new MongoClient(process.env.MONGO_URI);
const db = client.db('url-shortener');
const urls = db.collection('urls');

// const dns = require('dns');
// const urlParser = require('url'); 

const port = process.env.PORT || 3000;

// const urlDatabase = []; 

//method for validating URL
const validateURL = (url) => {
  const urlPattern = new RegExp('^(https?:\\/\\/)?'+ // validate protocol
  '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+ // validate domain name
  '((\\d{1,3}\\.){3}\\d{1,3}))'+ // validate OR ip (v4) address
  '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // validate port and path
  '(\\?[;&a-z\\d%_.~+=-]*)?'+ // validate query string
  '(\\#[-a-z\\d_]*)?$','i');

  return !!urlPattern.test(url);
}

app.use(cors());

app.use('/public', express.static(`${process.cwd()}/public`));

app.get('/', (req, res) => {
  res.sendFile(process.cwd() + '/views/index.html');
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.post('/api/shorturl', async (req, res) => {
  const url = req.body.url;
  // const shortUrlId = urlDatabase.length;
  if (validateURL(req.body.url)){
    const urlCount = await urls.countDocuments({});
    const urlDoc = { url, short_url: urlCount};
    await urls.insertOne(urlDoc);
    res.json({original_url: url, short_url: urlCount});
  } else {
    res.json({ error: 'Invalid url' });
  }

  // Alternate method of validating URL - dns lookup
  // dns.lookup(urlParser.parse(url).hostname, async (err, address) => {
  //   if (!address){
  //     res.json({error: 'Invalid URL'});
  //   } else {
  //     const urlDoc = { original_url: url, short_url: shortUrlId };
  //     urlDatabase.push(urlDoc);
  //     res.json({ original_url: url, short_url: shortUrlId });
  //   }
  // })

});

app.get('/api/shorturl/:short_url', async (req, res) => {
  const shortUrl = req.params.short_url;
  const urlDoc = await urls.findOne({ short_url: +shortUrl });
  res.redirect(urlDoc.url);

  // For the alternate method - When using a normal array instead of a database
  // if (shortUrl < urlDatabase.length){
  //   let urlObj = urlDatabase[shortUrl];
  //   res.redirect(urlObj.original_url);
  // }else {
  //   res.json({error: 'Index not found'});
  // }
  
});

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
