(function() {
  var detectFaces;

  $(function() {
    var $dropzone;
    $dropzone = $('.dropzone');
    $dropzone.on('fileReady', function(evt, fileList, dataTransfer) {
      var createImage, file, imageUrl, reader;
      console.log('Loading image..');
      createImage = function(imageUrl) {
        var img;
        img = new Image;
        img.onload = function() {
          console.log('Image loaded!');
          console.log('Detecting faces');
          detectFaces(img);
          console.log('Face detected');
        };
        return img.src = imageUrl;
      };
      if (fileList.length) {
        file = fileList[0];
        reader = new FileReader;
        reader.onload = function(evt) {
          var imageUrl;
          imageUrl = evt.target.result;
          createImage(imageUrl);
        };
        reader.readAsDataURL(file);
      } else if (dataTransfer) {
        imageUrl = dataTransfer.getData('text/uri-list');
        createImage(imageUrl);
      }
      return false;
    });
  });

  detectFaces = function(img) {
    var avgFace, comp, face, faceLayer, image, imageLayer, rect, stage, text, textLayer, userFaces, userLayer, _i, _len;
    $('#canvas').empty();
    stage = new Kinetic.Stage({
      container: "canvas",
      width: img.width,
      height: img.height + 30
    });
    imageLayer = new Kinetic.Layer;
    textLayer = new Kinetic.Layer;
    faceLayer = new Kinetic.Layer;
    userLayer = new Kinetic.Layer;
    text = new Kinetic.Text({
      text: 'Find the missing face/s (if any)',
      textFill: 'black',
      fontStyle: 'bold',
      y: img.height + 5,
      width: img.width,
      align: 'center',
      fontSize: 20,
      fontFamily: 'serif'
    });
    textLayer.add(text);
    image = new Kinetic.Image({
      image: img
    });
    imageLayer.add(image);
    stage.add(imageLayer);
    stage.add(faceLayer);
    stage.add(userLayer);
    stage.add(textLayer);
    comp = ccv.detect_objects({
      canvas: ccv.pre(imageLayer.getCanvas()),
      cascade: cascade,
      min_neighbors: 1,
      interval: 5
    });
    avgFace = {
      w: 0,
      h: 0
    };
    for (_i = 0, _len = comp.length; _i < _len; _i++) {
      face = comp[_i];
      avgFace.w += face.width;
      avgFace.h += face.height;
      text = new Kinetic.Text({
        text: "" + Math.round(face.confidence * 100) / 100,
        x: face.x,
        y: face.y + face.height / 2,
        textStrokeWidth: 1,
        textStroke: 'black',
        textFill: 'white',
        height: 20,
        width: face.width,
        align: 'center',
        fontFamily: 'serif'
      });
      textLayer.add(text);
      rect = new Kinetic.Rect({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height,
        stroke: 'red'
      });
      faceLayer.add(rect);
    }
    avgFace.w /= comp.length;
    avgFace.h /= comp.length;
    faceLayer.draw();
    textLayer.draw();
    userFaces = [];
    stage.on('click', function(evt) {
      var $container, offset, user;
      $container = $(stage.getContainer());
      offset = $container.offset();
      user = new Kinetic.Rect({
        x: evt.pageX - offset.left - 25,
        y: evt.pageY - offset.top - 25,
        width: avgFace.w,
        height: avgFace.h,
        stroke: 'blue',
        strokeWidth: 1,
        draggable: true
      });
      user.on('click', function(evt) {
        if (evt.ctrlKey) {
          userLayer.remove(user);
          userFaces.splice(user.position, 1);
          userLayer.draw();
        }
        evt.cancelBubble = true;
      });
      user.position = userFaces.length;
      userFaces.push(user);
      userLayer.add(user);
      userLayer.draw();
    });
  };

}).call(this);
