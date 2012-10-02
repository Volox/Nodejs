
  $(function() {
    var $canvas, $msg, LEFT_MOUSE_BTN, NUM_FACES, RIGHT_MOUSE_BTN, avgFace, createImage, detectFaces, drawBoundingBox, faceLayer, facesDetected, facesSkipped, facesUser, imageLayer, imgNum, imgPath, stopTime, time, timer, userLayer;
    var _this = this;
    $msg = $('.alert.alert-info span');
    $canvas = $('#canvas');
    imageLayer = new Kinetic.Layer;
    faceLayer = new Kinetic.Layer;
    userLayer = new Kinetic.Layer;
    RIGHT_MOUSE_BTN = 3;
    LEFT_MOUSE_BTN = 1;
    facesDetected = {};
    facesSkipped = [];
    facesUser = {};
    avgFace = {
      w: 0,
      h: 0
    };
    NUM_FACES = 7;
    timer = null;
    time = 1000 * 5;
    imgNum = Math.ceil(Math.random() * NUM_FACES);
    imgPath = "/img/faces/faces (" + imgNum + ").jpg";
    stopTime = function() {
      console.log('Time Stop!');
      return alert('Time end!!!');
    };
    createImage = function(imageUrl) {
      var img;
      img = new Image;
      img.onload = function() {
        console.log('Image loaded!');
        console.log('Detecting faces');
        detectFaces(img);
        return timer = setTimeout(stopTime, time);
      };
      img.src = imageUrl;
      return console.log("Loading image: " + imageUrl);
    };
    drawBoundingBox = function(face) {
      var rect;
      rect = new Kinetic.Rect({
        x: face.x,
        y: face.y,
        width: face.width,
        height: face.height,
        stroke: 'red'
      });
      return rect;
    };
    detectFaces = function(img) {
      var assign, bb, comp, face, image, stage, _i, _len;
      $('#canvas').empty();
      stage = new Kinetic.Stage({
        container: "canvas",
        width: img.width,
        height: img.height + 30
      });
      image = new Kinetic.Image({
        image: img
      });
      imageLayer.add(image);
      stage.add(imageLayer);
      stage.add(faceLayer);
      stage.add(userLayer);
      comp = ccv.detect_objects({
        canvas: ccv.pre(imageLayer.getCanvas()),
        cascade: cascade,
        min_neighbors: 1,
        interval: 5
      });
      console.log("" + comp.length + " faces detected");
      $msg.text(" " + comp.length + " faces detected");
      for (_i = 0, _len = comp.length; _i < _len; _i++) {
        face = comp[_i];
        assign = function(id, obj) {
          return facesDetected[id] = obj;
        };
        avgFace.w += face.width;
        avgFace.h += face.height;
        bb = drawBoundingBox(face);
        bb.on('click', function(evt) {
          if (evt.which === RIGHT_MOUSE_BTN) {
            console.log(facesDetected);
            console.log(bb);
            faceLayer.remove(bb);
            delete facesDetected[bb._id];
            return faceLayer.draw();
          }
        });
        faceLayer.add(bb);
        assign(bb._id, bb);
      }
      avgFace.w /= comp.length;
      avgFace.h /= comp.length;
      faceLayer.draw();
      $canvas.on('contextmenu', function(evt) {
        return false;
      });
      stage.on('click', function(evt) {
        var $container, offset, userRect;
        if (evt.which === LEFT_MOUSE_BTN) {
          $container = $(stage.getContainer());
          offset = $container.offset();
          userRect = new Kinetic.Rect({
            x: evt.pageX - offset.left - 25,
            y: evt.pageY - offset.top - 25,
            width: avgFace.w,
            height: avgFace.h,
            stroke: 'blue'
          });
          userRect.on('click', function(evt) {
            if (evt.which === RIGHT_MOUSE_BTN) {
              console.log(facesUser);
              console.log(userRect);
              userLayer.remove(userRect);
              delete facesUser[userRect._id];
              return userLayer.draw();
            }
          });
          facesUser[userRect._id] = userRect;
          userLayer.add(userRect);
          userLayer.draw();
        }
      });
    };
    return createImage(imgPath);
  });
