const Queue = require('bull');

// Create a queue for file processing
const fileQueue = new Queue('file-processing', {
  redis: { port: 4000, host: '127.0.0.1' }
});

module.exports = {fileQueue}