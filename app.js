$(function(){

  (function (doc, nav) {
    var video, width, height, context;
    var vines = $('.vine');
    var timePerVine = 12000;
    var currentVine = 0;

    var keying = {
      hMin: 64,
      hMax: 159,
      sMin: 0,
      sMax: 32,
      lMin: 6,
      lMax: 67
    };

    function getVine(startInterval) {
      $.getJSON('http://jsonp.jit.su/?callback=?&url=http://vinepeek.com/video', function(data){
        vines[currentVine].src = data.video_url;
        vines[currentVine].load();
        setTimeout(function() {
          vines[currentVine].play();
          vines[+!currentVine].pause();
          if (currentVine) {
            $(vines[1]).fadeIn();
          } else {
            $(vines[1]).fadeOut();
          }
          currentVine = +!currentVine;
          getVine(timePerVine);
        }, startInterval);
      });
    }

    // declare our variables
    var seriously, // the main object that holds the entire composition
        colorbars, // a wrapper object for our source image
        chroma,
        target; // a wrapper object for our target canvas

    seriously = new Seriously();

    // Create a source object by passing a CSS query string.

    // now do the same for the target canvas
    target = seriously.target('#canvas');
    chroma = seriously.effect('chroma');

    chroma.source = '#webcam';
    target.source = chroma;

    seriously.go();


    function loadGUI() {
      var f1;
      this.gui = new dat.GUI();
      f1 = this.gui.addFolder('Keying options');
      f1.add(keying, 'hMin').min(0).max(360).listen();
      f1.add(keying, 'hMax').min(0).max(360).listen();
      f1.add(keying, 'sMin').min(0).max(360).listen();
      f1.add(keying, 'sMax').min(0).max(360).listen();
      f1.add(keying, 'lMin').min(0).max(100).listen();
      f1.add(keying, 'lMax').min(0).max(100).listen();
      return f1.open();
    }

    function initialize() {
      // The source video.
      video = doc.getElementById("webcam");
      width = video.width;
      height = video.height;

      // The target canvas.
      var canvas = doc.getElementById("canvas");
      context = canvas.getContext("2d");

    //  loadGUI();
//
     // // Get the webcam's stream.
      nav.getUserMedia({video: true}, startStream, function () {});
//
      getVine(0);
    }

    function startStream(stream) {
      video.src = URL.createObjectURL(stream);
      video.play();

      // Ready! Let's start drawing.
      requestAnimationFrame(draw);
    }

    function draw() {
      //var frame = readFrame();
//
      //if (frame) {
      //  //replaceGreen(frame.data);
      //  context.putImageData(frame, 0, 0);
      //}
//
      //// Wait for the next frame.
      //requestAnimationFrame(draw);
    }

    function readFrame() {
      try {
        context.drawImage(video, 0, 0, width, height);
      } catch (e) {
        // The video may not be ready, yet.
        return null;
      }

      return context.getImageData(0, 0, width, height);
    }

    function replaceGreen(data) {
      var len = data.length;

      for (var i = 0, j = 0; j < len; i++, j += 4) {
        // Convert from RGB to HSL...
        var hsl = rgb2hsl(data[j], data[j + 1], data[j + 2]);
        var h = hsl[0], s = hsl[1], l = hsl[2];

        // ... and check if we have a somewhat green pixel.
        if (h >= keying.hMin && h <= keying.hMax && s >= keying.sMin && s <= keying.sMax && l >= keying.lMin && l <= keying.lMax) {
          data[j + 3] = 0;
        }
      }
    }

    function rgb2hsl(r, g, b) {
      r /= 255; g /= 255; b /= 255;

      var min = Math.min(r, g, b);
      var max = Math.max(r, g, b);
      var delta = max - min;
      var h, s, l;

      if (max == min) {
        h = 0;
      } else if (r == max) {
        h = (g - b) / delta;
      } else if (g == max) {
        h = 2 + (b - r) / delta;
      } else if (b == max) {
        h = 4 + (r - g) / delta;
      }

      h = Math.min(h * 60, 360);

      if (h < 0) {
        h += 360;
      }

      l = (min + max) / 2;

      if (max == min) {
        s = 0;
      } else if (l <= 0.5) {
        s = delta / (max + min);
      } else {
        s = delta / (2 - max - min);
      }

      return [h, s * 100, l * 100];
    }

    addEventListener("DOMContentLoaded", initialize);
  })(document, navigator);
});
