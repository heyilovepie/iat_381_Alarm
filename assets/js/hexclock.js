
/////////////////////
//Tim Down code from http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb 
function componentToHex(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
}

function rgbToHex(r, g, b) {
    return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}

function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
//////////////////////

(function() {
  'use strict';

  /**
  * Converts the current time to a hex color and then changes the background to that color every second
  */
  function displayHexClock() {
    // Get the current time
    var clock = new Date(),
        h = clock.getHours(),
        m = clock.getMinutes(),
        s = clock.getSeconds();

    // Make sure that hours, minutes, and seconds are all 2 digits each
    if(h.toString().length < 2) { h = '0' + h; }
    if(m.toString().length < 2) { m = '0' + m; }
    if(s.toString().length < 2) { s = '0' + s; }

    var time = h + ':' + m + ':' + s;
    var color = '#' + h + m + s;
    var rgb = hexToRgb(color);

    //make color lighter
    rgb.r += 30;
    rgb.g += 30;
    rgb.b += 30;

    color = rgbToHex(rgb.r, rgb.g, rgb.b);

    // Change the background color to the hex color of the current time
    document.body.style.background = color;

    // Update the current time
    document.getElementById('time').innerHTML = time;

    // Update the current hex value
    document.getElementById('hexColor').innerHTML = color;
  }

  window.onload = function() {
    // Update the clock every second
    displayHexClock();
    setInterval(displayHexClock, 1000);
  };
})();