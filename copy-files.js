const fs = require('fs-extra');

const source = '../file-transfer-app'
const destination = '../killerbean'
fs.copy(source, destination, { overwrite: true }, err => {
  if (err) {
    console.error(err);
  } else {
    console.log('Files copied successfully!');
  }
});
 