var express = require('express');
var request = require('request');
var app = express();

// Variables Used For Spotify Authorization
var accessToken;
var userId;

// Returns the value of a query key from a request object
function getQueryStringValue (key,req) {
  return decodeURIComponent(req.headers.referer.replace(new RegExp("^(?:.*[&\\?]" + encodeURIComponent(key).replace(/[\.\+\*]/g, "\\$&") + "(?:\\=([^&]*))?)?.*$", "i"), "$1"));
}

// Given a list of tracks, adds each track to a spotify plalist
function addTracksToPlayList(topTracks, playListId, callBack) {

  var urlTracks = [];
  // Loops through each track and adds the necessary beginning string
  for(var i=0; i < topTracks.length; i++) {
    urlTracks.push("spotify:track:" + topTracks[i]);
  }

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

// Creates a new spotify playlist
function createPlayList(callBack) {

  var playlistDescription = "My new favourite playlist!";
  var playlistName = "Sonera Playlist" ;

  var createPlaylistOptions = {
    url: 'https://api.spotify.com/v1/users/' + userId + '/playlists',
    headers: { 'Authorization': 'Bearer ' + accessToken,
    'Content-Type' : 'application/json'},
    body: {
      "description": playlistDescription,
      "public": false,
      "name": playlistName
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

// Iterates through an array and removes all instances of a value from it
function recursiveRemoveElement(array, containingValue) {
  if(array.indexOf(containingValue)==1) {
    array.splice(array.indexOf(containingValue), 1);
    console.log('Removed Something');
    return recursiveRemoveElement(array, containingValue);
  } else {
    return;
  }
}

// Returns an array, with each song by a unique artist
function getTopTrackForArtists(newArtists, callBack) {
  var topTrackForEachArtist = [];

  // If the array is empty, return an error message
  if(newArtists.length===0){
    callBack(0);
  } else {
    // Sets the playlist length at a max of 30
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
        if(topTrackForEachArtist.length ===playListLength) {
          callBack(topTrackForEachArtist);
        }
      });
    }
  }
}

// Checks if any original top artists are reoccurring in the array
function checkIfAnyOriginalArtists(newRelatedArtists, oldTopArtists, callBack) {
  for(var i =0; i <oldTopArtists.length; i++) {
    if(newRelatedArtists.indexOf(oldTopArtists[i])==1) {
      console.log("Found Something to Remove");
      recursiveRemoveElement(newRelatedArtists,oldTopArtists[i]);
    }
  }
  if(i=== oldTopArtists.length){
    callBack(newRelatedArtists);
  }
}

// Gathers the related artists based on a users interests
function getRelatedArtists(body, callBack) {
  var relatedArtists = [];
  var counter = 0;
  body.map((artist)=> {

    var relatedArtistOptions = {
      url: 'https://api.spotify.com/v1/artists/' + artist + '/related-artists',
      headers: { 'Authorization': 'Bearer ' + accessToken,
      'Accept' : 'application/json'},
      json: true
    };

    request.get(relatedArtistOptions, (error, response, newBody) => {
          counter++;
          for(var i =0; i <newBody.artists.length; i++) {
            if(relatedArtists.indexOf(newBody.artists[i].id) === -1) {
              relatedArtists.push(newBody.artists[i].id);
              if(counter === body.length){
                i = 200;
                callBack(relatedArtists);
              }
            }
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
      var items = body.items;
      var artists = items.map((item)=>item.id);
      callBack(artists);
    } else {
      console.log(res.statusCode);
    }
  });
}

// Generates a autorization code for spotify access
function getAuthorizationCode(req,res,error, callBack) {

  var code = getQueryStringValue('code', req);
  var state = getQueryStringValue('state', req);
  var redirectUri = 'http://localhost:3000/recommendations';
  var clientId = '93890ab4495748f8855653bad0ce2e68';
  var clientSecret = '78c8ab8fa1944786bc230de483841ef3';

  var authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(clientId + ':' + clientSecret).toString('base64'))
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

app.get('/recommendations', function(req,res,error) {
  getAuthorizationCode(req,res,error, function(authCodeBody){
    console.log('Got Code');
    getTopArtists(authCodeBody, function(topArtistsBody) {
      console.log('Got Top Artists');
      getRelatedArtists(topArtistsBody, function(relatedArtists) {
        console.log('Got Related Artists');
        checkIfAnyOriginalArtists(relatedArtists,topArtistsBody, function(newOriginalArtists){
          console.log('Removed Original Artists');
          getTopTrackForArtists(newOriginalArtists, function(topTrackForEachArtist){
            console.log('Got Top Tracks For Unique Artists');
            getUserID(function() {
              console.log('Got User ID');
              createPlayList(function(playListId) {
                console.log('Made New PLaylist');
                addTracksToPlayList(topTrackForEachArtist, playListId, function() {
                  console.log('Added Tracks To Playlist');
                  res.json({message: 'Playlist Created'});
                });
              });
            });
          });
       })
      });
    });
  });
});


const port = 3001;
app.listen(port, () => {
  console.log('Listening on port ' + port);
});
