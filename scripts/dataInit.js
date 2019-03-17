console.log('called');

const emotions = ['anger', 'anticipation', 'disgust', 'fear', 'joy', 'sadness', 
                  'surprise', 'trust'];

const dimension = ['intensity', 'valence', 'arousal', 'dominance'];
const shortDim = ['strength', 'val', 'aro', 'dom'];
//const colors = ['#FF0000', '#FFA500', '#800080', '#008000', '#FFFF00', '#0000A0', 
//                '#0000FF', '#4CC552'];

const colors = ['#AB1569', '#FA924A', '#6243C5', '#0D6B65', '#F8F844', '#151EAB', '#1569AB', '#7AC285'];
//const dimColors = ['#AB1569','#15ABA2', '#1569AB', '#A215AB'];

const margin = {
    top: 20,
    right: 20,
    bottom: 20,
    left: 20
};

async function parseFile() {
     episode = await d3.csv('trump_posts_emotions.csv').then(function(data) {
        var dataSrc = [];
        console.log('called');
        data.forEach(function(datum) {
            var pre_date = datum['created_at'].split(/\/|\s|:/g);
            var month = +pre_date[0] - 1;
            var day = +pre_date[1];
            var year = +pre_date[2] + 2000;
            var hour = +pre_date[3];
            var minute = +pre_date[4];
            var emo_mat = datum['emotional_state'].split(/\s|\[|\]/g);
            var vert = 0;
            var horz = 0
            var emo = [];
            for (i = 0; i < 8; i++) {
                emo[i] = [];
            }
            for (i = 0; i < emo_mat.length; i++) {
                if (emo_mat[i].length > 0) {
                    emo[vert][horz] = +emo_mat[i];
                    horz += 1;
                    if (horz > 3) {
                        vert += 1;
                        horz = 0;
                    }
                }
            }
            dataSrc.push({
                date: new Date(year, month, day),
                fullDate: new Date(year, month, day, hour, minute),
                compDate: (new Date(year, month, day)).getTime(),
                tweet: datum['text'],
                RTs: +datum['retweet_count'],
                favs: +datum['favorite_count'],
                isRT: datum['is_retweet'],
                id: +datum['id_str'],
                tags: datum['text_cleaned'].split(/\s/g),
                emotions: emo,
                mood_id: +datum['mood_label'],
                mood_mat: []
            });
        });
        console.log(dataSrc);
        return dataSrc;
    });
    return episode;
}

async function parseMood() {
    //const moodMap = new Map;
    var moodMap = [];
    var keyMap = new Map;
    var parsed = await d3.csv('trump_tweet_moods.csv').then(function(data) {
        var dataSrc = [];
        data.forEach( function(datum, j) {
            var id = +datum['mood_label'];
            var mood_mat = datum['mood_matrix'].split(/\s|\[|\]/g);
            var vert = 0;
            var horz = 0;
            var mood = [];
            for (i = 0; i < 8; i++) {
                mood[i] = [];
            }
            for (i = 0; i < mood_mat.length; i++) {
                if (mood_mat[i].length > 0) {
                    mood[vert][horz] = +mood_mat[i];
                    horz += 1;
                    if (horz > 3) {
                        vert += 1;
                        horz = 0;
                    }
                }
            }
            //keyMap.set(j, id);
            keyMap.set(id, j);
            moodMap.push({idx: id, moodx: mood});
        });
    });
    console.log('moodMap');
    console.log(moodMap);
    console.log('keyMap');
    console.log(keyMap);
    return {moodMap, keyMap};
}

async function volume() {
    const tweets = await parseFile();
    const maps = await parseMood();
    console.log('volume');
    console.log(maps);
    console.log('down');
    var moodMap = maps.moodMap;
    var keyMap = maps.keyMap;
    for (i = 0; i < tweets.length; i++) {
        tweets[i]['mood_mat'] = moodMap[keyMap.get(tweets[i]['mood_id'])]['moodx'];
    }
    console.log(moodMap);
    console.log(tweets);
    var dates = [];
    var comp = []
    var count = [];
    var emotes = [];
    for (i = 0; i < tweets.length; i++) {
        if (comp.includes(tweets[i]['date'].getTime())) {
            var k = comp.indexOf(tweets[i]['date'].getTime());
            count[k] += 1;
            
            for (l = 0; l < 8; l++) {
                for (j = 0; j < 4; j++) {
                    emotes[k][l][j] += tweets[k]['mood_mat'][l][j];
                }
            }
        } else {
            var k = emotes.length;
            emotes[k] = [];
            for (j = 0; j < 8; j++) {
                emotes[k][j] = [];
            }
            dates.push(tweets[i]['date']);
            comp.push(tweets[i]['date'].getTime());
            count.push(1);
            for (l = 0; l < 8; l++) {
                for(j = 0; j < 4; j++) {
                    emotes[k][l][j] = tweets[i]['mood_mat'][l][j];
                }
            }
        }
    }
    
    for (i = 0; i < emotes.length; i++) {
        for (j = 0; j < 8; j++) {
            for (k = 0; k < 4; k++) {
                emotes[i][j][k] /= count[i];
            }
        }
    }

    console.log(count);
    console.log('emotes');
    console.log(emotes);
    return {tweets, dates, count, emotes, comp};
}


