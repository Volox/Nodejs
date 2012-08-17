(function() {
  var Image, MM;

  Image = (function() {

    Image.prototype.DEFAULT_VALUE = 0;

    function Image(obj) {
      var ret;
      this.data = null;
      this.width = 0;
      this.height = 0;
      this.channels = 0;
      ret = true;
      if (arguments.length === 3) ret = this.setArray.apply(this, arguments);
      if (arguments.length === 2) {
        ret = this.setEmpty.apply(this, arguments);
      } else if (arguments.length === 1) {
        if (obj instanceof HTMLElement) {
          ret = this.setCanvas(obj);
        } else {
          ret = this.setImageObject(obj);
        }
      }
      if (!ret) throw new Error('Unable to create the image');
    }

    Image.prototype.setEmpty = function(width, height) {
      if ((width != null) && width > 0 && (height != null) && height > 0) {
        this.width = width;
        this.height = height;
        this.channels = 1;
        this.data = new Float32Array(this.width * this.height);
        return true;
      } else {
        return false;
      }
    };

    Image.prototype.setCanvas = function(canvas) {
      var ctx, data;
      try {
        ctx = canvas.getContext('2d');
        data = ctx.getImageData(0, 0, canvas.width, canvas.height);
        this.width = data.width;
        this.height = data.height;
        this.data = data.data;
        this.channels = data.data.length;
        return true;
      } catch (ex) {
        return false;
      }
    };

    Image.prototype.setArray = function(ArrayData, width, height, channels) {
      if (channels == null) channels = 1;
      if ((channels === 1 && width * height === ArrayData.length) || (channels === ArrayData.length && width * height === ArrayData[0].length)) {
        this.channels = channels;
        this.data = ArrayData;
        this.width = width;
        this.height = height;
        return true;
      } else {
        return false;
      }
    };

    Image.prototype.setImageObject = function(image) {
      if ((image.data != null) && (image.width != null) && (image.height != null) && image.data.length === image.width * image.height) {
        return this.setArray(image.data, image.width, image.height);
      } else {
        return false;
      }
    };

    Image.prototype.at = function(x, y, channel) {
      var index;
      if (channel == null) channel = 0;
      x = parseInt(x);
      y = parseInt(y);
      if (x < 0 || x > this.width - 1) return this.DEFAULT_VALUE;
      if (y < 0 || y > this.height - 1) return this.DEFAULT_VALUE;
      index = this._i(x, y);
      if (this.channels === 1) {
        return this.data[index];
      } else {
        return this.data[channel][index];
      }
    };

    Image.prototype._i = function(x, y) {
      return y * this.width + x;
    };

    return Image;

  })();

  MM = (function() {

    function MM() {}

    MM.toImage = function(imageData, fitRange) {
      var canvas, canvasCtx, canvasImageData, h, w;
      if (fitRange == null) fitRange = false;
      w = imageData.width;
      h = imageData.height;
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvasCtx = canvas.getContext("2d");
      canvasImageData = canvasCtx.createImageData(w, h);
      MM.toRGB(imageData, canvasImageData, fitRange);
      canvasCtx.putImageData(canvasImageData, 0, 0);
      return canvas;
    };

    MM.createImage = function(wImage, h) {
      var canvas, canvasCtx, imageData, w;
      w = wImage;
      if (!(h != null)) {
        h = wImage.height;
        w = wImage.width;
      }
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvasCtx = canvas.getContext('2d');
      imageData = canvasCtx.createImageData(w, h);
      return {
        canvas: canvas,
        context: canvasCtx,
        data: imageData
      };
    };

    MM.getImage = function(image, scale, gray, outType) {
      var canvas, canvasCtx, h, imageData, output, w;
      if (scale == null) scale = 1;
      if (gray == null) gray = false;
      w = parseInt(image.width * scale);
      h = parseInt(image.height * scale);
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvasCtx = canvas.getContext("2d");
      canvasCtx.drawImage(image, 0, 0, w, h);
      imageData = canvasCtx.getImageData(0, 0, w, h);
      output = {
        canvas: canvas,
        context: canvasCtx,
        data: imageData
      };
      if (gray || (outType != null)) output = MM.toFloat(imageData);
      if (outType != null) output.data = new window[outType](output.data);
      return output;
    };

    MM.gauss2d = function(size, sigma, center) {
      var cX, cY, exp, front, i, index, rX, rY, result, sum, value, x, y, _len;
      if (sigma == null) sigma = size / 2;
      if (center == null) center = true;
      result = new Float32Array(size * size);
      cY = center ? parseInt(size / 2) : 0;
      cX = center ? parseInt(size / 2) : 0;
      sum = 0;
      for (x = 0; 0 <= size ? x <= size : x >= size; 0 <= size ? x++ : x--) {
        for (y = 0; 0 <= size ? y <= size : y >= size; 0 <= size ? y++ : y--) {
          index = y * size + x;
          rX = x - cX;
          rY = y - cY;
          front = 1 / (2 * Math.PI * sigma * sigma);
          exp = -1 * (rX * rX + rY * rY) / (2 * sigma * sigma);
          value = front * Math.exp(exp);
          result[index] = value;
          sum += value;
        }
      }
      for (i = 0, _len = result.length; i < _len; i++) {
        value = result[i];
        result[i] = value / sum;
      }
      return result;
    };

    MM.toRGB = function(image, imageData, fitRange) {
      var h, idx, kernelArgs, max, min, w, x, y, _ref, _ref2;
      if (fitRange == null) fitRange = false;
      w = image.width;
      h = image.height;
      if (w !== imageData.width || h !== imageData.height) {
        throw new Error('Dimension mismatch');
      }
      max = -1;
      min = 1;
      if (fitRange) {
        max = min = image.data[0];
        for (x = 0, _ref = w - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
          for (y = 0, _ref2 = h - 1; 0 <= _ref2 ? y <= _ref2 : y >= _ref2; 0 <= _ref2 ? y++ : y--) {
            idx = y * w + x;
            if (image.data[idx] < min) min = image.data[idx];
            if (image.data[idx] > max) max = image.data[idx];
          }
        }
      }
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source', image.data);
      kernelArgs.addOutput('destination', imageData.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      kernelArgs.addArgument('min', min, 'FLOAT');
      kernelArgs.addArgument('max', max, 'FLOAT');
      MM.VoloTest.runKernel('clRGB', [w, h], kernelArgs);
    };

    MM.toFloat = function(image) {
      var FloatImage, h, kernelArgs, w;
      w = image.width;
      h = image.height;
      FloatImage = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source', image.data);
      kernelArgs.addOutput('destination', FloatImage.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clFloat', [w, h], kernelArgs);
      return FloatImage;
    };

    MM.blur = function(image, sigma, gaussSize) {
      var filter, h, kernelArgs, output, w;
      if (sigma == null) sigma = 1;
      if (gaussSize == null) gaussSize = 7;
      w = image.width;
      h = image.height;
      output = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      filter = MM.gauss2d(gaussSize, sigma);
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source', image.data);
      kernelArgs.addInput('filter', filter);
      kernelArgs.addOutput('destination', output.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      kernelArgs.addArgument('filterWidth', gaussSize);
      kernelArgs.addArgument('filterHeight', gaussSize);
      MM.VoloTest.runKernel('clConvolution', [w, h], kernelArgs);
      return output;
    };

    MM.diff = function(img1, img2) {
      var h, kernelArgs, output, w;
      w = img1.width;
      h = img1.height;
      if (w !== img2.width || h !== img2.height) {
        throw new Error('Image size mismatch');
      }
      output = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source1', img1.data);
      kernelArgs.addInput('source2', img2.data);
      kernelArgs.addOutput('destination', output.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clDiff', [w, h], kernelArgs);
      return output;
    };

    MM.maxmin = function(prev, current, next) {
      var h, kernelArgs, output, w;
      w = current.width;
      h = current.height;
      if (w !== prev.width || w !== next.width || h !== prev.height || h !== next.height) {
        throw new Error('Dimension mismatch');
      }
      output = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('prev', prev.data);
      kernelArgs.addInput('current', current.data);
      kernelArgs.addInput('next', next.data);
      kernelArgs.addOutput('output', output.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clMaxMin', [w, h], kernelArgs);
      return output;
    };

    MM.refine = function(image, keyPoints) {
      var h, kernelArgs, output, w;
      w = image.width;
      h = image.height;
      if (w !== keyPoints.width || h !== keyPoints.height) {
        throw new Error('Dimension mismatch');
      }
      output = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('image', image.data);
      kernelArgs.addInput('keypoints', keyPoints.data);
      kernelArgs.addOutput('output', output.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clRefine', [w, h], kernelArgs);
      return output;
    };

    MM.magor = function(image, keyPoints) {
      var h, kernelArgs, magnitude, orientation, w;
      w = image.width;
      h = image.height;
      if (w !== keyPoints.width || h !== keyPoints.height) {
        throw new Error('Dimension mismatch');
      }
      orientation = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      magnitude = {
        width: w,
        height: h,
        data: new Float32Array(w * h)
      };
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('image', image.data);
      kernelArgs.addInput('keypoints', keyPoints.data);
      kernelArgs.addOutput('magnitude', magnitude.data);
      kernelArgs.addOutput('orientation', orientation.data);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clMagOrient', [w, h], kernelArgs);
      return {
        magnitude: magnitude,
        orientation: orientation
      };
    };

    MM.sift = function(imageObj, handlers) {
      var DoG, DoGImage, DoGRow, KeyPoints, KeyPointsRow, MagOr, MagOrRow, MaxMin, MaxMinRow, ScaleSpace, ScaleSpaceRow, blurBaseValue, blurImage, blurStep, blurSteps, current, data, gaussSize, idx, image, img, img1, img2, index, next, octave, octaves, octavesNum, output, prev, scale, time, times, _i, _len, _len2, _len3, _len4, _ref, _ref2, _ref3, _ref4, _ref5, _ref6;
      times = {
        SIFT: 'SIFT',
        ScaleSpace: 'ScaleSpace',
        DoG: 'DoG',
        MaxMin: 'MaxMin',
        KeyPointRef: 'KeyPointRef',
        MagOr: 'MagOr'
      };
      octavesNum = 4;
      blurSteps = 5;
      octaves = [];
      for (octave = 1; 1 <= octavesNum ? octave <= octavesNum : octave >= octavesNum; 1 <= octavesNum ? octave++ : octave--) {
        if (octave === 1) octaves.push(2);
        if (octave !== 1) octaves.push(1 / (octave - 1));
      }
      blurBaseValue = 0.707;
      gaussSize = 7;
      try {
        console.time(times.SIFT);
        ScaleSpace = [];
        console.time(times.ScaleSpace);
        for (_i = 0, _len = octaves.length; _i < _len; _i++) {
          scale = octaves[_i];
          ScaleSpaceRow = [];
          for (blurStep = 0, _ref = blurSteps - 1; 0 <= _ref ? blurStep <= _ref : blurStep >= _ref; 0 <= _ref ? blurStep++ : blurStep--) {
            img = MM.getImage(imageObj, scale, true, 'Float32Array');
            if (blurStep !== 0) {
              blurImage = MM.blur(img, blurBaseValue * blurStep, gaussSize);
            } else {
              blurImage = img;
            }
            ScaleSpaceRow.push(blurImage);
          }
          ScaleSpace.push(ScaleSpaceRow);
        }
        time = console.timeEnd(times.ScaleSpace);
        if (handlers.scale != null) handlers.scale(ScaleSpace, time);
        DoG = [];
        console.time(times.DoG);
        for (octave = 0, _ref2 = octavesNum - 1; 0 <= _ref2 ? octave <= _ref2 : octave >= _ref2; 0 <= _ref2 ? octave++ : octave--) {
          DoGRow = [];
          for (blurStep = 0, _ref3 = blurSteps - 2; 0 <= _ref3 ? blurStep <= _ref3 : blurStep >= _ref3; 0 <= _ref3 ? blurStep++ : blurStep--) {
            img1 = ScaleSpace[octave][blurStep];
            img2 = ScaleSpace[octave][blurStep + 1];
            DoGImage = MM.diff(img1, img2);
            DoGRow.push(DoGImage);
          }
          DoG.push(DoGRow);
        }
        time = console.timeEnd(times.DoG);
        if (handlers.dog != null) handlers.dog(DoG, time);
        console.time(times.MaxMin);
        MaxMin = [];
        for (idx = 0, _len2 = DoG.length; idx < _len2; idx++) {
          octave = DoG[idx];
          MaxMinRow = [];
          for (index = 1, _ref4 = octave.length - 2; 1 <= _ref4 ? index <= _ref4 : index >= _ref4; 1 <= _ref4 ? index++ : index--) {
            prev = octave[index - 1];
            current = octave[index];
            next = octave[index + 1];
            output = MM.maxmin(prev, current, next);
            MaxMinRow.push(output);
          }
          MaxMin.push(MaxMinRow);
        }
        time = console.timeEnd(times.MaxMin);
        if (handlers.maxmin != null) handlers.maxmin(MaxMin, time);
        console.time(times.KeyPointRef);
        KeyPoints = [];
        for (idx = 0, _len3 = DoG.length; idx < _len3; idx++) {
          octave = DoG[idx];
          KeyPointsRow = [];
          for (index = 1, _ref5 = octave.length - 2; 1 <= _ref5 ? index <= _ref5 : index >= _ref5; 1 <= _ref5 ? index++ : index--) {
            image = octave[index];
            output = MM.refine(image, MaxMin[idx][index - 1]);
            KeyPointsRow.push(output);
          }
          KeyPoints.push(KeyPointsRow);
        }
        time = console.timeEnd(times.KeyPointRef);
        if (handlers.refine != null) handlers.refine(KeyPoints, time);
        console.time(times.MagOr);
        MagOr = [];
        for (idx = 0, _len4 = DoG.length; idx < _len4; idx++) {
          octave = DoG[idx];
          MagOrRow = [];
          for (index = 1, _ref6 = octave.length - 2; 1 <= _ref6 ? index <= _ref6 : index >= _ref6; 1 <= _ref6 ? index++ : index--) {
            image = octave[index];
            data = MM.magor(image, KeyPoints[idx][index - 1]);
            MagOrRow.push(data);
          }
          MagOr.push(MagOrRow);
        }
        time = console.timeEnd(times.MagOr);
        if (handlers.magor != null) handlers.magor(MagOr, time);
      } catch (ex) {
        console.log(ex);
      } finally {
        console.timeEnd(times.SIFT);
      }
    };

    return MM;

  })();

  window.MM = MM;

  window.MMImage = Image;

  MM.VoloTest = new VoloCL('/opencl/volo.cl');

}).call(this);
