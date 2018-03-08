var FB = require('fb');
var request = require('superagent');
var _ = require('lodash');
var moment = require('moment');
var nextFunc = null;
var time = null;
var date = null;
var accesstoken = null;
var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

array = [];

function getter(data) {
  if(data){
    data.map((object) => {
        shares = object.shares ? object.shares.count : '';
        tag = object.sponsor_tags ? object.sponsor_tags.data[0].name : "null";
        array.push({ reactions: object.reactions.summary.total_count, comment: object.comments.summary.total_count, permalink_url: object.permalink_url, link: object.link , type: object.type , shares: shares, tag: tag, created_time: object.created_time});
    })
  } else {
      console.log("data is 0")
  }
}

i = 0;

function call(next) {
  request
      .get(next)
      .end((err, res) => {
          if (err) throw err
          parsed = JSON.parse(res.text)
          next = parsed.paging.next
          getter(parsed.data);
          if (next)
              call(next);
          else
              sorter();
      });
}

function sorter() {
  sorted = _.sortBy(array, a=>a.created_time).reverse();
  nextFunc(null, sorted)
}

var index = function (pagename, date, tdate, time, ttime, token, nextFunction){

    if(token != ""){
        accesstoken = token;
        FB.setAccessToken(accesstoken);
    }

    time = moment( time + ":00", ["Hms"]).format("hh:mm:ss A");
    ttime = moment( ttime + ":00", ["Hms"]).format("hh:mm:ss A");

    date = date.split('-');
    var timestamp = Date.parse(date[2] + ' ' + months[parseInt(date[1]) - 1] + ' ' + date[0] + ' ' + time + " GMT")

    tdate = tdate.split('-');
    var ttimestamp = Date.parse(tdate[2] + ' ' + months[parseInt(tdate[1]) - 1] + ' ' + tdate[0] + ' ' + ttime + " GMT");

    nextFunc = nextFunction;
    array = [];

    FB.api(
      '/v2.11/' + pagename + '/posts',
      'GET',
      { "fields": "id,created_time,permalink_url, link, type, sponsor_tags, reactions.summary(true).limit(0),shares,comments.summary(true).limit(0)", "limit": "100", "since": timestamp/1000, "until": ttimestamp/1000},
      function (response) {
          if(response.error){
              if(response.error.code === 190 && response.error.error_subcode === 463){
                nextFunction({message: "Token expired", code: 190463})
              } else if(response.error.code === 190){
                nextFunction({message: "Invalid token", code: 190})
              } else {
                nextFunction(response.error)
              }
          }

          if(!response.error){
            getter(response.data)
            if(response.paging){
                var next = response.paging.next;
                if (next){
                    call(next);
                }
                else
                    sorter();
            }
          }
      }
    );
  }

module.exports = {
    index: index
};