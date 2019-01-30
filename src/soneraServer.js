var express = require('express');
var request = require('request');
var app = express();

var accessToken;
var userId;

const PORT = 3001;
const PLAYLIST_DESCRIPTION = "My new favourite playlist!";
const PLAYLIST_NAME = "Sonera Playlist";
const REDIRECT_URI = '';
const CLIENT_ID = '';
const CLIENT_SECRET = '';

app.get('/recommendations', function(req,res,error) {
  getRecommendations(req,res,error);
});

app.listen(PORT, () => console.log('Listening on port ' + PORT));

function getAuthCode(req,res,error, callBack) {

  var code = getQueryStringValue('code', req);
  var state = getQueryStringValue('state', req);

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: REDIRECT_URI,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(CLIENT_ID + ':' + CLIENT_SECRET).toString('base64'))
    },
    json: true
  };

  request.post(authOptions, function(err, res, body) {
    if(res.statusCode === 200) {
      callBack(body);
    } else {
      console.log("Error Code:  " + res.statusCode);
    }
  });
}

function addTracksToPlayList(topTracks, playListId, callBack) {

  var urlTracks = [];
  topTracks.map(t => urlTracks.push("spotify:track:" + t));

  var addPlayListTracks = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists/' + playListId + '/tracks',
    headers: { 'Authorization': 'Bearer ' + accessToken,
    'Content-Type' : 'application/json'},
    body: {
      "uris": urlTracks
    },
    json: true
  }

  request.post(addPlayListTracks, function(err,res,body) {
    callBack();
  });
}

function createPlayList(callBack) {

  var createPlaylistOptions = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
    headers: { 'Authorization': 'Bearer ' + accessToken,
    'Content-Type' : 'application/json'},
    body: {
      "description": PLAYLIST_DESCRIPTION,
      "public": false,
      "name": PLAYLIST_NAME
    },
    json: true
  }

  // passes in the playlist id number to the callBack function
  request.post(createPlaylistOptions, function(err,res,body) {
    callBack(body.id);
  });
}

// Retreives the current users spotify ID
function getUserID(callBack) {

  var userIdOptions = {
    url: 'https://api.spotify.com/v1/me',
    headers: { 'Authorization': 'Bearer ' + accessToken,
    'Accept' : 'application/json'},
    json: true
  };

  request.get(userIdOptions, function(err,res,body) {
    userId = body.id;
    callBack();
  });
}

// Returns an array, with each song by a unique artist
function getTopTrackForArtists(newArtists, callBack) {
  var topTrackForEachArtist = [];
  var playListLength = newArtists.length > 30 ?  30 : newArtists.length;

  // Loops through each artist and adds one song from each to the playlist
  for(var i=0; i <playListLength; i++) {
    var topTrackForArtistOption = {
      url: 'https://api.spotify.com/v1/artists/' + newArtists[i] + '/top-tracks?country=CA',
      headers: { 'Authorization': 'Bearer ' + accessToken,
      'Accept' : 'application/json'},
      json: true
    };

    request.get(topTrackForArtistOption, function(err,res,body) {
      topTrackForEachArtist.push(body.tracks[0].id);

      // Once the playlist has finished being built continue
      if(topTrackForEachArtist.length === playListLength) {
        callBack(topTrackForEachArtist);
      }
    });
  }
}

// Gathers the related artists based on a users interests
function getRelatedArtists(topArtists, callBack) {
  var relatedArtists = [];
  var loopCounter = 0;

  topArtists.map((artist)=> {

    var relatedArtistOptions = {
      url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
      headers: { 'Authorization': 'Bearer ' + accessToken,
      'Accept' : 'application/json'},
      json: true
    };

    request.get(relatedArtistOptions, (error, response, newBody) => {
          loopCounter++;
          newBody.artists.filter(a => !relatedArtists.includes(a.id) && !topArtists.includes(a.id))
                         .map(a => relatedArtists.push(a.id));
          if(loopCounter === topArtists.length){
            callBack(relatedArtists);
          }
    });
  });
}

// Returns the top Artists for a specific user
function getTopArtists(body, callBack) {
  var refreshToken = body.refresh_token;
      accessToken = body.access_token;
  var options = {
    url: 'https://api.spotify.com/v1/me/top/artists',
    headers: { 'Authorization': 'Bearer ' + accessToken,
    'Accept' : 'application/json'},
    json: true
  };

  request.get(options, function(err, res, body) {
    if(res.statusCode === 200) {
      var artists = body.items.map((item)=>item.id);
      callBack(artists);
    } else {
      console.log(res.statusCode);
    }
  });
}

// Returns the value of a query key from a request object
function getQueryStringValue (key,req) {
  return decodeURIComponent(req.headers.referer.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

function getRecommendations(req,res,error) {
  getAuthCode(req,res,error, function(authCodeBody){
    getTopArtists(authCodeBody, function(topArtistsBody) {
      getRelatedArtists(topArtistsBody, function(relatedArtists) {
        getTopTrackForArtists(relatedArtists, function(topTrackForEachArtist){
          getUserID(function() {
            createPlayList(function(playListId) {
              addTracksToPlayList(topTrackForEachArtist, playListId, function() {
                console.log('Added Tracks To Playlist');
                res.json({message: 'Playlist Created'});
              })
            })
          })
        })
      })
    })
  });
}