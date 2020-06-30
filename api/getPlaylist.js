function getPlaylist(scrobbles, years, plays, number) {
    return new Promise( (resolve, reject) => {
        var yearDate = new Date();
        yearDate.setFullYear(yearDate.getFullYear() - years);
        console.log(yearDate);
    
        let newArray = [];
    
        scrobbles.filter((x) => {
            return x.values.some((y) => {
                // console.log(y.value.count)
                return y.value.count >= plays && y.value.date <= yearDate
            })
        }).map((x) => ({
            key: x.key,
            values: x.values.filter((y) => {
                return y.value.count >= plays && y.value.date <= yearDate
            })
        })).forEach((x) => {
            x.values.forEach((y) => {
                newArray.push({
                    artist: x.key,
                    track: y.key,
                    count: y.value.count,
                    date: y.value.date,
                    shuffle: Math.random()
                })
            })
        })
    
        newArray = newArray
            .sort((a, b) => {
                return a.shuffle - b.shuffle
            })
            .slice(0, number - 1)

        resolve(newArray);
    })

   

}

module.exports = getPlaylist