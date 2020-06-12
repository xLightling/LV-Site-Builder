window.$ = window.jQuery = require('jquery');
fs = require('fs');
jsdom = require('jsdom');
Electron = require('electron');

$(document).ready(function() {
  $("#buttonAddFiles").click(function() {
    Electron.remote.dialog.showOpenDialog({ filters: [{ name: 'XML', extensions: [ 'xml' ] }], properties: ['openFile', 'multiSelections'] }).then((data) => {
      data.filePaths.forEach( e => {
        $("#filelist").append(function() {
          return $('<listelem data-path="' + e + '">' + e.replace(/^.*[\\\/]/, '') + '</listelem>').click(function() {
            $(this).toggleClass("selected");
          });
        });
      });
    });
  });

  $("#buttonRemoveFiles").click(function() {
    [].slice.call($("#filelist").children()).forEach( e => {
      if (e.classList.contains("selected"))
        e.remove();
    });
  });

  $("#buttonMakeFiles").click(function() {
    let files = [];
    let template = $("#textTemplate").val();
    [].slice.call($("#filelist").children()).forEach( e => {
      files.push(e.dataset.path);
    });

    files.forEach( path => {
      fs.readFile(template, 'utf8', function(err, data) {
        if (err) throw err;

        let tempWindow = new jsdom.JSDOM(data, { runScripts: "outside-only" });
        console.log(tempWindow.window.document.querySelector(".breadcrumb-nav"));
      });
    });
  });

  $("#textPath").click(function() {
    Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => {
      $(this).val(data.filePaths[0]);
    });
  });

  $("#textTemplate").click(function() {
    Electron.remote.dialog.showOpenDialog({ filters: [{ name: 'HTML', extensions: [ 'htm', 'html' ] }] }).then((data) => {
      $(this).val(data.filePaths[0]);
    });
  });
});
