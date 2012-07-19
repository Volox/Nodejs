(function() {
  var MM;

  MM = (function() {

    function MM() {}

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
      canvasCtx = canvas.getContext("2d");
      imageData = canvasCtx.createImageData(w, h);
      return {
        canvas: canvas,
        context: canvasCtx,
        data: imageData
      };
    };

    MM.getImage = function(image, scale) {
      var canvas, canvasCtx, h, imageData, w;
      if (scale == null) scale = 1;
      w = parseInt(image.width * scale);
      h = parseInt(image.height * scale);
      canvas = document.createElement('canvas');
      canvas.width = w;
      canvas.height = h;
      canvasCtx = canvas.getContext("2d");
      canvasCtx.drawImage(image, 0, 0, w, h);
      imageData = canvasCtx.getImageData(0, 0, w, h);
      return {
        canvas: canvas,
        context: canvasCtx,
        data: imageData
      };
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

    MM.blur = function(image, scale, sigma) {
      var filter, gaussSize, h, imageData, kernelArgs, outData, w;
      if (scale == null) scale = 1;
      if (sigma == null) sigma = 1;
      imageData = MM.getImage(image, scale);
      w = imageData.data.width;
      h = imageData.data.height;
      outData = MM.createImage(w, h);
      gaussSize = 7;
      filter = MM.gauss2d(gaussSize, sigma);
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source', imageData);
      kernelArgs.addInput('filter', filter);
      kernelArgs.addOutput('destination', outData);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      kernelArgs.addArgument('filterWidth', gaussSize);
      kernelArgs.addArgument('filterHeight', gaussSize);
      MM.VoloTest.runKernel('clConvolution', [w, h], kernelArgs);
      outData.context.putImageData(outData.data, 0, 0);
      return outData.canvas;
    };

    MM.diff = function(src1, src2) {
      var h, imageData1, imageData2, kernelArgs, outData, w;
      imageData1 = MM.getImage(src1);
      imageData2 = MM.getImage(src2);
      w = imageData1.data.width;
      h = imageData1.data.height;
      outData = MM.createImage(w, h);
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('source1', imageData1);
      kernelArgs.addInput('source2', imageData2);
      kernelArgs.addOutput('destination', outData);
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clDiff', [w, h], kernelArgs);
      outData.context.putImageData(outData.data, 0, 0);
      return outData.canvas;
    };

    MM.maxmin = function(prev, current, next, threshold) {
      var h, image, kernelArgs, keyPoints, nextImage, prevImage, w;
      prevImage = MM.getImage(prev);
      image = MM.getImage(current);
      nextImage = MM.getImage(next);
      w = image.data.width;
      h = image.data.height;
      keyPoints = MM.createImage(w, h);
      kernelArgs = MM.VoloTest.createKernelArgs();
      kernelArgs.addInput('prev', prevImage);
      kernelArgs.addInput('current', image);
      kernelArgs.addInput('next', nextImage);
      kernelArgs.addOutput('keyPoints', keyPoints);
      kernelArgs.addArgument('threshold', threshold, 'UCHAR');
      kernelArgs.addArgument('width', w);
      kernelArgs.addArgument('height', h);
      MM.VoloTest.runKernel('clMaxMin', [w, h], kernelArgs);
      keyPoints.context.putImageData(keyPoints.data, 0, 0);
      return keyPoints.canvas;
    };

    MM.sift = function(imageObj) {
      var image;
      image = MM.getImage(imageObj);
      return image;
    };

    return MM;

  })();

  window.MM = MM;

  MM.VoloTest = new VoloCL('/opencl/volo.cl');

}).call(this);
