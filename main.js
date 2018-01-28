var downloadImage, downloadImageLoaded, downloadImageUrl, f, Player, vk;

var n = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMN0PQRSTUVWXYZO123456789+/=";

function reloadAudioPlayer(audioScript) {
    audioScript = audioScript || "https://vk.com/js/cmodules/web/audioplayer.js";
    var h = new XMLHttpRequest();
    h.open("GET", audioScript + "?" + Math.random(), true);
    h.onreadystatechange = function() {
        if (h.readyState == 4) {
            if (h.status == 200) {
                try {
                    eval(h.responseText);
                    if (typeof AudioPlayerFlash != "undefined") {
                        Player = new AudioPlayerFlash();
                    }
                } catch (e) {

                }
            }else{
                //if change url to audioplayer.js
                allScriptOnPage = document.querySelectorAll('script');
                allScriptOnPage.forEach(function(script){
                    if(~script.src.indexOf("audio")){
                        reloadAudioPlayer(script.src);
                    }
                });
            }
        }
    };
    h.send(null);
}

function getRemoteFileInfo(e, duration, cb) {
    h = new XMLHttpRequest();
    h.open("HEAD", e, true);
    h.onreadystatechange = function() {
        if (h.readyState == 4) {
            if (h.status == 200) {
                length = parseInt(h.getResponseHeader("Content-Length"));
                duration = duration || parseInt(e.split(",")[1]);
                cb({
                    bitrate: Math.round(length / duration / 125 / 32) * 32,
                    size: length / 1024 / 1024
                })
            }
        }
    }
    h.send();
}

function updateLinks(e) {
    if (e.nodeType == 1 || e.nodeType == 9) {
        var t = e.querySelectorAll(".audio");
        if (t.length == 0)
            t = e.querySelectorAll('.audio_row');
        for (var n = 0; n < t.length; n++) {
            updateOneAudio(t[n])
        }
    }
}

function getAPITracksUser(e, callback) {
    var h = new XMLHttpRequest();
    h.open("GET", "https://api.vk.com/method/execute.getAudio?owner_id=" + e.owner_id + "&access_token=", true);
    h.onreadystatechange = function() {
        if (h.readyState == 4) {
            if (h.status == 200) {
                response = JSON.parse(h.responseText);
                callback(response);
            }
        }
    };
    h.send(null);
}


function updateOneAudio(e) {

    var downloadClass = "download-audio-link";

    var play_btn = e.querySelector('.audio_row__play_btn');

    if(play_btn != null){
        var play_btnStyle = window.getComputedStyle(play_btn);
        if(play_btnStyle.display != "none"){
            downloadClass += " wall";
        }
    }

    var d = document.createElement('a');
    d.setAttribute("style", 'background-image: url('+chrome.extension.getURL("/download.png")+');')
    d.setAttribute("class", downloadClass);
    d.setAttribute("data-full-id", e.getAttribute("data-full-id"));
    d.setAttribute("onclick", "event.cancelBubble = true;");
    d.onclick = function(e) {
        e.preventDefault();
        e = e.target;
        if (localStorage['34Fsdg55'] == undefined || parseInt(localStorage['34Fsdg55']) <= 1) {
            var optionsUrl = chrome.extension.getURL('options.html');
            window.open(optionsUrl);
            localStorage['34Fsdg55'] = 100
        }
        if (e.getAttribute("download") != undefined) {
            return senToBg({
                html: e.outerHTML
            });
        } else {

            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/al_audio.php", true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var track = JSON.parse(/<!json>(.+?)<!>/.exec(xhr.responseText)[1])[0];
                        decodeAudioUrl(track[2]).then(function(url){
                            e.setAttribute("href", url);
                            e.setAttribute("download", html_decode(track[4]) + " - " + html_decode(track[3]) + ".mp3");
                            setTimeout(function() {
                                e.click();
                            }, 500);
                        });
                    }
                }
            };
            xhr.send("act=reload_audio&al=1&ids=" + e.getAttribute("data-full-id"));
        }

        localStorage['34Fsdg55'] = parseInt(localStorage['34Fsdg55']) - 1;

        return false
    };
    d.addEventListener("mouseover", function() {
        _self = this;
        
        if (this.getAttribute("onmousemove") == null) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "/al_audio.php", true);
            xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
            xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
            xhr.onreadystatechange = function() {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        var track = JSON.parse(/<!json>(.+?)<!>/.exec(xhr.responseText)[1])[0];
                        decodeAudioUrl(track[2]).then(function(url){
                           _self.setAttribute("href", url);
                            _self.setAttribute("download", html_decode(track[4]) + " - " + html_decode(track[3]) + ".mp3");

                            getRemoteFileInfo(url, track[5], function(file_info){
                                _self.setAttribute("onmousemove", "showTooltip(this, {text: 'Битрейт: " + file_info.bitrate + " kbps <br/> Размер: " + file_info.size.toFixed(1) + " Мб', black: 1, needLeft: true, shift: [2, 2] });");
                            });
                        });
                    }
                }
            };
            xhr.send("act=reload_audio&al=1&ids=" + this.getAttribute("data-full-id"));
        }
    }, false);

    var wrap = e.querySelector('.audio_row__inner');
    if(wrap.querySelector(".download-audio-link") == null)
        wrap.insertBefore(d, wrap.querySelector('.audio_row__info'))

}

