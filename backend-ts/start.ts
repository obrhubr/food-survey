// import the app
import { app } from './main';
// require logger
import { logger } from './lib/logger';

// Start application, listening on PORT defined by environment variables
app.listen(process.env.PORT, () => {
    console.log("INFO: Running server on ", process.env.PORT);
    logger.log('info', 'Server listening on port: ' + process.env.PORT);
});
