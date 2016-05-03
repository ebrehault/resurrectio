// ---------------------------------------------------------------------------
// RobotRendered -- a class to render recorded tests to a RobotFramework
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
EventTypes.MouseDown = 19;
EventTypes.MouseUp = 20;
EventTypes.MouseDrag = 21;
EventTypes.MouseDrop = 22;
EventTypes.KeyPress = 23;

function RobotRendered(document) {
  this.document = document;
  this.title = "Testcase";
  this.items = null;
  this.history = new Array();
  this.last_events = new Array();
  this.screen_id = 1;
  this.unamed_element_id = 1;
}

RobotRendered.prototype.text = function(txt) {
  // todo: long lines
  this.document.writeln(txt);
}

RobotRendered.prototype.stmt = function(text, indent) {
  if(indent==undefined) indent = 1;
  var output = (new Array(4*indent)).join(" ") + text;
  this.document.writeln(output);
}

RobotRendered.prototype.cont = function(text) {
  this.document.writeln("    ... " + text);
}

RobotRendered.prototype.pyout = function(text) {
  this.document.writeln("    " + text);
}

RobotRendered.prototype.pyrepr = function(text, escape) {
  // todo: handle non--strings & quoting
  // There should a more eloquent way of doing this but by  doing the escaping before adding the string quotes prevents the string quotes from accidentally getting escaped creating a syntax error in the output code.
    var s = text;
    if (escape) s = s.replace(/(['"])/g, "\\$1");
    var s = "'" + s + "'"; 
  return s;
}

RobotRendered.prototype.space = function() {
  this.document.write("\n");
}

RobotRendered.prototype.regexp_escape = function(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s\/]/g, "\\$&");
};

RobotRendered.prototype.cleanStringForXpath = function(str, escape)  {
    var parts  = str.match(/[^'"]+|['"]/g);
    parts = parts.map(function(part){
        if (part === "'")  {
            return '"\'"'; // output "'"
        }

        if (part === '"') {
            return "'\"'"; // output '"'
        }
        return "'" + part + "'";
    });
    var xpath = '';
    if(parts.length>1) {
      xpath = "concat(" + parts.join(",") + ")";
    } else {
      xpath = parts[0];
    }
    if(escape) xpath = xpath.replace(/(["])/g, "\\$1");
    return xpath;
}

var d = {};
d[EventTypes.OpenUrl] = "openUrl";
d[EventTypes.Click] = "click";
//d[EventTypes.Change] = "change";
d[EventTypes.Comment] = "comment";
d[EventTypes.Submit] = "submit";
d[EventTypes.CheckPageTitle] = "checkPageTitle";
d[EventTypes.CheckPageLocation] = "checkPageLocation";
d[EventTypes.CheckTextPresent] = "checkTextPresent";
d[EventTypes.CheckValue] = "checkValue";
d[EventTypes.CheckText] = "checkText";
d[EventTypes.CheckHref] = "checkHref";
d[EventTypes.CheckEnabled] = "checkEnabled";
d[EventTypes.CheckDisabled] = "checkDisabled";
d[EventTypes.CheckSelectValue] = "checkSelectValue";
d[EventTypes.CheckSelectOptions] = "checkSelectOptions";
d[EventTypes.CheckImageSrc] = "checkImageSrc";
d[EventTypes.PageLoad] = "pageLoad";
d[EventTypes.ScreenShot] = "screenShot";
/*d[EventTypes.MouseDown] = "mousedown";
d[EventTypes.MouseUp] = "mouseup"; */
d[EventTypes.MouseDrag] = "mousedrag";
d[EventTypes.KeyPress] = "keypress";

RobotRendered.prototype.dispatch = d;

var cc = EventTypes;

RobotRendered.prototype.render = function(with_xy) {
  this.with_xy = with_xy;
  var etypes = EventTypes;
  this.document.open();
  this.document.write("<" + "pre" + ">");
  this.writeHeader();
  var last_down = null;
  var forget_click = false;

  for (var i=0; i < this.items.length; i++) {
    var item = this.items[i];
    if (item.type == etypes.Comment)
      this.space();
    
    if(i==0) {
        if(item.type!=etypes.OpenUrl) {
            this.text("ERROR: the recorded sequence does not start with a url openning.");
        } else {
          this.startUrl(item);
          continue;
        }
    }

    // remember last MouseDown to identify drag
    if(item.type==etypes.MouseDown) {
      last_down = this.items[i];
      continue;
    }
    if(item.type==etypes.MouseUp && last_down) {
      if(last_down.x == item.x && last_down.y == item.y) {
        forget_click = false;
        continue;
      } else {
        item.before = last_down;
        this[this.dispatch[etypes.MouseDrag]](item);
        last_down = null;
        forget_click = true;
        continue;
      }
    }
    if(item.type==etypes.Click && forget_click) {
      forget_click = false;
      continue;
    }

    // we do not want click due to user checking actions
    if(i>0 && item.type==etypes.Click && 
            ((this.items[i-1].type>=etypes.CheckPageTitle && this.items[i-1].type<=etypes.CheckImageSrc) || this.items[i-1].type==etypes.ScreenShot)) {
        continue;
    }

    if (this.dispatch[item.type]) {
      this[this.dispatch[item.type]](item);
    }
    if (item.type == etypes.Comment)
      this.space();
  }
  this.writeFooter();
  this.document.write("<" + "/" + "pre" + ">");
  this.document.close();
}

RobotRendered.prototype.writeHeader = function() {
  var date = new Date();
  this.text("# =========================================================================", 0);
  this.text("# RobotFramework test generated on " + date, 0);
  this.text("# =========================================================================", 0);
  this.space();
  this.stmt("*** Keywords ***", 0);
  this.space();
  this.stmt("# Note: this 'All-in' scenario must be splitted into meaningful keywords", 0);
  this.stmt("All-in scenario", 0);
}
RobotRendered.prototype.writeFooter = function() {
    this.space();
  }
RobotRendered.prototype.rewriteUrl = function(url) {
  return url;
}

RobotRendered.prototype.shortUrl = function(url) {
  return url.substr(url.indexOf('/', 10), 999999999);
}

RobotRendered.prototype.startUrl = function(item) {
  var url = this.rewriteUrl(item.url);
  this.stmt("Open browser    " + url);
}
RobotRendered.prototype.openUrl = function(item) {
  var url = this.rewriteUrl(item.url);
  var history = this.history;
  // if the user apparently hit the back button, render the event as such
  if (url == history[history.length - 2]) {
    this.stmt('Go back');
    history.pop();
    history.pop();
  } else {
    this.stmt("Go to    " + url);
  }
}

RobotRendered.prototype.pageLoad = function(item) {
  var url = this.pyrepr(this.rewriteUrl(item.url));
  this.history.push(url);
}

RobotRendered.prototype.normalizeWhitespace = function(s) {
  return s.replace(/^\s*/, '').replace(/\s*$/, '').replace(/\s+/g, ' ');
}

RobotRendered.prototype.getControl = function(item) {
  var type = item.info.type;
  var tag = item.info.tagName.toLowerCase();
  var selector;
  if ((type == "submit" || type == "button") && item.info.value)
    selector = tag+'[type='+type+'][value='+this.pyrepr(this.normalizeWhitespace(item.info.value))+']';
  else if (item.info.name)
  selector = tag+'[name='+this.pyrepr(item.info.name)+']';
  else if (item.info.id)
  selector = tag+'#'+item.info.id;
  else
  selector = item.info.selector;

  return selector;
}
  
RobotRendered.prototype.getControlXPath = function(item) {
  var type = item.info.type;
  var way;
  if ((type == "submit" || type == "button") && item.info.value)
    way = '@value=' + this.pyrepr(this.normalizeWhitespace(item.info.value));
  else if (item.info.name)
    way = '@name=' + this.pyrepr(item.info.name);
  else if (item.info.id)
  way = '@id=' + this.pyrepr(item.info.id);
  else
    way = 'TODO';

  return way;
}

RobotRendered.prototype.getLinkXPath = function(item) {
  var way;
  if (item.text)
    way = 'normalize-space(text())=' + this.cleanStringForXpath(this.normalizeWhitespace(item.text), true);
  else if (item.info.id)
    way = '@id=' + this.pyrepr(item.info.id);
  else if (item.info.href)
    way = '@href=' + this.pyrepr(this.shortUrl(item.info.href));
  else if (item.info.title)
    way = 'title='+this.pyrepr(this.normalizeWhitespace(item.info.title));

  return way;
}

RobotRendered.prototype.mousedrag = function(item) {
  this.stmt('# TODO;');
}
RobotRendered.prototype.click = function(item) {
  var tag = item.info.tagName.toLowerCase();
  var selector;
  if (tag == 'a') {
    var xpath_selector = this.getLinkXPath(item);
    if(xpath_selector) {
      selector = 'xpath=//a['+xpath_selector+']';
    } else {
      selector = item.info.selector;
    }
  } else if (tag == 'input' || tag == 'button') {
    selector = this.getFormSelector(item) + this.getControl(item);
    selector = 'css=' + selector;
  } else {
    selector = 'css=' + item.info.selector;
  }
  this.stmt('Click element    '+ selector);
}

RobotRendered.prototype.getFormSelector = function(item) {
  var info = item.info;
  if(!info.form) {
    return '';
  }
  if(info.form.name) {
        return "form[name=" + info.form.name + "] ";
    } else if(info.form.id) {
    return "form#" + info.form.id + " ";
  } else {
    return "form ";
  }
}

RobotRendered.prototype.keypress = function(item) {
  var text = item.text.replace('\n','').replace('\r', '\\r');

  this.stmt('Press Key    ' + this.getControl(item) + '    ' + text);
}

RobotRendered.prototype.submit = function(item) {
  // the submit has been called somehow (user, or script)
  // so no need to trigger it.
}

RobotRendered.prototype.screenShot = function(item) {
  // wait 1 second is not the ideal solution, but will be enough most
  // part of time. For slow pages, an assert before capture will make
  // sure evrything is properly loaded before screenshot.
  this.stmt('Sleep    1s');
  this.stmt('Capture Page Screenshot    '+this.screen_id+'.png');
  this.screen_id = this.screen_id + 1;
}

RobotRendered.prototype.comment = function(item) {
  var lines = item.text.split('\n');
  for (var i=0; i < lines.length; i++) {
    this.stmt('# '+lines[i]);
  }
}

RobotRendered.prototype.checkPageTitle = function(item) {
  var title = this.pyrepr(item.title, true);
  this.stmt('Title should be    '+ title);
}

RobotRendered.prototype.checkPageLocation = function(item) {
  var url = this.regexp_escape(item.url);
  this.stmt('location_should_be    '+ url);
}

RobotRendered.prototype.checkTextPresent = function(item) {
    var selector = 'xpath=//*[contains(text(), '+this.pyrepr(item.text, true)+')]';
    this.waitAndTestSelector(selector);
}

RobotRendered.prototype.checkValue = function(item) {
  var type = item.info.type;
  var way = this.getControlXPath(item);
  var selector = '';
  if (type == 'checkbox' || type == 'radio') {
    var selected;
    if (item.info.checked)
      selected = '@checked'
    else
      selected = 'not(@checked)'
    selector = 'xpath=//input[' + way + ' and ' +selected+ ']';
  }
  else {
    var value = this.pyrepr(item.info.value)
    var tag = item.info.tagName.toLowerCase();
    selector = 'xpath=//'+tag+'[' + way + ' and @value='+value+']';
  }
  this.waitAndTestSelector(selector);
}

RobotRendered.prototype.checkText = function(item) {
  var selector = '';
  if ((item.info.type == "submit") || (item.info.type == "button")) {
      selector = 'xpath=//input[@value='+this.pyrepr(item.text, true)+']';
  } else {
      selector = 'xpath=//*[normalize-space(text())='+this.cleanStringForXpath(item.text, true)+']';
  }
  this.waitAndTestSelector(selector);
}

RobotRendered.prototype.checkHref = function(item) {
  var href = this.pyrepr(this.shortUrl(item.info.href));
  var xpath_selector = this.getLinkXPath(item);
  if(xpath_selector) {
    selector = 'xpath=//a['+xpath_selector+' and @href='+ href +']';
  } else {
    selector = item.info.selector+'[href='+ href +']';
  }
    this.stmt('Page should contain element    '+selector);
}

RobotRendered.prototype.checkEnabled = function(item) {
    var way = this.getControlXPath(item);
    var tag = item.info.tagName.toLowerCase();
    this.waitAndTestSelector('xpath=//'+tag+'[' + way + ' and not(@disabled)]');
}

RobotRendered.prototype.checkDisabled = function(item) {
  var way = this.getControlXPath(item);
  var tag = item.info.tagName.toLowerCase();
  this.waitAndTestSelector('xpath=//'+tag+'[' + way + ' and @disabled]');
}

RobotRendered.prototype.checkSelectValue = function(item) {
  var value = this.pyrepr(item.info.value);
  var way = this.getControlXPath(item);
  this.waitAndTestSelector('xpath=//select[' + way + ']/option[@selected and @value='+value+']');
}

RobotRendered.prototype.checkSelectOptions = function(item) {
  this.stmt('/* TODO */');
}

RobotRendered.prototype.checkImageSrc = function(item) {
  var src = this.pyrepr(this.shortUrl(item.info.src));
  this.waitAndTestSelector('xpath=//img[@src=' + src + ']');
}

RobotRendered.prototype.waitAndTestSelector = function(selector) {
  this.stmt('Wait Until Page Contains Element    ' + selector);
}

var dt = new RobotRendered(document);
window.onload = function onpageload() {
  chrome.runtime.sendMessage({action: "get_items"}, function(response) {
      dt.items = response.items;
      dt.render();
  });
};
