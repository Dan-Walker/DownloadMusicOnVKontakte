chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    document.body.innerHTML = request.html;
	var aElement = document.querySelector('a');
	chrome.downloads.download({
            url : aElement.getAttribute('href'),
            filename : aElement.getAttribute('download')
        },
        function (downloadId) {
            if (!downloadId) {
               aElement.click();
            } 
        }
    );	

    document.body.removeChild(document.querySelector('a'));
  }
);
