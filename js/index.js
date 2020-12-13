"use strict";

function _typeof(obj) { "@babel/helpers - typeof"; if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

// ///////////////////////////////////////////////
// Enter everything into a self-firing function
// Jquery Chaining!
// Creating same jquery selectors too hefty - look to chain or maintain an initial variable
// $ is suppose to represent jquery object
// Consistent naming ex: 'e'
// ///////////////////////////////////////////////
$(function () {
  var config = {
    desktopDimension: 400,
    mobileDimension: [350, 300] // thumbnailPlaceholder : 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw==',

  }; // Jquery Common Elements

  var $el = {
    doc: $(document),
    window: $(window),
    thumbnailImage: $('#thumbnailImage'),
    fileUpload: $('#fileUpload'),
    croppingImage: $('#croppingImage'),
    // Dynamically created elements
    cropMarker: '',
    icContainer: ''
  };
  var finalDimensionHeight = $el.window.width() > 600 ? config.desktopDimension : config.mobileDimension[0];
  var finalDimensionWidth = $el.window.width() > 600 ? config.desktopDimension : config.mobileDimension[1]; // global Vars

  var croppedObject; // **************
  // *IMAGE CROP MODIFIED FROM (https://codepen.io/Mestika/pen/qOWaqp?editors=1010)
  // * Rotation Added using Base64 Function
  // *************
  // !!!! MOBILE ISSUES

  function isTainted(ctx) {
    try {
      var pixel = ctx.getImageData(0, 0, 1, 1);
      return false;
    } catch (err) {
      return err.code === 18;
    }
  } // TODO Clear


  function imageCropper() {
    // let minDimension = $el.originalImage.width() < $el.originalImage.height() ? $el.originalImage.width() : $el.originalImage.height();
    var imageScale;
    var imageRatio;
    var cropRatio;
    var adjustedRequiredWidth;
    var adjustedRequiredHeight; // * State of Movements and Resize

    var eventState = {};
    var allowResize = true;
    var imageLoaded = new $.Deferred();
    var origSrc = new Image(); // origSrc.crossOrigin = 'Anonymous';

    origSrc.src = $el.croppingImage.attr('src'); // *****************************
    // * Initialize cropper tools on DOM when image loads
    // *
    // *****************************

    origSrc.onload = function () {
      // * Crop Tool Markers
      $el.croppingImage.wrap('<div class="ic-container"></div>').before('\
                    <div class="ic-overlay-n" id="icOverlayN"></div>\
                    <div class="ic-overlay-e" id="icOverlayE"></div>\
                    <div class="ic-overlay-s" id="icOverlayS"></div>\
                    <div class="ic-overlay-w" id="icOverlayW"></div>\
                    <div class="ic-crop-marker" id="icCropMarker">\
                        <div class="ic-resize-handle-nw" id="icResizeHandleNW"></div>\
                        <div class="ic-resize-handle-ne" id="icResizeHandleNE"></div>\
                        <div class="ic-resize-handle-sw" id="icResizeHandleSW"></div>\
                        <div class="ic-resize-handle-se" id="icResizeHandleSE"></div>\
                        <div class="ic-move-handle" id="icMoveHandle"></div>\
                    </div>\
                ');
      $el.cropMarker = $('#icCropMarker');
      $el.icContainer = $('.ic-container'); // * Initiale sizing for Resizing function

      imageScale = origSrc.width / $el.croppingImage.width();
      imageRatio = origSrc.width / origSrc.height;
      cropRatio = finalDimensionWidth / finalDimensionHeight;
      adjustedRequiredWidth = finalDimensionWidth / imageScale;
      adjustedRequiredHeight = finalDimensionHeight / imageScale; // * Initial Setting Cropper Marker

      centerCropMarker();
      repositionOverlay(); // * Resizing Actions

      $el.cropMarker.on('mousedown touchstart', startResize);
      $el.cropMarker.on('mousedown touchstart', '#icMoveHandle', startMoving);
      imageLoaded.resolve(); // console.log($el.cropMarker.position())
    }; // **********************
    // * Resizing Crop Marker
    // **********************


    function startResize(e) {
      e.preventDefault();
      e.stopPropagation();
      saveEventState(e);
      $el.doc.on('mousemove touchmove', resizing);
      $el.doc.on('mouseup touchend', endResize);
    }

    function endResize(e) {
      e.preventDefault();
      $el.doc.off('mouseup touchend', endResize);
      $el.doc.off('mousemove touchmove', resizing);
    }

    function resizing(e) {
      var width;
      var height;
      var left;
      var top;
      var originalWidth = $el.cropMarker.outerWidth(); //? Repeat?

      var originalHeight = $el.cropMarker.outerHeight(); //? Repeat?

      var originalOffset = $el.cropMarker.position(); //? Repeat?

      var mouse = {};
      mouse.x = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $el.window.scrollLeft(); //? Repeat?

      mouse.y = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $el.window.scrollTop(); //? Repeat?
      // * Identify which corner is moving

      var corners = {
        SE: false,
        SW: false,
        NW: false,
        NE: false
      };
      if (eventState.e.target.id === 'icResizeHandleSE') corners.SE = true;else if (eventState.e.target.id === 'icResizeHandleSW') corners.SW = true;else if (eventState.e.target.id === 'icResizeHandleNW') corners.NW = true;else if (eventState.e.target.id === 'icResizeHandleNE') corners.NE = true; // * Set cropper marker at new position

      if (corners.SE) {
        width = mouse.x - eventState.containerLeft - $el.croppingImage.offset().left;
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = eventState.containerLeft;
        top = eventState.containerTop;
      } else if (corners.SW) {
        width = eventState.containerWidth - (mouse.x - eventState.containerLeft - $el.croppingImage.offset().left);
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = mouse.x - $el.croppingImage.offset().left;
        top = eventState.containerTop;
      } else if (corners.NW) {
        width = eventState.containerWidth - (mouse.x - eventState.containerLeft - $el.croppingImage.offset().left);
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = mouse.x - $el.croppingImage.offset().left;
        top = originalOffset.top + originalHeight - height;
      } else if (corners.NE) {
        width = mouse.x - eventState.containerLeft - $el.croppingImage.offset().left;
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = eventState.containerLeft;
        top = originalOffset.top + originalHeight - height;
      } // * Set Border Limits on Crop Marker


      if (top >= 0 && left >= 0 && Math.round(top + height) <= Math.round($el.croppingImage.height()) && Math.round(left + width) <= Math.round($el.croppingImage.width())) allowResize = true;

      if (allowResize) {
        // * Top boundary
        if (top < 0) {
          height = originalHeight + originalOffset.top;
          width = width / finalDimensionWidth * finalDimensionHeight;
          top = 0;
          if (corners.NW) left = originalOffset.left - (width - originalWidth);
          allowResize = false;
        } // * Left boundary
        else if (left < 0) {
            width = originalWidth + originalOffset.left;
            height = width / finalDimensionWidth * finalDimensionHeight;
            left = 0;
            if (corners.SE) top = originalOffset.top - (height - originalHeight);
            allowResize = false;
          } // * Bottom boundary
          else if (Math.round(top + height) > Math.round($el.croppingImage.height())) {
              height = $el.croppingImage.height() - top;
              width = width / finalDimensionWidth * finalDimensionHeight;
              if (corners.SW) left = originalOffset.left - (width - originalWidth);
              allowResize = false;
            } // * Right boundary
            else if (Math.round(left + width) > Math.round($el.croppingImage.width())) {
                width = $el.croppingImage.width() - left;
                height = width / finalDimensionWidth * finalDimensionHeight;
                if (corners.NE) top = originalOffset.top - (height - originalHeight);
                allowResize = false;
              } // console.log('top',top);
        // * Check for min width / height


        if (width > adjustedRequiredWidth && height > adjustedRequiredHeight) {
          $el.cropMarker.outerWidth(width).outerHeight(height);
          $el.cropMarker.css({
            left: left,
            top: top
          });
        } else {
          if (corners.SW || corners.NW) left -= adjustedRequiredWidth - width;
          if (corners.NW || corners.NE) top -= adjustedRequiredHeight - height;
          $el.cropMarker.outerWidth(adjustedRequiredWidth).outerHeight(adjustedRequiredHeight);
          $el.cropMarker.css({
            left: left,
            top: top
          });
        }
      }

      repositionOverlay();
    } // **********************
    // * Moving Crop Marker
    // **********************


    function startMoving(e) {
      e.preventDefault();
      e.stopPropagation();
      saveEventState(e);
      $el.doc.on('mousemove touchmove', moving);
      $el.doc.on('mouseup touchend', endMoving);
    }

    function endMoving(e) {
      e.preventDefault();
      $el.doc.off('mouseup touchend', endMoving);
      $el.doc.off('mousemove touchmove', moving);
    }

    function moving(e) {
      e.stopPropagation();
      var touches = e.originalEvent.touches;
      var mouse = {};
      mouse.x = (e.clientX || e.pageX || touches[0].clientX) + $el.window.scrollLeft();
      mouse.y = (e.clientY || e.pageY || touches[0].clientY) + $el.window.scrollTop();
      var top = mouse.y - (eventState.mouseY - eventState.containerTop);
      var left = mouse.x - (eventState.mouseX - eventState.containerLeft);
      if (top < 0) top = 0;
      if (top + $el.cropMarker.outerHeight() > $el.croppingImage.height()) top = $el.croppingImage.height() - $el.cropMarker.height();
      if (left < 0) left = 0;
      if (left + $el.cropMarker.outerWidth() > $el.croppingImage.width()) left = $el.croppingImage.width() - $el.cropMarker.width();
      $el.cropMarker.css({
        top: top,
        left: left
      });
      repositionOverlay();
    } // * Promise Action, maitain updated position/size


    var saveEventState = function saveEventState(e) {
      eventState.containerWidth = $el.cropMarker.outerWidth();
      eventState.containerHeight = $el.cropMarker.outerHeight();
      eventState.containerLeft = $el.cropMarker.position().left;
      eventState.containerTop = $el.cropMarker.position().top;
      eventState.mouseX = (e.clientX || e.pageX || e.originalEvent.touches[0].clientX) + $(window).scrollLeft();
      eventState.mouseY = (e.clientY || e.pageY || e.originalEvent.touches[0].clientY) + $(window).scrollTop();
      eventState.e = e;
    };

    var centerCropMarker = function centerCropMarker() {
      var origWidth = $el.croppingImage.width();
      var origHeight = $el.croppingImage.height(); // console.log({origWidth, origHeight })

      if (cropRatio > imageRatio) {
        // console.log('crop > image', ((origWidth - $el.cropMarker.height()) / 2));
        $el.cropMarker.outerWidth(origWidth);
        $el.cropMarker.outerHeight($el.cropMarker.outerWidth() / finalDimensionWidth * finalDimensionHeight);
        $el.cropMarker.css({
          top: "".concat((origHeight - $el.cropMarker.height()) / 2, "px"),
          left: 0
        });
      } else {
        // console.log('crop < image')
        $el.cropMarker.outerHeight(origHeight);
        $el.cropMarker.outerWidth($el.cropMarker.outerHeight() / finalDimensionWidth * finalDimensionHeight);
        $el.cropMarker.css({
          left: "".concat((origWidth - $el.cropMarker.width()) / 2, "px"),
          top: 0
        });
      }
    };

    function repositionOverlay() {
      var imgWidth = $el.croppingImage.width();
      var imgHeight = $el.croppingImage.height();
      var cropTop = $el.cropMarker.position().top;
      var cropLeft = $el.cropMarker.position().left;
      var cropWidth = $el.cropMarker.width();
      var cropHeight = $el.cropMarker.height(); // console.log('imgWidth', imgWidth);
      // console.log('cropLeft', cropLeft);
      // console.log('cropWidth', cropWidth);
      // const cropBorder = parseFloat($cropMarker.css('border-top-width'));

      $('#icOverlayN').css({
        right: imgWidth - cropLeft - cropWidth,
        height: cropTop,
        left: cropLeft
      });
      $('#icOverlayE').css({
        left: cropLeft + cropWidth
      });
      $('#icOverlayS').css({
        right: imgWidth - cropLeft - cropWidth,
        top: cropTop + cropHeight,
        left: cropLeft
      });
      $('#icOverlayW').css({
        width: cropLeft
      });
    } // * External Import


    function rotateBase64Image(base64data, direction) {
      return new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        var ctx = canvas.getContext('2d');
        var degrees = direction === 'right' ? 90 : -90;
        var image = new Image();
        image.src = base64data;

        image.onload = function () {
          var w = image.width;
          var h = image.height;
          var rads = degrees * Math.PI / 180;
          var c = Math.cos(rads);
          var s = Math.sin(rads);
          if (s < 0) s = -s;
          if (c < 0) c = -c; //use translated width and height for new canvas

          canvas.width = h * s + w * c;
          canvas.height = h * c + w * s; //draw the rect in the center of the newly sized canvas

          ctx.translate(canvas.width / 2, canvas.height / 2);
          ctx.rotate(degrees * Math.PI / 180);
          ctx.drawImage(image, -image.width / 2, -image.height / 2); //assume plain base64 if not provided
          // canvas.toDataURL("image/jpeg")

          var newImageSrc;

          if (isTainted(ctx)) {
            newImageSrc = 'placeholder.png';
          } else {
            newImageSrc = canvas.toDataURL("image/jpeg");
          }

          resolve(newImageSrc); // document.body.removeChild(canvas);
        };

        image.onerror = function () {
          reject("Unable to rotate data\n" + image.src);
        };
      });
    }

    this.rotateRight = function () {
      rotateBase64Image($el.croppingImage.attr('src'), 'right').then(function (rotated) {
        if (rotated) {
          $el.croppingImage.attr('src', "".concat(rotated));
          $el.croppingImage.on('load', function () {
            addImage($el.croppingImage);
          });
        }
      }).catch(function (err) {
        console.error(err);
      });
    };

    this.rotateLeft = function () {
      rotateBase64Image($el.croppingImage.attr('src'), 'left').then(function (rotated) {
        if (rotated) {
          $el.croppingImage.attr('src', "".concat(rotated));
          $el.croppingImage.on('load', function () {
            addImage($el.croppingImage);
          });
        }
      }).catch(function (err) {
        console.error(err);
      });
    }; // * Crop Image and return a JPG
    // TODO : Check if necessary - Might be better to leave as Canvas


    this.crop = function () {
      // console.log('cropping');
      var cropCanvas;
      var scale = origSrc.width / $el.croppingImage.width();
      var left = Math.round($el.cropMarker.position().left * scale);
      var top = Math.round($el.cropMarker.position().top * scale);
      var width = Math.round($el.cropMarker.outerWidth() * scale);
      var height = Math.round($el.cropMarker.outerHeight() * scale);
      cropCanvas = document.createElement('canvas');
      cropCanvas.width = finalDimensionWidth;
      cropCanvas.height = finalDimensionHeight;
      cropCanvas.getContext('2d').drawImage(origSrc, left, top, width, height, 0, 0, finalDimensionWidth, finalDimensionHeight);
      console.log(_typeof(cropCanvas));
      console.log(isTainted(cropCanvas));

      if ((cropCanvas instanceof Blob || _typeof(cropCanvas) === 'object') && isTainted(cropCanvas)) {
        cropCanvas.toBlob(function (blob) {
          var newImg = document.createElement('img');
          var url = URL.createObjectURL(blob);
          $el.thumbnailImage.attr('src', url);
          $el.thumbnailImage.removeClass('hidden');
          $('#group1b').removeClass('hidden');
          $('#imageResize').addClass('hidden');
          $('#group1a').addClass('hidden');

          newImg.onload = function () {
            URL.revokeObjectURL(url);
          };
        }, 'image/jpg', 1.0);
      } else {
        $el.croppingImage.attr('src', 'placeholder.png');
        $el.croppingImage.on('load', function () {
          addImage($el.croppingImage);
        });
      }
    };

    this.position = function (left, top, width, height) {
      $.when(imageLoaded).done(function () {
        var scale = origSrc.width / $el.croppingImage.width();
        left = Math.round(left / scale), top = Math.round(top / scale), width = Math.round(width / scale), height = Math.round(height / scale);
        $el.cropMarker.outerWidth(width).outerHeight(height);
        $el.cropMarker.css({
          left: left,
          top: top
        });
        repositionOverlay();
      });
    };
    /**
    * Create Canvas with Both Images on it and Saves it
    */


    this.createImage = function () {
      // Overlay Final Top Position Relative to Image
      // const overlayFinalTop = $el.overlayDrag.position().top - $el.thumbnailImage.position().top;
      var cropCanvas = document.createElement('canvas');
      cropCanvas.width = finalDimensionWidth;
      cropCanvas.height = finalDimensionHeight;
      cropCanvas.id = 'finalImage';
      cropCanvas.getContext('2d').drawImage($el.thumbnailImage[0], 0, 0, finalDimensionWidth, finalDimensionHeight, 0, 0, finalDimensionWidth, finalDimensionHeight); // cropCanvas.getContext('2d').drawImage($el.overlayImage[0], 0, 0, finalDimension, overlayHeight, 0, overlayFinalTop, finalDimension, overlayHeight);
      // Save Image using FileSaver.js Library

      cropCanvas.toBlob(function (blob) {
        saveAs(blob, 'finalImage.png');
      });
    }; // Viewport resize


    $(window).resize(function () {
      imageScale = origSrc.width / $el.croppingImage.width();
      adjustedRequiredWidth = finalDimensionWidth / imageScale;
      adjustedRequiredHeight = finalDimensionHeight / imageScale;
      centerCropMarker();
      repositionOverlay();
    });
  }

  ;
  /**
   * Append Image to screen and clone original image for recrop-ability
   * @param {HTML IMG Element} image
   */

  function addImage(image) {
    // Remove old image
    $('.image-resize *').remove(); // set attributes and add image

    $el.croppingImage = $(image); // $el.originalImage.attr('id', 'fullImage').removeClass();

    $('#imageResize').append($el.croppingImage); // Initialize imageCropper

    croppedObject = new imageCropper();
  }
  /**
   * Remove thumbnail from screen and show crop tool
   */


  function cropReset() {
    $el.thumbnailImage.addClass('hidden');
    $('#group1b').addClass('hidden');
    $('#imageResize').removeClass('hidden');
    $('#group1a').removeClass('hidden');
  }
  /**
   * Converts image previews within cropTool
   * @param {File Input} data
   * @returns true || false
   */


  function loadImage(data) {
    var file = data.files[0];
    var reader = new FileReader();
    reader.readAsDataURL(file);

    reader.onload = function (e) {
      var img = new Image(); // Set Image source

      img.src = e.target.result;
      img.id = 'croppingImage'; // Clear fileInput

      $el.fileUpload.val('');
      cropReset();

      img.onload = function () {
        if (img.width >= finalDimensionWidth && img.height >= finalDimensionHeight) {
          addImage(img);
        }
      };
    };
  }

  function readUrl(url) {
    var img = new Image();

    if (url.length > 20) {
      img.src = url;
    } else {
      img.src = "placeholder.png";
    } // Set Image source


    img.id = 'croppingImage'; // Clear fileInput

    $el.fileUpload.val('');
    cropReset();

    img.onload = function () {
      if (img.width >= finalDimensionWidth && img.height >= finalDimensionHeight) {
        addImage(img);
      }
    };
  }

  $('#imageSelect').on('click', function () {
    $el.fileUpload.trigger('click');
  });
  $('#urlSelectInput').on('paste', function (e) {
    setTimeout(function () {
      readUrl(e.target.value);
    }, 100);
  });
  $el.fileUpload.on('change', function (e) {
    loadImage(e.target);
  });
  $('#crop').on('click', function (e) {
    e.stopPropagation();
    croppedObject.crop();
  });
  $('#rotateRight').on('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    croppedObject.rotateRight();
  });
  $('#rotateLeft').on('click', function (e) {
    e.stopPropagation();
    e.preventDefault();
    croppedObject.rotateLeft();
  });
  $('#recrop').on('click', function () {
    cropReset();
  });
  $('#download').on('click', function () {
    croppedObject.createImage();
  });
  $el.window.on('load', function () {
    croppedObject = new imageCropper();
  });
});