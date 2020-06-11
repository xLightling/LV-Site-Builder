window.$ = window.jQuery = require('jquery');
Electron = require('electron');

$(document).ready(function() {
  $("#buttonAddFiles").click(function() {
    Electron.remote.dialog.showOpenDialog({ properties: ['openFile', 'multiSelections'] }).then((data) => {
      data.filePaths.forEach( e => {
          $("#filelist").append(function() {
            return $('<listelem data-path="' + e + '">' + e.replace(/^.*[\\\/]/, '') + '</listelem>').click(function() {
              $(this).toggleClass("selected");
          })
        })
      });
    });
  })
});
