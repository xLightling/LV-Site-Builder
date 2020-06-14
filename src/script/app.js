window.$ = window.jQuery = require('jquery');
fs = require('fs');
jsdom = require('jsdom');
Electron = require('electron');

// Set up buttons when document loads
$(document).ready(function() {
  // The add files button opens a file dialog for .json files, then for each file selected appends a new list element (with a click event for selections) to the file list
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

  // The remove files list looks for any selected listelement in the file list then removes it from the page
  $("#buttonRemoveFiles").click(function() {
    [].slice.call($("#filelist").children()).forEach( e => {
      if (e.classList.contains("selected"))
        e.remove();
    });
  });

  // The make files button is the core functionality of the app: it brings together the template and .json files and outputs built HTML files to the output directory
  $("#buttonMakeFiles").click(function() {
    let files = [];
    let template = $("#textTemplate").val();
    [].slice.call($("#filelist").children()).forEach( e => {
      files.push(e.dataset.path);
    });

    // For every .json file, open and parse it
    files.forEach( path => {
      fs.readFile(path, 'utf8', function(err, jData) {
        if (err) throw err;

        let jsonDoc = JSON.parse(jData);
        // Open the template
        fs.readFile(template, 'utf8', function(err, tData) {
          if (err) throw err;

          // Use JSDOM to edit template, grab reference to window.document
          // Note that tData and jData are strings, tempDoc and jsonDoc are the actual objects to use
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

          let nav = tempDoc.createElement("nav");
          let navUL = tempDoc.createElement("ul");
          nav.appendChild(navUL);
          tempDoc.querySelector("#heading").appendChild(nav);

          jsonDoc.content.forEach(c => { addContent(c, tempDoc.querySelector("main"), navUL); });
        });
      });
    });
  });

  // The path text-input opens a folder dialog to select a folder for outputting files
  $("#textPath").click(function() {
    Electron.remote.dialog.showOpenDialog({ properties: [ 'openDirectory' ] }).then((data) => {
      $(this).val(data.filePaths[0]);
    });
  });

  // The template text-input opens a .html file selection for selecting a template file
  $("#textTemplate").click(function() {
    Electron.remote.dialog.showOpenDialog({ filters: [{ name: 'HTML', extensions: [ 'htm', 'html' ] }] }).then((data) => {
      $(this).val(data.filePaths[0]);
    });
  });
});

/*
** Navigates through content and appends it to the body, attaches to navigation if applicable (sections), and recurses if there is deeper content
*/
function addContent(content, parentNode, navNode) {
  switch(content.type) {
    case "section":
      console.log("works");
      break;
    default:
      break;
  }
}
