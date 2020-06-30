var request = require('request')

function goSpotify(playlist) {
    return new Promise( (resolve, reject) => {

        var SpotifyWebApi = require('spotify-web-api-node');
        var spotifyAuth = {
            clientId: process.env.clientId,
            clientSecret: process.env.clientSecret,
            redirectUri: 'http://localhost:3000/callback'
        }
        var spotId = '2ErOeUMwj2271dMvM92l3f'
        var newAccessToken = process.env.newAccessToken
        
        var spotifyApi = new SpotifyWebApi(spotifyAuth);
        spotifyApi.setAccessToken(newAccessToken)
        
        spotifyApi
            .clientCredentialsGrant()
            .then(async (data) => {
                var spotTracks = [];
                try {
                    await Promise.all(playlist.map(async (x) => {
                        const newTrack = await spotifyApi.searchTracks(x.artist + " " + x.track)
                        if (newTrack.body.tracks.items[0] !== undefined) {
                            // console.log(newTrack.body.tracks.items[0].id)
                            spotTracks.push("spotify:track:" + newTrack.body.tracks.items[0].id)
                        }
                    }))
                    console.log(spotTracks);
                    console.log(`https://api.spotify.com/v1/playlists/${spotId}/tracks`)
    
                    request.put({
                        uri: `https://api.spotify.com/v1/playlists/${spotId}/tracks`,
                        headers: {
                            'Content-type': 'application/json',
                            'Accept': 'application/json',
                            'Authorization': 'Bearer ' + newAccessToken
                        },
                        body: JSON.stringify({
                            'uris': spotTracks
                        })
    
                    }, function(error, response, body) {
                        if (error) {
                            return console.error('upload failed:', error);
                          }
                          console.log('Upload successful!  Server responded with:', body);
                    })

                    resolve(spotId);
    
    
                } catch (err) {
                    console.log("Error in goSpotify "+ err);
                }
            })
        
    })
}

module.exports = goSpotify