function senToBg(e) {
    chrome.runtime.sendMessage(e, function(e) {});
}

function hasClass(e, t) {
    return (" " + e.className + " ")
        .indexOf(" " + t + " ") > -1
}


function getCurrentID() {
    try {

        h = new XMLHttpRequest();
        h.open("GET", "https://vk.com/", true);
        h.send();
        return h.responseText.match(/id: (.+?),/)[1]
    } catch (e) {
        return null;
    }
}



function decodeAudioUrl(url) {
    'use strict';
    if (typeof AudioPlayerFlash != "undefined") {
        //remote
        return new Promise(function (resolve, reject){
            Player.setUrl(url)
            return resolve(Player._url);
        });
    } else {
        //local
        document.dispatchEvent(
            new CustomEvent("LOCALDECODE:Start", {
                detail: {
                    url: url,
                },
                bubbles: true,
                cancelable: false
            })
        );

       return new Promise(function (resolve, reject){
            document.addEventListener("LOCALDECODE:End", function(data) {
               return resolve(data.detail.url);
            });
        });
    }
}


(function() {

    if (location.href.indexOf("vk.com") != -1 || location.href.indexOf("new.vk.com") != -1) {

        var s = document.createElement('script');
        s.src = chrome.extension.getURL("/VKOPTIONS.js");
        document.body.appendChild(s);

        document.addEventListener("VKOPTIONS", function(data) {
            vk = data.detail.vk;
            reloadAudioPlayer();
        });

        updateLinks(document);
        var MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;
        var body = document.querySelector("body");
        var observer = new MutationObserver(function(e) {
            e.forEach(function(e) {
                if (e.type === "childList") {
                    for (var t = 0; t < e.addedNodes.length; t++) {
                        if (hasClass(e.addedNodes[t], "audio") || hasClass(e.addedNodes[t], "audio_row")) {
                            updateOneAudio(e.addedNodes[t])
                        } else {
                            updateLinks(e.addedNodes[t])
                        }
                    }
                }
                var n = document.querySelector("body");
                observer.observe(n, {
                    childList: true,
                    subtree: true
                })
            })
        });
        observer.observe(body, {
            childList: true,
            subtree: true
        })

        getAPITracksUser({
            owner_id: getCurrentID()
        }, function(data) {
            if (data.error == undefined) {
                downloadImageUrl = chrome.extension.getURL("/download.png");
                var i = document.createElement('img');
                i.src = downloadImageUrl;
                i.id = "check_loaded_local_resource";
                i.setAttribute("onload", "topMsg('Расширение Скачать Музыку Вконтакте включено, всего ваших треков:" + data.response[0] + "', 5);");
                document.body.appendChild(i);

                document.body.removeChild(i); //destroy 
            }
        });

    }
})();


function html_decode(str) {
    return str.replace(/&#(\d+);/g, function(match, dec) {
        return String.fromCharCode(dec).trim();
    });
}
