'use strict';

var concat = require('concat-stream');
var fs = require('fs');
var should = require('should');

var PNGCrop = require('../');

var img1Path = 'test/fixtures/1.png';
var imgExpectedCropOverflowPath = 'test/fixtures/expectedCropOverflow.png';
var imgExpectedCropPath = 'test/fixtures/expectedCrop.png';
var imgExpectedCropTopLeftConfigPath =
  'test/fixtures/expectedCropTopLeftConfig.png';
var tempImgPath = 'temp.png';

var img1Buf;
var img1Stream;
var imgExpectedCropOverflowStream;
var imgExpectedCropStream;
var imgExpectedCropTopLeftConfigStream;

function _compareCrop(actualStream, expectedStream, done) {
  actualStream.pipe(concat(function(buf1) {
    expectedStream.pipe(concat(function(buf2) {
      buf1.length.should.equal(buf2.length);

      for (var i = 0; i < buf1.length; i++) {
        if (buf1[i] !== buf2[i]) {
          done(false);
        }
      }
      done();
    }));
  }));
}

describe('crop', function() {
  beforeEach(function() {
    img1Stream = fs.createReadStream(img1Path);
    img1Buf = fs.readFileSync(img1Path);
    imgExpectedCropOverflowStream =
      fs.createReadStream(imgExpectedCropOverflowPath);
    imgExpectedCropStream = fs.createReadStream(imgExpectedCropPath);
    imgExpectedCropTopLeftConfigStream =
      fs.createReadStream(imgExpectedCropTopLeftConfigPath);
  });

  afterEach(function() {
    if (fs.existsSync(tempImgPath)) {
      fs.unlinkSync(tempImgPath);
    }
  });

  it('should error for misinput', function(done) {
    PNGCrop.crop('bla', 'dest', {}, function(err) {
      err.message.should.equal(
        'Image cropping dimensions should specify width and height'
      );
      done();
    });
  });

  it('should require width and height info', function(done) {
    PNGCrop.crop(img1Path, tempImgPath, {}, function(err) {
      err.message.should.equal(
        'Image cropping dimensions should specify width and height'
      );
      done();
    });
  });

  it('should accept a stream', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.crop(img1Stream, tempImgPath, dims, function(err) {
      should.not.exist(err);

      _compareCrop(
        fs.createReadStream(tempImgPath), imgExpectedCropStream, done
      );
    });
  });

  it('should accept a buffer', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.crop(img1Buf, tempImgPath, dims, function(err) {
      should.not.exist(err);

      _compareCrop(
        fs.createReadStream(tempImgPath), imgExpectedCropStream, done
      );
    });
  });

  it('should output the cropped image', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.crop(img1Path, tempImgPath, dims, function(err) {
      should.not.exist(err);

      _compareCrop(
        fs.createReadStream(tempImgPath), imgExpectedCropStream, done
      );
    });
  });

  it('should accept a top left config', function(done) {
    var dims = {width: 100, height: 62, top: 95, left: 110};
    PNGCrop.crop(img1Path, tempImgPath, dims, function(err) {
      should.not.exist(err);

      _compareCrop(
        fs.createReadStream(tempImgPath),
        imgExpectedCropTopLeftConfigStream,
        done
      );
    });
  });

  it('should crop all the way to bottom right if dimensions exceed the image',
    function(done) {
      var dims = {width: 9999, height: 9999, top: 94, left: 100};
      PNGCrop.crop(img1Path, tempImgPath, dims, function(err) {
        should.not.exist(err);

        _compareCrop(
          fs.createReadStream(tempImgPath),
          imgExpectedCropOverflowStream,
          done
        );
      });
    }
  );
});

describe('cropToStream', function() {
  beforeEach(function() {
    img1Stream = fs.createReadStream(img1Path);
    img1Buf = fs.readFileSync(img1Path);
    imgExpectedCropOverflowStream =
      fs.createReadStream(imgExpectedCropOverflowPath);
    imgExpectedCropStream = fs.createReadStream(imgExpectedCropPath);
    imgExpectedCropTopLeftConfigStream =
      fs.createReadStream(imgExpectedCropTopLeftConfigPath);
  });

  it('should error for misinput', function(done) {
    PNGCrop.cropToStream('bla', {}, function(err) {
      err.message.should.equal(
        'Image cropping dimensions should specify width and height'
      );
      done();
    });
  });

  it('should require width and height info', function(done) {
    PNGCrop.cropToStream(img1Path, {}, function(err, res) {
      err.message.should.equal(
        'Image cropping dimensions should specify width and height'
      );
      done();
    });
  });

  it('should accept a stream', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.cropToStream(img1Stream, dims, function(err, res) {
      should.not.exist(err);

      _compareCrop(res, imgExpectedCropStream, done);
    });
  });

  it('should accept a buffer', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.cropToStream(img1Buf, dims, function(err, res) {
      should.not.exist(err);

      _compareCrop(res, imgExpectedCropStream, done);
    });
  });

  it('should output the cropped image', function(done) {
    var dims = {width: 53, height: 114};
    PNGCrop.cropToStream(img1Path, dims, function(err, res) {
      should.not.exist(err);

      _compareCrop(res, imgExpectedCropStream, done);
    });
  });

  it('should accept a top left config', function(done) {
    var dims = {width: 100, height: 62, top: 95, left: 110};
    PNGCrop.cropToStream(img1Path, dims, function(err, res) {
      should.not.exist(err);

      _compareCrop(res, imgExpectedCropTopLeftConfigStream, done);
    });
  });

  it('should crop all the way to bottom right if dimensions exceed the image',
    function(done) {
      var dims = {width: 9999, height: 9999, top: 94, left: 100};
      PNGCrop.cropToStream(img1Path, dims, function(err, res) {
        should.not.exist(err);

        _compareCrop(res, imgExpectedCropOverflowStream, done);
      });
    }
  );
});
