window.$ = window.jQuery = require('jquery');
fs = require('fs');
jsdom = require('jsdom');
Electron = require('electron');

$(document).ready(function() {
  $("#buttonAddFiles").click(function() {
    Electron.remote.dialog.showOpenDialog({ filters: [{ name: 'JSON', extensions: [ 'json' ] }], properties: ['openFile', 'multiSelections'] }).then((data) => {
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
      let parser = new DOMParser();
      fs.readFile(path, 'utf8', function(err, jData) {
        if (err) throw err;

        let jsonDoc = JSON.parse(jData);
        fs.readFile(template, 'utf8', function(err, tData) {
          if (err) throw err;

          let tempWindow = new jsdom.JSDOM(tData, { runScripts: "outside-only" });
          let tempDoc = tempWindow.window.document;
          tempDoc.querySelector("#breadcrumb").innerHTML = jsonDoc.breadcrumb;
          tempDoc.querySelector("#heading").innerHTML = "<h1>" + jsonDoc.heading + "</h1>";
          tempDoc.querySelector("footer").innerHTML = "";
          jsonDoc.footer.forEach( e => {
            let p = tempDoc.createElement("p");
            p.innerHTML = e;
            tempDoc.querySelector("footer").appendChild(p);
          });
          console.log(tempDoc.body.innerHTML);
        });
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
