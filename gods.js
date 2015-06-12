
//Libraries and Dependencies
//--------------------------
//This bot works by scraping the front page of Google News and Sandersweb.net. So we need to use request to make HTTP requests. Cheerio is used to parse the page, and twit as our Twitter API library. 
var cheerio = require('cheerio');
var request = require('request');
var Twit = require('twit');
var T = new Twit(require('./config.js'));

//Timer
//-----
//Run every half hour
setInterval(function() {
  try {
    getTopic();
  }
 catch (e) {
    console.log(e);
  }
}, 500 * 60 * 60);  //every half hour.

//Screen Scraping
//---------------
//Here we gather our raw materials from Google News. We pass a random category code from our array into request. We are then returned a list of topics from that category. For example, if we pass 'tc' for technology, we might get back "Android", or "The Internet". We then grab a random topic from that list and store it in our variable called topic. Function getQuote is then called.
function getTopic(){
var baseURL = 'http://news.google.com';    
var categoryCodes = ['n', 'b', 'tc', 'e', 's'];
var category = categoryCodes[Math.floor(Math.random()*categoryCodes.length)];    
request(baseURL + '/news/section?ned=us&topic=' + category, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        var $ = cheerio.load(body);
        var topics = $('.topic');
        topic = topics.eq(Math.floor(Math.random()*topics.length)).text();
        getQuote();
    }
        });
}

//We then scrape http://www.sandersweb.net' for a random bible quote that is generated everytime the page loads. The bible quote is then stored in variable quote. We added some if/else statements to filter through some quotes that were not working for us.
function getQuote(){
    var request = require('request');
    request('http://www.sandersweb.net/bible/verse.php', function (error, response, body) {
      if (!error && response.statusCode == 200) {
            var $ = cheerio.load(body);
            var quotes = $('.esv-text');
            quote = quotes.text();
                
                if(/(jesus|christ)/i.test(quote)){
                    getQuote();
                }
                else if(quote.toLowerCase().indexOf("the lord") > -1){
                    craft();
                }
                else{
                    getQuote();
                }
            }
    });
}
    
//The Crafting Table
//--------------
//We pass craft() our quote and topic variables. We then find all instances of 'the lord'/'The Lord' in our quote and replace that with our var topic. We then remove/replace any unnecessary sub-strings. We then store the result in variable output, and call tweet().
function craft(){
    var str = quote;
    var str = str.replace(/([0-9]|-|\[|\]|)/g, '');
    var str = str.replace(/(\r\n|\n|\r)/gm,' ');
    var find = 'the Lord';
    var re = new RegExp(find, 'g');
    str = str.replace(re, topic);
    var find = 'The Lord';
    var re = new RegExp(find, 'g');
    str = str.replace(re, topic);
    topic = topic.replace(/\s+/g, '');
    output = str + '\n' + ' #' + topic;
    console.log(output + '\n'); 
    tweet();
} 

//Tweeting
//--------
//This is our tweet function. It checks to see if our output is less than 160 characters (Twitter character limit), if it is we go ahead and post our tweet. If it is not we call craft() and try again.

function tweet(){
    if(output.length < 160){
        T.post('statuses/update', { status: output}, function(err, data, response) {
        })
    }
    else{
        getTopic();   
    }
}
