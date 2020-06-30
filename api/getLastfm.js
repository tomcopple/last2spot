
 function getLastfm() {
     return new Promise( (resolve, reject) => {
        const csv = require('csv-parser');
        const fs = require('fs');
        const d3 = require('d3');
        
    
        function getCSV() {
            return new Promise( (resolve, reject) => {
                var scrobbles = [];
                fs.createReadStream('./data/tracks.csv')
                .pipe(csv())
                .on('data', (data) => scrobbles.push(data))
                .on('end', () => {
                    console.log(scrobbles.length)
                    resolve(scrobbles);
            
            })
            })
                
            
        }
        
        async function getSummary() {
            var scrobbles = await getCSV();
            var results = await d3.nest()
                .key(function (d) { return d.artist })
                .key(function(d) { return d.track })
                .rollup(function(v) {
                    return {
                        count: v.length,
                        date: d3.max(v, function(d) { 
                            return new Date(d.date) })
                    }
                })
                .entries(scrobbles) 
            
                return results;
        }
    
        var results = getSummary();
        resolve(results);
        
     })
    
    
 
}

module.exports = getLastfm

