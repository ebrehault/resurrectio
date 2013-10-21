// ---------------------------------------------------------------------------
// DocumentRenderer -- a class to render recorded tests to a DocumentJS
// test format.
// ---------------------------------------------------------------------------

if (typeof(EventTypes) == "undefined") {
  EventTypes = {};
}

EventTypes.OpenUrl = 0;
EventTypes.Click = 1;
EventTypes.Change = 2;
EventTypes.Comment = 3;
EventTypes.Submit = 4;
EventTypes.CheckPageTitle = 5;
EventTypes.CheckPageLocation = 6;
EventTypes.CheckTextPresent = 7;
EventTypes.CheckValue = 8;
EventTypes.CheckValueContains = 9;
EventTypes.CheckText = 10;
EventTypes.CheckHref = 11;
EventTypes.CheckEnabled = 12;
EventTypes.CheckDisabled = 13;
EventTypes.CheckSelectValue = 14;
EventTypes.CheckSelectOptions = 15;
EventTypes.CheckImageSrc = 16;
EventTypes.PageLoad = 17;
EventTypes.ScreenShot = 18;

function DocumentRenderer(document) {
  this.document = document;
  this.title = "Testcase";
  this.items = null;
  this.history = new Array();
  this.screen_id = 1;
}

DocumentRenderer.prototype.text = function(txt) {
  // todo: long lines
  this.document.writeln(txt);
}

DocumentRenderer.prototype.stmt = function(text) {
  this.document.writeln(text);
}

DocumentRenderer.prototype.cont = function(text) {
  this.document.writeln("    ... " + text);
}

DocumentRenderer.prototype.pyout = function(text) {
  this.document.writeln("    " + text);
}

DocumentRenderer.prototype.pyrepr = function(text) {
  // todo: handle non--strings & quoting
  return "'" + text + "'";
}

DocumentRenderer.prototype.space = function() {
  this.document.write("\n");
}

var d = {};
d[EventTypes.Comment] = "comment";
d[EventTypes.ScreenShot] = "screenShot";
DocumentRenderer.prototype.dispatch = d;

var cc = EventTypes;

DocumentRenderer.prototype.render = function() {
  var etypes = EventTypes;
  this.document.open();
  this.document.write("<" + "pre" + ">");
  this.writeHeader();

  for (var i=0; i < this.items.length; i++) {
    var item = this.items[i];
    if (this.dispatch[item.type]) {
      this[this.dispatch[item.type]](item);
    }
  }
  this.writeFooter();
  this.document.write("<" + "/" + "pre" + ">");
  this.document.close();
}

DocumentRenderer.prototype.writeHeader = function() {
  var date = new Date();
  this.text("Document generated " + date);
  this.text("==============================================================================");
  this.space();
}
DocumentRenderer.prototype.writeFooter = function() {
  this.space();
}

DocumentRenderer.prototype.normalizeWhitespace = function(s) {
  return s.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s+/g, ' ');
}

DocumentRenderer.prototype.screenShot = function(item) {
  this.stmt('.. image:: screenshot'+this.screen_id+'.png');
  this.space();
  this.screen_id = this.screen_id + 1;
}

DocumentRenderer.prototype.comment = function(item) {
  this.text(item.text);
  this.space();
}

var dt = new DocumentRenderer(document);
window.onload = function onpageload() {
    chrome.runtime.sendMessage({action: "get_items"}, function(response) {
        dt.items = response.items;
        dt.render();
    });
};
