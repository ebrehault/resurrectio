//-----------------------------------------------
// Proxy to access current tab recorder instance
// ----------------------------------------------
function RecorderProxy() {
    this.active = null;
}

RecorderProxy.prototype.start = function(url) {
	chrome.tabs.getSelected(null, function(tab) {
	    chrome.runtime.sendMessage({action: "start", recorded_tab: tab.id, start_url: url});
	});
}

RecorderProxy.prototype.stop = function() {
    chrome.runtime.sendMessage({action: "stop"});
}

RecorderProxy.prototype.open = function(url, callback) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {action: "open", 'url': url}, callback);
    });
}

RecorderProxy.prototype.addComment = function(text, callback) {
    chrome.tabs.getSelected(null, function(tab) {
        chrome.tabs.sendMessage(tab.id, {action: "addComment", 'text': text}, callback);
    });
}

//-----------------------------------------------
// UI
//----------------------------------------------
function RecorderUI() {
	this.recorder = new RecorderProxy();
	chrome.runtime.sendMessage({action: "get_status"}, function(response) {
	    if (response.active) {
	    	ui.set_started();
	    } else {
	    	if (!response.empty) {
	            ui.set_stopped();
	        }
	        chrome.tabs.getSelected(null, function(tab) {
                  document.forms[0].elements["url"].value = tab.url;
            });
	    }
	});
  
}

RecorderUI.prototype.start = function() {
    var url = document.forms[0].elements["url"].value;
    if (url == "") {
        return false;
    }
    if ( (url.indexOf("http://") == -1) && (url.indexOf("https://")) ) {
        url = "http://" + url;
    }
    ui.set_started()
    ui.recorder.start(url);
  
    return false;
}

RecorderUI.prototype.set_started = function() {
    var e = document.getElementById("bstop");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e.onclick = ui.stop;
    e.value = "Stop Recording";
    e = document.getElementById("bgo");
    e.className += " hide";
    e = document.getElementById("bcomment");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e = document.getElementById("bexport");
    e.className += " hide";
    e = document.getElementById("bexportxy");
    e.className += " hide";
    e = document.getElementById("bdoc");
    e.className += " hide";
    e = document.getElementById("recording");
    e.className = e.className.replace(/ hide|hide/ig, "");
    chrome.browserAction.setBadgeText({
        "text": "REC"
    });
    chrome.browserAction.setBadgeBackgroundColor({
        "color": "#c53929"
    })
}

RecorderUI.prototype.stop = function() {
  ui.set_stopped();
	ui.recorder.stop();
	return false;
}

RecorderUI.prototype.set_stopped = function() {
    var e = document.getElementById("bstop");
    e.className += " hide";
    e = document.getElementById("bgo");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e = document.getElementById("bcomment");
    e.className += " hide";
    e = document.getElementById("bexport");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e = document.getElementById("bexportxy");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e = document.getElementById("bdoc");
    e.className = e.className.replace(/ hide|hide/ig, "");
    e = document.getElementById("recording");
    e.className += " hide";
    chrome.browserAction.setBadgeText({
        "text": ""
    });
    chrome.browserAction.setBadgeBackgroundColor({
        "color": ""
    })
}

RecorderUI.prototype.showcomment = function() {
  var e = document.getElementById("bcomment");
  e.className += " hide";
  e = document.getElementById("comment");
  e.className = e.className.replace(/hide/ig, "");
  e = document.getElementById("ctext");
  e.focus();
  return false;
}

RecorderUI.prototype.hidecomment = function(bsave) {
  var e = document.getElementById("bcomment");
  e.className = e.className.replace(/ hide|hide/ig, "");
  e = document.getElementById("comment");
  e.className += " hide";
  e = document.getElementById("ctext");
  if (bsave) {
    var txt = e.value;
    if (txt && txt.length > 0) {
      this.recorder.addComment(e.value, null);
    }
  }
  e.value = "";
  return false;
}

RecorderUI.prototype.export = function(options) {
  if(options && options.xy) {
    chrome.tabs.create({url: "./casper.html?xy=true"});
  } else {
    chrome.tabs.create({url: "./casper.html"});
  }
}

RecorderUI.prototype.exportdoc = function(bexport) {
    chrome.tabs.create({url: "./doc.html"});
}

RecorderUI.prototype.setBtnGoState = function(){
    chrome.tabs.getSelected(null, function (tab) {
        if(/(chrome|chrome\-extension)\:/.test(tab.url)){
            document.querySelector("input#bgo").className += " disabled";
            document.querySelector("input#bgo").disabled = true;
        }
    });
    document.querySelector("input#turl").addEventListener("input", function(){
        var bgoStyle = document.querySelector("input#bgo");
        if(!/(chrome|chrome\-extension)\:/.test(this.value)){
                bgoStyle.className = bgoStyle.className.replace(/ disabled|disabled/ig, "");
                bgoStyle.disabled = false;
        }
    });
}

var ui;

// bind events to ui elements
window.onload = function(){
    document.querySelector('input#bgo').onclick=function() {ui.start(); return false;};
    document.querySelector('input#bstop').onclick=function() {ui.stop(); return false;};
    document.querySelector('input#bcomment').onclick=function() {ui.showcomment(); return false;};
    document.querySelector('input#bexport').onclick=function() {ui.export(); return false;};
    document.querySelector('input#bexportxy').onclick=function() {ui.export({xy: true}); return false;};
    document.querySelector('input#bdoc').onclick=function() {ui.exportdoc(); return false;};
    document.querySelector('input#bsavecomment').onclick=function() {ui.hidecomment(true); return false;};
    document.querySelector('input#bcancelcomment').onclick=function() {ui.hidecomment(false); return false;};
    document.querySelector('#tagline').onclick=function() {this.innerText='Omne phantasma resurrectionem suam promit.'};
    ui = new RecorderUI();
    ui.setBtnGoState();
}