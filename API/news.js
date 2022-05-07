const axios = require('axios');

module.exports.response = async function () {
  try {
    const response = await axios.get('https://newsapi.org/v2/everything?q=movie&apiKey=cc2498daed3b4ce188707359c93f1970');
    return response.data.articles;
  } catch (error) {
    console.error(error);
  }
}


