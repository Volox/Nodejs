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
    var myImage;
    myImage = new Image();
    myImage.onload = function() {
      var $canvas, canvas, ctx;
      $canvas = $('#img');
      canvas = $canvas[0];
      ctx = canvas.getContext('2d');
      ctx.drawImage(this, 0, 0);
    };
    myImage.src = '/img/scene.jpg';
    $('#dome').on('click', '.page-header', function() {
      $(this).next('ul.thumbnails').toggle();
    });
    $('#clickme').click(function() {
      var $dome, $img, myScaleSpace, sift;
      $dome = $('#dome');
      $dome.empty();
      $img = $('#img');
      sift = true;
      if (sift) {
        myScaleSpace = null;
        MM.sift($img[0], {
          scale: function(ScaleSpace, time) {
            var $contents, $title;
            myScaleSpace = ScaleSpace;
            $title = createTitle('Scale space', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            /*
            					for row,octave in ScaleSpace
            						for image,blurStep in row
            							label = "octave #{octave+1}, blurStep #{blurStep+1}"
            							canvas = MM.toImage image
            							$thumbLi = createThumbnail canvas, label, null, octave+1
            							$contents.append $thumbLi
            */
            $dome.append($title);
            $dome.append($contents);
          },
          dog: function(DoG, time) {
            var $contents, $title;
            $title = createTitle('DoG', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            /*
            					# insert the images into the dome elements
            					for DoGRow,octave in DoG
            						for image,blurStep in DoGRow
            							label = "DoG octave #{octave+1}, blurStep #{blurStep+1}-#{blurStep}"
            							canvas = MM.toImage image
            							$thumbLi = createThumbnail canvas, label, null, octave+1
            							$contents.append $thumbLi
            */
            $dome.append($title);
            $dome.append($contents);
          },
          maxmin: function(MaxMin, time) {
            var $contents, $title;
            $title = createTitle('MaxMin', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            /*
            					# insert the images into the dome elements
            					for MaxMinRow,octave in MaxMin
            						for image,blurStep in MaxMinRow
            							label = "MaxMin of octave #{octave+1} using DoG #{blurStep},#{blurStep+1} and #{blurStep+2}"
            							canvas = MM.toImage image
            							$thumbLi = createThumbnail canvas, label, null, octave+1
            							$contents.append $thumbLi
            */
            $dome.append($title);
            $dome.append($contents);
          },
          refine: function(Refine, time) {
            var $contents, $title;
            $title = createTitle('KeyPoints refinement', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            /*
            					# insert the images into the dome elements
            					for RefineRow,octave in Refine
            						for image,blurStep in RefineRow
            							label = "Refinement"
            							canvas = MM.toImage image
            							$thumbLi = createThumbnail canvas, label, null, octave+1
            							$contents.append $thumbLi
            */
            $dome.append($title);
            $dome.append($contents);
          },
          magor: function(MagOr, time) {
            var $contents, $thumbLi, $title, MagOrRow, blurStep, canvas, canvas_arrow, ctx, data, diag, image, imgMag, imgOr, label, mag, octave, orient, x, y, _len, _len2, _ref, _ref2;
            $title = createTitle('Magnitude and Orientation', "took " + time + "ms");
            $contents = $('<ul>', {
              'class': 'thumbnails'
            });
            canvas_arrow = function(context, fromx, fromy, orient, mag) {
              var angle, headlen, tox, toy;
              headlen = 5;
              angle = orient;
              tox = fromx + mag * Math.cos(orient);
              toy = fromy + mag * Math.sin(orient);
              context.beginPath();
              context.moveTo(fromx, fromy);
              context.lineTo(tox, toy);
              context.lineTo(tox - headlen * Math.cos(angle - Math.PI / 6), toy - headlen * Math.sin(angle - Math.PI / 6));
              context.moveTo(tox, toy);
              context.lineTo(tox - headlen * Math.cos(angle + Math.PI / 6), toy - headlen * Math.sin(angle + Math.PI / 6));
              context.closePath();
              context.stroke();
            };
            for (octave = 0, _len = MagOr.length; octave < _len; octave++) {
              MagOrRow = MagOr[octave];
              for (blurStep = 0, _len2 = MagOrRow.length; blurStep < _len2; blurStep++) {
                data = MagOrRow[blurStep];
                label = "Magnitude";
                imgMag = new MMImage(data.magnitude);
                imgOr = new MMImage(data.orientation);
                image = myScaleSpace[octave][0];
                canvas = MM.toImage(image);
                diag = Math.sqrt(Math.pow(imgMag.width, 2) + Math.pow(imgMag.height, 2));
                ctx = canvas.getContext('2d');
                ctx.strokeStyle = 'red';
                for (x = 0, _ref = imgMag.width - 1; 0 <= _ref ? x <= _ref : x >= _ref; 0 <= _ref ? x++ : x--) {
                  for (y = 0, _ref2 = imgMag.height - 1; 0 <= _ref2 ? y <= _ref2 : y >= _ref2; 0 <= _ref2 ? y++ : y--) {
                    mag = imgMag.at(x, y);
                    if (0 !== mag) {
                      orient = imgOr.at(x, y);
                      canvas_arrow(ctx, x, y, orient, mag * 0.5);
                    }
                  }
                }
                $thumbLi = createThumbnail(canvas, label, null, octave + 1);
                $contents.append($thumbLi);
              }
            }
            $dome.append($title);
            $dome.append($contents);
          }
        });
      }
    });
  });

}).call(this);
