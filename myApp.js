const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// instantiate connection to db named 'url'
mongoose.connect(process.env.MONGO_URI,
                 {useNewUrlParser: true,
                  dbName: 'url'})
  .then(() => console.log("Connection succesful!"))
  .catch(err => console.log(err.message));

// make a db-wide counter schema
let counterSchema = new Schema({
  count: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

// make Counter model
let Counter = mongoose.model('Counter', counterSchema);

// make url counter
let urlCounter = new Counter();

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
    required: true,
    default: urlCounter.count
  }
});

// increment counter pre url save
urlMapSchema.post('save', () => {
  console.log("Hitting post save")
  urlCounter.count = urlCounter + 1;
});

// make url model
let UrlMap = mongoose.model('UrlMap', urlMapSchema);

// save url


const postUrl = (url, done) => {
  let newMap = new UrlMap({
    originalUrl: url,
    short_url: urlCounter.count
  });
  newMap.save((err, doc) => err
             ? done(err)
             : done(null, doc));
};

exports.PostUrl = postUrl;