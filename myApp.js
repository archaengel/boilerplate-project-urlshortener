const mongoose = require('mongoose');
const Schema = mongoose.Schema;

mongoose.connect(process.env.MONGO_URI,
                 {useNewUrlParser: true,
                  dbName: 'url'})
  .then(() => console.log("Connection succesful!"))
  .catch(err => console.log(err.message));


const postUrl = () => {
  return "in db?"
};

exports.PostUrl = postUrl;