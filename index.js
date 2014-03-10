'use strict';

var fs = require('fs');
var PNG = require('pngjs').PNG;
var Stream = require('stream');
var streamifier = require('streamifier');

function _turnPathOrStreamOrBufIntoStream(streamOrBufOrPath, done) {
  if (typeof streamOrBufOrPath === 'string') {
    streamOrBufOrPath = fs
      .createReadStream(streamOrBufOrPath)
      .once('error', done);
  }

  if (streamOrBufOrPath instanceof Buffer) {
    streamOrBufOrPath = streamifier
      .createReadStream(streamOrBufOrPath)
      .once('error', done);
  }

  if (!(streamOrBufOrPath instanceof Stream)) {
    return done(
      new Error('Argument needs to be a valid read path, stream or buffer.')
    );
  }

  done(null, streamOrBufOrPath);
}

function cropToStream(streamOrBufOrPath, config, done) {
  var noDimsMsg = 'Image cropping dimensions should specify width and height';

  if (!config) return done(new Error(noDimsMsg));
  if (config.height == null || config.width == null) {
    return done(new Error(noDimsMsg));
  }

  _turnPathOrStreamOrBufIntoStream(streamOrBufOrPath, function(err, stream) {
    if (err) return done(err);

    stream.pipe(new PNG()).once('error', done).on('parsed', function() {
      var top = config.top || 0;
      var left = config.left || 0;
      var width = Math.min(config.width, this.width - left);
      var height = Math.min(config.height, this.height - top);

      var writeStream = new PNG({width: width, height: height});

      this.bitblt(writeStream, left, top, width, height, 0, 0);

      return done(null, writeStream.pack());
    });
  });
}

function crop(streamOrBufOrPath, destPath, config, done) {
  cropToStream(streamOrBufOrPath, config, function(err, res) {
    if (err) return done(err);

    res
      .pipe(fs.createWriteStream(destPath))
      .once('error', done)
      .on('close', done);
  });
}

module.exports = {
  crop: crop,
  cropToStream: cropToStream
};
