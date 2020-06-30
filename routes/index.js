var express = require('express');
var router = express.Router();
var request = require('request'); // "Request" library
var cors = require('cors');
var querystring = require('querystring');
var cookieParser = require('cookie-parser');


var client_id = process.env.clientId; // Your client id
var client_secret = process.env.clientSecret; // Your secret
var redirect_uri = 'http://localhost:3000/callback'; // Your redirect uri

var goSpotify = require('../api/goSpotify'),
    getLastfm = require('../api/getLastfm'),
    getPlaylist = require('../api/getPlaylist')

/* GET home page. */
router.get('/', function (req, res, next) {
    res.render('form')
       
})

router.post('/postForm', function(req, res, next) {
    console.log(req.body)
    var enterYears = req.body.enterYears,
        enterPlays = req.body.enterPlays,
        enterLength = req.body.enterLength

    getLastfm()
        .then( (scrobbles) => {
            console.log(scrobbles.length + " scrobbles found")
            getPlaylist(scrobbles, enterPlays, enterYears, enterLength)
                .then( (playlist) => {
                    goSpotify(playlist)
                    .then( (spotId) => {
                        res.render('playlist', {spotId: spotId})
                    })
                })
            
        })

    

    // console.log(req)
})


router.get('/login', (req, res) => {
  
    // your application requests authorization
    var scope = 'playlist-modify-private playlist-modify-public';
    res.redirect('https://accounts.spotify.com/authorize?' +
        'response_type=code' +
        '&client_id=' + client_id + 
        '&scope=' + scope +
        '&redirect_uri=' + redirect_uri)
})

router.get('/callback', (req, res) => {
    /* Read query parameters */
    var code = req.query.code; // Read the authorization code from the query parameters
    var state = req.query.state || null;
    // var storedState = req.cookies ? req.cookies[stateKey] : null;
    // console.log(storedState);
    // if (state === null || state !== storedState) {
        // res.redirect('/#' +
        //   querystring.stringify({
            // error: 'state_mismatch'
        //   }));
    //   } else {
        // res.clearCookie(stateKey);
        var authOptions = {
          url: 'https://accounts.spotify.com/api/token',
          form: {
            code: code,
            redirect_uri: redirect_uri,
            grant_type: 'authorization_code'
          },
          headers: {
            'Authorization': 'Basic ' + (new Buffer(client_id + ':' + client_secret).toString('base64'))
          },
          json: true
        };

        // console.log(authOptions);
        request.post(authOptions, function(error, response, body) {
            
            
            if (!error && response.statusCode === 200) {
                console.log("this bit worked? " + response.statusCode)
                console.log("Access code: " + body.access_token)
              var access_token = body.access_token,
                  refresh_token = body.refresh_token;

            // console.log(access_token)
      
              var options = {
                url: 'https://api.spotify.com/v1/me',
                headers: { 'Authorization': 'Bearer ' + access_token },
                json: true
              };
      
              // use the access token to access the Spotify Web API
              request.get(options, function(error, response, body) {
                console.log(body);
              });
      
              // we can also pass the token to the browser to make requests from there
            //   res.redirect('/#' +
            //     querystring.stringify({
            //       access_token: access_token
            //     }));
            } else {
              res.redirect('/#' +
                querystring.stringify({
                  error: 'invalid_token'
                }));
            }
          });
        // }
});

module.exports = router;