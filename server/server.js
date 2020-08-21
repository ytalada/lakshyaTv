import { server as _server } from '@hapi/hapi';
import { getTvDetails, getPopularSeries } from './handlers/getTvDetailsHandler';

const PORT = process.env.PORT || 3000;
const HOST = process.env.host || 'localhost';

const init = async () => {

    const server = _server({
        port: PORT,
        host: HOST
    });

    server.state('data', {
        ttl: null,
        isSecure: true,
        isHttpOnly: true
    });

    server.route({
        method: 'GET',
        path: '/',
        handler: (request, h) => {
            return 'Hello World!';
        }
    });

    server.route({
        method: 'GET',
        path: '/topEpisodes/{series_id}',
        handler: getTvDetails
    });

    server.route({
        method: 'GET',
        path: '/analytics/popularSeries',
        handler: getPopularSeries
    });
    
    await server.start();
    console.log('Server running on %s', server.info.uri);
};

process.on('unhandledRejection', (err) => {
    console.log(err);
    process.exit(1);
});

init();
