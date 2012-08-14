(function() {
  var benchmark, benchmarkDebug, createInfo, createThumbnail, createTitle;

  benchmark = true;

  benchmarkDebug = false;

  createInfo = function(info) {
    var $info;
    $info = $('<div>', {
      'class': 'alert alert-info',
      text: info
    });
    return $info;
  };

  createTitle = function(title, subtitle) {
    var $divCont, $subtitle, $title;
    $divCont = $('<div>', {
      'class': 'page-header'
    });
    $title = $('<h1>', {
      text: title + ' '
    });
    if (subtitle != null) {
      $subtitle = $('<small>', {
        text: subtitle
      });
      $title.append($subtitle);
    }
    $divCont.append($title);
    return $divCont;
  };

  createThumbnail = function(image, label, caption, ratio) {
    var $caption, $captionCont, $divCont, $label, $thumbLi;
    if (ratio == null) ratio = 1;
    $thumbLi = $('<li>', {
      'class': "span" + (parseInt(12 / ratio))
    });
    $divCont = $('<div>', {
      'class': 'thumbnail'
    });
    $captionCont = $('<div>', {
      'class': 'caption'
    });
    $label = $('<h5>', {
      text: label
    });
    if (caption != null) {
      $caption = $('<p>', {
        text: caption
      });
    }
    $captionCont.append($label);
    if (caption != null) $captionCont.append($caption);
    $divCont.append(image);
    $divCont.append($captionCont);
    $thumbLi.append($divCont);
    return $thumbLi;
  };

  jQuery(function($) {
    $('#dome').on('click', '.page-header', function() {
      $(this).next('ul.thumbnails').toggle();
    });
    $('#clickme').click(function() {
      var $DoG, $DoGInfo, $DoGTitle, $MaxMin, $MaxMinInfo, $MaxMinTitle, $dome, $img, $info, $scaleSpace, $scaleSpaceInfo, $scaleSpaceTitle, $thumbLi, DoG, DoGRow, DoGcanvas, blurCanvas, blurFactor, blurMatrix, blurStep, blurSteps, caption, current, idx, index, info, keyPoints, label, next, octave, octaveRow, octaves, prev, scaleSpace, sift, tDoG, tMaxMin, tScaleSpace, timeID, timeTook, _len, _len2, _len3, _ref, _ref2, _ref3;
      $dome = $('#dome');
      $dome.empty();
      $img = $('#img');
      sift = true;
      if (sift) {
        MM.sift($img[0], {
          scale: function(ScaleSpace, time) {
            var $contents, $thumbLi, $title, blurStep, canvas, image, label, octave, row, _len, _len2;
            $title = createTitle('Scale space', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            for (octave = 0, _len = ScaleSpace.length; octave < _len; octave++) {
              row = ScaleSpace[octave];
              for (blurStep = 0, _len2 = row.length; blurStep < _len2; blurStep++) {
                image = row[blurStep];
                label = "octave " + (octave + 1) + ", blurStep " + (blurStep + 1);
                canvas = MM.toImage(image);
                $thumbLi = createThumbnail(canvas, label, null, index + 1);
                $contents.append($thumbLi);
              }
            }
            $dome.append($title);
            $dome.append($contents);
          },
          dog: function(DoG, time) {
            var $contents, $thumbLi, $title, DoGRow, blurStep, canvas, image, label, octave, _len, _len2;
            $title = createTitle('DoG', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            for (octave = 0, _len = DoG.length; octave < _len; octave++) {
              DoGRow = DoG[octave];
              for (blurStep = 0, _len2 = DoGRow.length; blurStep < _len2; blurStep++) {
                image = DoGRow[blurStep];
                label = "DoG octave " + (octave + 1) + ", blurStep " + (blurStep + 1) + "-" + blurStep;
                canvas = MM.toImage(image);
                $thumbLi = createThumbnail(canvas, label, null, octave + 1);
                $contents.append($thumbLi);
              }
            }
            $dome.append($title);
            $dome.append($contents);
          },
          maxmin: function(MaxMin, time) {
            var $contents, $thumbLi, $title, MaxMinRow, blurStep, canvas, image, label, octave, _len, _len2;
            $title = createTitle('MaxMin', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            for (octave = 0, _len = MaxMin.length; octave < _len; octave++) {
              MaxMinRow = MaxMin[octave];
              for (blurStep = 0, _len2 = MaxMinRow.length; blurStep < _len2; blurStep++) {
                image = MaxMinRow[blurStep];
                label = "MaxMin of octave " + (octave + 1) + " using DoG " + blurStep + "," + (blurStep + 1) + " and " + (blurStep + 2);
                canvas = MM.toImage(image);
                $thumbLi = createThumbnail(canvas, label, null, octave + 1);
                $contents.append($thumbLi);
              }
            }
            $dome.append($title);
            $dome.append($contents);
          },
          refine: function(Refine, time) {
            var $contents, $thumbLi, $title, RefineRow, blurStep, canvas, image, label, octave, _len, _len2;
            $title = createTitle('KeyPoints refinement', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            for (octave = 0, _len = Refine.length; octave < _len; octave++) {
              RefineRow = Refine[octave];
              for (blurStep = 0, _len2 = RefineRow.length; blurStep < _len2; blurStep++) {
                image = RefineRow[blurStep];
                label = "Refinement";
                canvas = MM.toImage(image);
                $thumbLi = createThumbnail(canvas, label, null, octave + 1);
                $contents.append($thumbLi);
              }
            }
            $dome.append($title);
            $dome.append($contents);
          }
        });
        return;
      }
      try {
        if (benchmark) console.time("SIFT");
        octaves = [2, 1, 1 / 2, 1 / 3];
        blurSteps = 5;
        blurMatrix = [[0.707, 1, 1.414, 2, 2.828], [1.414, 2, 2.828, 4, 5.656], [2.828, 4, 5.656, 8, 11.313], [5.656, 8, 11.313, 16, 22.627]];
        tScaleSpace = "Scale space";
        if (benchmark) console.time(tScaleSpace);
        $scaleSpace = $('<ul>', {
          'class': 'thumbnails'
        });
        $scaleSpaceTitle = createTitle('Scale space', '4 octaves and 5 blur blur steps');
        scaleSpace = [];
        for (index = 0, _len = octaves.length; index < _len; index++) {
          octave = octaves[index];
          octaveRow = [];
          for (blurStep = 0, _ref = blurSteps - 1; 0 <= _ref ? blurStep <= _ref : blurStep >= _ref; 0 <= _ref ? blurStep++ : blurStep--) {
            blurFactor = blurMatrix[index][blurStep];
            timeID = "Octave " + (index + 1) + " Blur " + (blurStep + 1);
            if (benchmark && benchmarkDebug) console.time(timeID);
            blurCanvas = MM.blur($img[0], octave, blurFactor);
            if (benchmark && benchmarkDebug) console.timeEnd(timeID);
            blurCanvas.id = "scale_" + octave + "_" + blurStep;
            octaveRow.push(blurCanvas);
            label = "Octave " + (index + 1) + ", blur step " + (blurStep + 1);
            caption = "Scale factor: " + octave + ", blurFactor: " + blurFactor;
            $thumbLi = createThumbnail(blurCanvas, label, caption, index + 1);
            $scaleSpace.append($thumbLi);
          }
          scaleSpace.push(octaveRow);
        }
        if (benchmark) timeTook = console.timeEnd(tScaleSpace);
        info = "Scale Space took " + timeTook + "ms";
        $scaleSpaceInfo = createInfo(info);
        $dome.append($scaleSpaceTitle);
        $dome.append($scaleSpace);
        $dome.append($scaleSpaceInfo);
        tDoG = "DoG";
        if (benchmark) console.time(tDoG);
        $DoG = $('<ul>', {
          'class': 'thumbnails'
        });
        $DoGTitle = createTitle('DoG', 'Difference of Gaussian');
        DoG = [];
        for (idx = 0, _len2 = scaleSpace.length; idx < _len2; idx++) {
          octave = scaleSpace[idx];
          DoGRow = [];
          for (index = 1, _ref2 = octave.length - 1; 1 <= _ref2 ? index <= _ref2 : index >= _ref2; 1 <= _ref2 ? index++ : index--) {
            timeID = "Difference from " + (index - 1) + " to " + index;
            if (benchmark && benchmarkDebug) console.time(timeID);
            DoGcanvas = MM.diff(octave[index - 1], octave[index]);
            if (benchmark && benchmarkDebug) console.timeEnd(timeID);
            DoGRow.push(DoGcanvas);
            label = timeID;
            $thumbLi = createThumbnail(DoGcanvas, label, null, idx + 1);
            $DoG.append($thumbLi);
          }
          DoG.push(DoGRow);
        }
        if (benchmark) timeTook = console.timeEnd(tDoG);
        info = "DoG took " + timeTook + "ms";
        $DoGInfo = createInfo(info);
        $dome.append($DoGTitle);
        $dome.append($DoG);
        $dome.append($DoGInfo);
        tMaxMin = 'MaxMin';
        if (benchmark) console.time(tMaxMin);
        $MaxMin = $('<ul>', {
          'class': 'thumbnails'
        });
        $MaxMinTitle = createTitle('Find MaxMin');
        for (idx = 0, _len3 = DoG.length; idx < _len3; idx++) {
          octave = DoG[idx];
          for (index = 1, _ref3 = octave.length - 2; 1 <= _ref3 ? index <= _ref3 : index >= _ref3; 1 <= _ref3 ? index++ : index--) {
            prev = octave[index - 1];
            current = octave[index];
            next = octave[index + 1];
            keyPoints = MM.maxmin(prev, current, next, 0);
            $MaxMin.append(keyPoints);
            label = "Current index: " + index;
            $thumbLi = createThumbnail(keyPoints, label, null, idx + 1);
            $MaxMin.append($thumbLi);
          }
        }
        if (benchmark) timeTook = console.timeEnd(tMaxMin);
        info = "MaxMin took " + timeTook + "ms";
        $MaxMinInfo = createInfo(info);
        $dome.append($MaxMinTitle);
        $dome.append($MaxMin);
        $dome.append($MaxMinInfo);
      } catch (error) {
        console.log(error);
      } finally {
        if (benchmark) timeTook = console.timeEnd("SIFT");
        info = "SIFT total time " + timeTook + "ms";
        $info = createInfo(info);
        $dome.append($info);
      }
    });
  });

}).call(this);
