var fs = require('fs');

var PNGCrop = require('../');

// if you don't know the image's dimension and want to crop for a point all the
// way til bottom right, just pass a big width/height
var config1 = {width: 100, height: 62, top: 95, left: 110};
// pass a path, a buffer or a stream as the input
PNGCrop.crop('1.png', 'expectedCropTopLeftConfig.png', config1, function(err) {
  if (err) throw err;
  console.log('done!');
});

// optionally pass top and left to the configurations as the upper left corner
// from which to start cropping
var config2 = {width: 53, height: 114};

var imgBuffer = fs.readFileSync('1.png');
PNGCrop.cropToStream(imgBuffer, config2, function(err, outputStream) {
  if (err) throw err;
  outputStream.pipe(fs.createWriteStream('expectedCrop.png'));
});
