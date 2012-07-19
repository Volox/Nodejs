
  jQuery(function($) {
    return $('#clickme').click(function() {
      var $dome, $img, DoG, DoGRow, DoGcanvas, blurCanvas, blurFactor, blurMatrix, blurStep, blurSteps, current, index, keyPoints, next, octave, octaveRow, octaves, prev, scaleSpace, tDoG, tMaxMin, tScaleSpace, timeID, _i, _j, _len, _len2, _len3, _ref, _ref2, _ref3;
      $dome = $('#dome');
      $dome.empty();
      $img = $('#img');
      try {
        console.time("SIFT");
        octaves = [2, 1, 1 / 2, 1 / 3];
        blurSteps = 5;
        blurMatrix = [[0.707, 1, 1.414, 2, 2.828], [1.414, 2, 2.828, 4, 5.656], [2.828, 4, 5.656, 8, 11.313], [5.656, 8, 11.313, 16, 22.627]];
        tScaleSpace = "Scale space";
        console.time(tScaleSpace);
        scaleSpace = [];
        for (index = 0, _len = octaves.length; index < _len; index++) {
          octave = octaves[index];
          octaveRow = [];
          for (blurStep = 0, _ref = blurSteps - 1; 0 <= _ref ? blurStep <= _ref : blurStep >= _ref; 0 <= _ref ? blurStep++ : blurStep--) {
            blurFactor = blurMatrix[index][blurStep];
            timeID = "Octave " + (index + 1) + " Blur " + (blurStep + 1);
            blurCanvas = MM.blur($img[0], octave, blurFactor);
            blurCanvas.id = "scale_" + octave + "_" + blurStep;
            octaveRow.push(blurCanvas);
          }
          scaleSpace.push(octaveRow);
        }
        console.timeEnd(tScaleSpace);
        tDoG = "DoG";
        console.time(tDoG);
        DoG = [];
        for (_i = 0, _len2 = scaleSpace.length; _i < _len2; _i++) {
          octave = scaleSpace[_i];
          DoGRow = [];
          for (index = 1, _ref2 = octave.length - 1; 1 <= _ref2 ? index <= _ref2 : index >= _ref2; 1 <= _ref2 ? index++ : index--) {
            timeID = "Difference from " + (index - 1) + " to " + index;
            DoGcanvas = MM.diff(octave[index - 1], octave[index]);
            DoGRow.push(DoGcanvas);
          }
          DoG.push(DoGRow);
          console.timeEnd(tDoG);
        }
        tMaxMin = 'MaxMin';
        console.time(tMaxMin);
        for (_j = 0, _len3 = DoG.length; _j < _len3; _j++) {
          octave = DoG[_j];
          for (index = 1, _ref3 = octave.length - 2; 1 <= _ref3 ? index <= _ref3 : index >= _ref3; 1 <= _ref3 ? index++ : index--) {
            prev = octave[index - 1];
            current = octave[index];
            next = octave[index + 1];
            keyPoints = MM.maxmin(prev, current, next, 0);
            $dome.append(keyPoints);
          }
        }
        console.timeEnd(tMaxMin);
      } catch (error) {
        console.log(error);
      } finally {
        console.timeEnd("SIFT");
      }
    });
  });
