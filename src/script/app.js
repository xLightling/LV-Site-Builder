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

          // it is assumed that the first level content is an array of content objects
          jsonDoc.content.forEach(c => { addContent(tempDoc, c, tempDoc.querySelector("main"), navUL); });
          console.log(tempDoc.body.innerHTML);
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
** document: needed for creating elements
** workingContent: the current working content - child content can be an array of content objects or a string;
**    strings are directly appended based on type (i.e. type="p" creates p node);
**    arrays of objects are recursed (e.g. sections create a section that becomes the new working parent)
** workingParent: the Node to call appendChild() on
** workingNav: the Node to appendChild() navigation on if the content is of type "section"
*/
function addContent(document, workingContent, workingParent, workingNav) {
  switch(workingContent.type) {
    case "section":
      // Determine heading
      let num = 2; // this will be incremented for every level the section is; starts at 2 because 1 is reserved for the page heading
      let parent = workingParent;
      // Navigate upward until no more parents are left, incrementing heading number if a parent is a section
      while (!(parent.parentNode === null)) {
        if (parent.tagName === "SECTION")
          num++;
        parent = parent.parentNode;
      }
      // Handle heading creation
      let s = document.createElement("section");
      let heading = document.createElement("h" + num);
      heading.innerHTML = workingContent.title;
      heading.id = workingContent.nav;
      s.appendChild(heading);
      workingParent.appendChild(s);

      // Handle navigation
      let li = document.createElement("li");
      let a = document.createElement("a");
      a.href = "#" + workingContent.nav;
      a.innerHTML = workingContent.title;
      li.appendChild(a);
      // The first level of addContent means that workingNav will be ul
      if (workingNav.tagName === "UL")
        workingNav.appendChild(li);
      // Once recursion starts, workingNav will be li
      else {
        // Grab the ul in the workingNav, or create one if one is not yet present
        let ul = workingNav.querySelector("ul");
        if (ul === null)
          ul = document.createElement("ul");
        workingNav.appendChild(ul);
        ul.appendChild(li);
      }

      workingContent.content.forEach( c => addContent(document, c, s, li));
      break;
    case "p":
      let p = document.createElement("p");
      p.innerHTML = workingContent.content;
      workingParent.appendChild(p);
      break;
    default:
      console.log("Error: Unknown value of type " + workingContent.type + " in the following content block: " + workingContent.toString());
      break;
  }
}
