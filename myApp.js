const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const dns = require('dns');

// helper function to make/show counter if it's not previously found
// in the db, but just show it if it is in the db
const notMadeThenMakeShowElseShow = (counter) => {
  if (!counter) {
    console.log("No counter found, making new one...");
    counter = new Counter({ _id: 'url_count' });
    console.log(`Made new counter: ${counter}`);
    counter.save((err, counter) =>
                err ?
                console.log(`Error in ${this}: ${err}`) :
                console.log(`Succesful save of ${counter}`))
  } else {
    console.log(`Previous counter found: ${counter}`)
  }
}


// make a db-wide counter schema
let counterSchema = new Schema({
  _id: {
    type: String,
    required: true,
  },
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

// make Counter model
let Counter = mongoose.model('Counter', counterSchema);

// make a url schema
let urlMapSchema = new Schema({
  originalUrl: {
    type: String,
    lowercase: true,
    required: true
  },
  short_url: {
    type: Number,
    unique: true,
    required: true
  }
});

// increment counter pre url save
urlMapSchema.pre('save', () => {
  console.log("Hitting pre save")
  Counter.findByIdAndUpdate(
    'url_count',
    { $inc: { count: 1 }},
    (err, counter) =>
    err ?
    console.log(`Error in pre-save: ${err}`) :
    console.log(`Success in pre-save: ${counter}`));
});

// make url model
let UrlMap = mongoose.model('UrlMap', urlMapSchema);

// save url


// instantiate connection to db named 'url'
mongoose.connect(process.env.MONGO_URI,
                 {useNewUrlParser: true,
                  dbName: 'url'})
  .then(() => console.log("Connection succesful!"))
  .then(() => {
    Counter.findById('url_count', (err, counter) => {
      if (err) {
        console.log(`Err in findByID(): ${err}`);
      } else {
        notMadeThenMakeShowElseShow(counter);
      }
    })
  })
  .catch(err => console.log(err.message));

// urlCounter
const urlCounterFind = (done) => Counter.findById('url_count', done);

// hit when get req hits '/api/db/:url?'
const postUrl = (url, done) => {
  UrlMap.findOne(
    {originalUrl: url},
    (err, urlMap) => {
      if (err) {
        console.log(err)
      } else {
        if (!urlMap) {
          urlCounterFind((err, counter) => {
            if (err) {
              console.log(err)
            } else {
              dns.lookup(
                url,
                {verbatim: true},
                (err, address, family) => {
                  if (err) {
                    console.log("Err in dns.lookup: ", err)
                    return done(null, {error: "invalid URL"})
                  } else {
                    (new RegExp(/^[\w]+\:\/\//)).test(url) ?
                    url = url :
                    url = "http://" + url
                    let newMap = new UrlMap({
                      originalUrl: url,
                      short_url: counter.count
                    });
                    newMap.save((err, urlMap) => err
                               ? done(err)
                               : done(null, urlMap));
                }
              })
            }
          })
        } else {
          done(null, urlMap)
        }
      }
})};

// method hit when user gets with short_url
const redirectWithShortUrl = (shortUrl, done) => {
  console.log("inside redirect", typeof shortUrl)
  UrlMap.findOne(
    {short_url: shortUrl},
    (err, urlMap) => {
      err ?
      console.log(err) :
      !urlMap ?
      done(null, {error: "This is short url hasn't been created yet"}) :
      done(null, urlMap.originalUrl)
    });
}

exports.GetShortUrl = redirectWithShortUrl;
exports.PostUrl = postUrl;