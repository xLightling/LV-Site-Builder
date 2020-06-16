# LV-Site-Builder
## About
The LV-Site-Builder (LightVerse Website Builder) builds HTML files from content stored in JSON files and an HTML template. This allows separation of larger page structure and inner content for editing purposes and avoid editing content directly in markup.

The LV-Site-Builder is built using Electron (for the UI and file/folder dialogs) and makes use of [Node.js File System](https://www.w3schools.com/nodejs/nodejs_filesystem.asp) (for file IO) and [JSDOM](https://github.com/jsdom/jsdom) (for opening and manipulating HTML with normal DOM-based JavaScript).

This app is not fully generalized to suit any site's purpose (e.g. the upper-most level of JSON files must include a breadcrumb, a heading, the page's content, and a footer); however, any site that has many pages of a similar format, as in the case of the LightVerse (inspired by wiki-style websites), may find use with this app after editing any relevant code.

## Code
In [app.js](src/script/app.js), events are attached to the text fields and buttons. The [Make Files](src/script/app.js#L30) button in particular is where the core of the app begins. Selected JSON files are opened then parsed, the template is read in and opened with JSDOM, and editing begins. The code chunk where the page title, breadcrumb, heading, and footer are set is LightVerse specific and can be deleted/edited for an alternate structure if needed. This is also the case for the code chunk where navigation is started, however this also requires editing in the `addContent()` method which depends on this navigation. `addContent()` is finally called for each top-level content object in the JSON file (this is assumed, and is assumed that content is added to main).

[`addContent()`](src/script/app.js#L121) is a recursive function that requires the document that is a part of the JSDOM object instance, a content object to work with, a parent Node (HTMLElement, not JQuery) to attach to, and a parent navigation Node to attach navigation to when sections are reached. `addContent()` determines and handles each of the valid `type` properties of content objects. See JSON Model for more info

## JSON Model
Example:  
```
{
	"breadcrumb": "<a href=\"/\">Some</a> / Path / Here",
	"heading": "Here",
	"content": [
		{
			"type": "p",
			"content": "This is a paragraph"
		},
		{
			"type": "ul",
			"ul": [
				{
					"type": "li",
					"li": "list element"
				},
				{
					"type": "li-ul",
					"li": "list element with child list",
					"ul": [
						{
							"type": "li",
							"li": "child list element"
						}
					]
				}
			]
		},
		{
			"type": "section",
			"title": "A Section",
			"nav": "a-sect",
			"content": [
				{
					"type": "p",
					"content: "Paragraph attached to section"
				},
				{
					"type": "img",
					"alt": "alt tag here",
					"caption": "caption for img.title and a p element",
					"src": "/path/to/image.whatever"
				},
				{
					"type": "aside",
					"content": "<p>An aside</p>"
				}
			]
	],
	"footer" [
		"Page Created: Yesteryear",
		"Last Edited: Thisteryear"
	]
}
```

`breadcrumb`, `heading`: LightVerse-required string properties  
`footer`: LightVerse-required string-array property  
`content`: Core property; at top-most level, **must** be an array of content-objects; otherwise, can be an array of content-objects or a string  
`type`: Required property of any type of content-object  
- `p` : Represents a paragraph element; requires string-based `content` property
- `ul` : Represents an unordered list; requires an array-based `ul` property (note: not `content`, due to li-ul requiring two things; semantically, `ul`'s members should be li, li-ul, or li-ol)
- `li` : Represents a list element; requires a string-based `li` property (note: not `content`, due to li-ul and li-ol requiring two things)
- `li-ul` : Represents a list element that has a child unordered list; requires a string-based `li` property and an array-based `ul` property
- `ol` : Represents an ordered list; requires an array-based `ol` property (note: not `content`, due to li-ol requiring two things; semantically, `ol`'s members should be li, li-ul, or li-ol)
- `li-ol` : Represents a list element that has a child ordered list; requires a string-based `li` property and an array-based `ol` property
- `aside` : Represents an aside; temporarily, aside has been treated as nearly identical to p, and as such innerHTML is hardcoded into the JSON; this may change at a later time due to violating the idea of avoiding HTML with the content
- `section` : Represents a section of content; requires a string-based `title` property (becomes a heading element), a string-based `nav` property (becomes the id of the section that the page navigation can point to), and an array-based `content` property
- `img` : Represents an image element; requires a string-based `alt` property (becomes img.alt), a string-based `caption` property (becomes img.title and a paragraph element with class "caption" below the image), and a string-based `src` property (becomes img.src) (note: the image and paragraph elements are parented to a singular div; the optional `classes` property is applied to the div)

`type`s that have array-based content cause `addContent()` to recurse. Every single content-object has an optional `classes` string-array so that classes can be applied to the elements that are created.

Because handling links with paragraph elements would become very complicated and out-of-scope, a tags still must be hardcoded into the JSON; Support for span may come at a later time, which would allow one to avoid this (though one must hardcode <br/> to get line breaks; it may also lead to confusing JSON content, thus why hard-coding the a tags into paragraph elements seemed the better alternative).  
For now, only the `li` element gets classes applied when using `li-ul` or `li-ol` in tandem with the `classes` property. The optional property may be changed at a later time to allow specification for what to apply the classes to (for example, splitting `classes` to `li-classes` and `ol-classes`/`ul-classes`, or making `classes` be an array of objects that holds true/false for those elements then defines a singular class all per object)

JSON was chosen as the format due to it being a mostly readable format, versatility, and parsing being a native function. XML was slightly more cluttered and too similar to HTML. While it was easier to encounter syntax errors with JSON (errors of which are somewhat difficult to report with the information that is available at certain points) and document line-count increased, it was easier to navigate and write in than XML.
