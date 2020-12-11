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
    mobileDimension: [350, 300],
    thumbnailPlaceholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAP///wAAACH5BAEAAAAALAAAAAABAAEAAAICRAEAOw=='
  }; // Jquery Common Elements

  var $el = {
    doc: $(document),
    window: $(window),
    // sectionDragDrop:    $('#sectionDragAndDrop'),
    drop: $('#drop'),
    // sectionCrop:        $('#sectionCrop'),
    // thumbnail:          $('#thumbnail'),
    thumbnailImage: $('#thumbnailImage'),
    // sectionThumbnail:   $('#sectionThumbnail'),
    // overlayImage:       $('#overlayIMG'),
    // overlayDrag:        $('#overlayDrag'),
    fileUpload: $('#fileUpload'),
    originalImage: $('.originalImage'),
    // Dynamically created elements
    backUpImage: '',
    cropMarker: '',
    icContainer: ''
  };
  var finalDimensionHeight = $el.window.width() > 600 ? config.desktopDimension : config.mobileDimension[0];
  var finalDimensionWidth = $el.window.width() > 600 ? config.desktopDimension : config.mobileDimension[1]; // global Vars

  var croppedObject; // if ($el.thumbnailImage.attr('src') === '')
  // $el.thumbnailImage.attr('src', config.thumbnailPlaceholder).width(finalDimensionWidth);
  // $el.overlayDrag.css('top', $el.thumbnailImage.position().top);
  // **************
  // *IMAGE CROP MODIFIED FROM (https://codepen.io/Mestika/pen/qOWaqp?editors=1010)
  // * Rotation Added using Base64 Function
  // *************

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
    var origSrc = new Image();
    origSrc.crossOrigin = 'Anonymous';
    origSrc.src = $el.originalImage.attr('src'); // *****************************
    // * Initialize cropper tools on DOM when image loads
    // *
    // *****************************

    origSrc.onload = function () {
      // * Crop Tool Markers
      $el.originalImage.wrap('<div class="ic-container"></div>').before('\
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

      imageScale = origSrc.width / $el.originalImage.width();
      imageRatio = origSrc.width / origSrc.height;
      cropRatio = finalDimensionWidth / finalDimensionHeight;
      adjustedRequiredWidth = finalDimensionWidth / imageScale;
      adjustedRequiredHeight = finalDimensionHeight / imageScale; // * Initial Setting Cropper Marker

      centerCropMarker();
      repositionOverlay(); // * Resizing Actions

      $el.cropMarker.on('mousedown touchstart', startResize);
      $el.cropMarker.on('mousedown touchstart', '#icMoveHandle', startMoving);
      imageLoaded.resolve();
      console.log($el.cropMarker.position());
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
        width = mouse.x - eventState.containerLeft - $el.originalImage.offset().left;
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = eventState.containerLeft;
        top = eventState.containerTop;
      } else if (corners.SW) {
        width = eventState.containerWidth - (mouse.x - eventState.containerLeft - $el.originalImage.offset().left);
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = mouse.x - $el.originalImage.offset().left;
        top = eventState.containerTop;
      } else if (corners.NW) {
        width = eventState.containerWidth - (mouse.x - eventState.containerLeft - $el.originalImage.offset().left);
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = mouse.x - $el.originalImage.offset().left;
        top = originalOffset.top + originalHeight - height;
      } else if (corners.NE) {
        width = mouse.x - eventState.containerLeft - $el.originalImage.offset().left;
        height = width / finalDimensionWidth * finalDimensionHeight;
        left = eventState.containerLeft;
        top = originalOffset.top + originalHeight - height;
      } // * Set Border Limits on Crop Marker


      if (top >= 0 && left >= 0 && Math.round(top + height) <= Math.round($el.originalImage.height()) && Math.round(left + width) <= Math.round($el.originalImage.width())) allowResize = true;

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
          else if (Math.round(top + height) > Math.round($el.originalImage.height())) {
              height = $el.originalImage.height() - top;
              width = width / finalDimensionWidth * finalDimensionHeight;
              if (corners.SW) left = originalOffset.left - (width - originalWidth);
              allowResize = false;
            } // * Right boundary
            else if (Math.round(left + width) > Math.round($el.originalImage.width())) {
                width = $el.originalImage.width() - left;
                height = width / finalDimensionWidth * finalDimensionHeight;
                if (corners.NE) top = originalOffset.top - (height - originalHeight);
                allowResize = false;
              }

        console.log('top', top); // * Check for min width / height

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
      if (top + $el.cropMarker.outerHeight() > $el.originalImage.height()) top = $el.originalImage.height() - $el.cropMarker.height();
      if (left < 0) left = 0;
      if (left + $el.cropMarker.outerWidth() > $el.originalImage.width()) left = $el.originalImage.width() - $el.cropMarker.width();
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
      var origWidth = $el.originalImage.width();
      var origHeight = $el.originalImage.height(); // console.log({origWidth, origHeight })

      if (cropRatio > imageRatio) {
        // console.log('crop > image', ((origWidth - $el.cropMarker.height()) / 2));
        $el.cropMarker.outerWidth(origWidth);
        $el.cropMarker.outerHeight($el.cropMarker.outerWidth() / finalDimensionWidth * finalDimensionHeight);
        $el.cropMarker.css({
          top: "".concat((origHeight - $el.cropMarker.height()) / 2, "px"),
          left: 0
        });
      } else {
        console.log('crop < image');
        $el.cropMarker.outerHeight(origHeight);
        $el.cropMarker.outerWidth($el.cropMarker.outerHeight() / finalDimensionWidth * finalDimensionHeight);
        $el.cropMarker.css({
          left: "".concat((origWidth - $el.cropMarker.width()) / 2, "px"),
          top: 0
        });
      }
    };

    function repositionOverlay() {
      var imgWidth = $el.originalImage.width();
      var imgHeight = $el.originalImage.height();
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

          resolve(canvas.toDataURL("image/jpeg")); // document.body.removeChild(canvas);
        };

        image.onerror = function () {
          reject("Unable to rotate data\n" + image.src);
        };
      });
    }

    this.rotateRight = function () {
      rotateBase64Image($el.backUpImage.attr('src'), 'right').then(function (rotated) {
        // userAction('restart');
        $el.backUpImage.attr('src', "".concat(rotated));
      }).then(function () {
        if (_typeof($el.icContainer) === 'object') {
          $('.ic-container').remove();
        }
      }).then(function () {
        cloneAddImage($el.backUpImage);
        croppedObject = new imageCropper();
      }).catch(function (err) {
        console.error(err);
      });
    };

    this.rotateLeft = function () {
      rotateBase64Image($el.backUpImage.attr('src'), 'left').then(function (rotated) {
        $el.backUpImage.attr('src', "".concat(rotated));
      }).then(function () {
        if (_typeof($el.icContainer) === 'object') $el.icContainer.remove();
      }).then(function () {
        cloneAddImage($el.backUpImage);
        croppedObject = new imageCropper();
      }).catch(function (err) {
        console.error(err);
      });
    }; // * Crop Image and return a JPG
    // TODO : Check if necessary - Might be better to leave as Canvas


    this.crop = function () {
      console.log('cropping');
      var cropCanvas;
      var scale = origSrc.width / $el.originalImage.width();
      var left = Math.round($el.cropMarker.position().left * scale);
      var top = Math.round($el.cropMarker.position().top * scale);
      var width = Math.round($el.cropMarker.outerWidth() * scale);
      var height = Math.round($el.cropMarker.outerHeight() * scale);
      cropCanvas = document.createElement('canvas');
      cropCanvas.width = finalDimensionWidth;
      cropCanvas.height = finalDimensionHeight;
      cropCanvas.getContext('2d').drawImage(origSrc, left, top, width, height, 0, 0, finalDimensionWidth, finalDimensionHeight);
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
    };

    this.position = function (left, top, width, height) {
      $.when(imageLoaded).done(function () {
        var scale = origSrc.width / $el.originalImage.width();
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
      imageScale = origSrc.width / $el.originalImage.width();
      adjustedRequiredWidth = finalDimensionWidth / imageScale;
      adjustedRequiredHeight = finalDimensionHeight / imageScale;
      centerCropMarker();
      repositionOverlay();
    });
  }

  ;
  /**
  * Append Image to screen and clone original image for recrop-ability
  * @param {HTML IMG Element} originalImage
  */

  function cloneAddImage(originalImage) {
    $el.originalImage = $(originalImage); // $el.backUpImage = $el.originalImage.clone();

    $el.originalImage.attr('id', 'fullImage').removeClass(); // $el.backUpImage.attr('id', 'backUpImage').addClass('hidden');
    // $('#imageResize').append($el.backUpImage, $el.originalImage);

    $('#imageResize').append($el.originalImage);
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


  function addImage(data) {
    var file = data.files[0];
    var reader = new FileReader();

    reader.onload = function (e) {
      var img = new Image(); // Set Image source

      img.src = e.target.result;
      $el.originalImage.attr('src', e.target.result); // console.log($el.originalImage.attr('src'));
      // Clear fileInput

      $el.fileUpload.val(''); // Remove previous imageCropper

      $('.image-resize *').remove(); // userAction('restart');

      cropReset();
      $el.originalImage.on('load', function () {
        console.log('image loaded');
      });

      img.onload = function () {
        // If error message remove
        // const $sizeError = $('.sizeError');
        // if ($sizeError.length !== 0)
        //         $sizeError.remove();
        // Return error if image is not large enough
        if (img.width < finalDimensionWidth || img.height < finalDimensionHeight) {
          // $el.sectionDragDrop.append('<span class="sizeError">Please Try a Larger Image</span>');
          return false;
        } // Clone image if needed for recrop
        // cloneAddImage(img);
        // $el.originalImage = $(img);
        // $el.backUpImage = $el.originalImage.clone();


        $el.originalImage.attr('id', 'fullImage').removeClass(); // $el.backUpImage.attr('id', 'backUpImage').addClass('hidden');
        // $('#imageResize').append($el.backUpImage, $el.originalImage);

        $('#imageResize').append($el.originalImage); // Intialize cropper over image

        croppedObject = new imageCropper();
      };
    };

    reader.readAsDataURL(file);
  } // 'click tap': ,
  // console.log();
  // $el.sectionDragDrop[0].addEventListener('click', function(e) {
  // console.log('trigger click');
  // $el.fileUpload.trigger('click');
  // })
  // $el.sectionDragDrop.on('click', function() {
  //     console.log('trigger click');
  //     $el.fileUpload.trigger('click');
  // });
  // $Drop Action Listenvers
  // $el.sectionDragDrop.on({
  //     'dragover': function(e) {
  //         e.preventDefault();
  //         e.stopPropagation();
  //         this.classList.add('dragging');
  //     },
  //     'dragleave': function() {
  //         this.classList.remove('dragging');
  //     },
  //     'drop': function(e) {
  //         e.preventDefault();
  //         e.stopPropagation();
  //         addImage(e.dataTransfer || e.originalEvent.dataTransfer);
  //     }
  // });


  $('#imageSelect').on('click', function () {
    $el.fileUpload.trigger('click');
  });
  $el.fileUpload.on('change', function (e) {
    addImage(e.target);
  }); // $('.restart').on('click', (e) => {
  //     e.preventDefault();
  //     userAction('restart');
  // });

  $('#crop').on('click', function (e) {
    e.stopPropagation();
    croppedObject.crop(); // userAction('crop');
    // overlayObject = new overlayPosition();
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
  }); // $el.overlayDrag.on('mousedown touchstart', (e) => {overlayObject.startMoving(e)});

  $('#recrop').on('click', function () {
    cropReset();
  });
  $('#download').on('click', function () {
    croppedObject.createImage();
  });
  $el.window.on('load', function () {
    // cloneAddImage($el.originalImage);
    croppedObject = new imageCropper();
  });
});