import httpRequest from 'request';

const getTvDetails = (request, h) => {
    const requestedSeriesId = request.params.series_id;

    // Get the details of series, Which contains all the seasons details //
    const GET_SERIES_DETAILS_URL = `https://api.themoviedb.org/3/tv/${requestedSeriesId}?api_key=bbc83949898a3c789991932109990df7&language=en-US`;
    const GET_SERIES_DETAILS_OPTIONS = { json: true };
    return new Promise((resolve, reject) => {
        httpRequest(GET_SERIES_DETAILS_URL, GET_SERIES_DETAILS_OPTIONS, (error, h, body) => {
            if (error) { 
                return error; 
            }

            const { seasons } = body;
            let urls = [];
            let finalResult = [];
            let returnResult = [];
            for(let idx=0; idx < seasons.length;idx++) {
                urls.push(`https://api.themoviedb.org/3/tv/${requestedSeriesId}/season/${seasons[idx].season_number}?api_key=bbc83949898a3c789991932109990df7&language=en-US`); 
            }

            // Get the details of seasons, Which contains all the episode details //
            __request(urls, (responsesFromSea) => {

                // Pick all the episodes from response //
                let result = urls.map((url) => {
                    return JSON.parse(responsesFromSea[url].body).episodes;
                });
            
                for(let idx = 0;idx < result.length;idx++) {
                    finalResult.push(...result[idx]);
                }

                // Pick only required details from episodes //
                finalResult = finalResult.map((resItem) => {
                    let resArray = {
                        'episode_number': resItem.episode_number,
                        'id': resItem.id,
                        'name': resItem.name,
                        'season_number': resItem.season_number,
                        'show_id': resItem.show_id,
                        'vote_average': resItem.vote_average
                    };
                    return resArray;
                });

                // Sort objects //
                finalResult = finalResult.sort((obj1, obj2) => (obj1.vote_average < obj1.vote_average) ? 1 : (obj1.vote_average > obj2.vote_average) ? -1 : 0);
                finalResult = getNumberOfRecords(finalResult, 20);

                resolve(finalResult);
            });
        });
    });
}

const getPopularSeries = (request, h) => {
    // Get the details of series, Which contains all the seasons details //
    const GET_POPULAR_SERIES_DETAILS_URL = `https://api.themoviedb.org/3/tv/popular?api_key=bbc83949898a3c789991932109990df7&language=en-US&page=1`;
    const GET_POPULAR_SERIES_DETAILS_OPTIONS = { json: true };

    return new Promise((resolve, reject) => {
        httpRequest(GET_POPULAR_SERIES_DETAILS_URL, GET_POPULAR_SERIES_DETAILS_OPTIONS, (error, h, body) => {
            if (error) { 
                return error; 
            }

            let finalResult = [];
            finalResult = body.results.map((resItem) => {
                let resArray = {
                    'id': resItem.id,
                    'name': resItem.name,
                    'vote_average': resItem.vote_average
                };
                return resArray;
            });
            
            finalResult = finalResult.sort((obj1, obj2) => (obj1.vote_average < obj1.vote_average) ? 1 : (obj1.vote_average > obj2.vote_average) ? -1 : 0);
            finalResult = getNumberOfRecords(finalResult, 5);

            resolve(finalResult);
        });
    });
};

const __request = (urls, callback) => {
	let results = {}, t = urls.length, c = 0,
		handler = (error, response, body) => {
			let url = response.request.uri.href;
			results[url] = { error: error, response: response, body: body };
			if (++c === urls.length) { callback(results); }
		};
	while (t--) { httpRequest(urls[t], handler); }
};

const getNumberOfRecords = (resultsArray, count) => {
    return (resultsArray.length > count) ? resultsArray.slice(0, count) : resultsArray;
}

module.exports = {
    getTvDetails,
    getPopularSeries
};