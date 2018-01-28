window.vk.audioAdsConfig.enabled = false; //turn off ads in audio

document.dispatchEvent(
    new CustomEvent("VKOPTIONS", {
        detail: {
            vk: window.vk
        },
        bubbles: true,
        cancelable: false
    })
);


document.addEventListener("LOCALDECODE:Start", function(data) {
	Player = new AudioPlayerFlash();
	Player.setUrl(data.detail.url);
	document.dispatchEvent(
		new CustomEvent("LOCALDECODE:End", {
		    detail: {
		        url: Player._url
		    },
		    bubbles: true,
		    cancelable: false
		})
	);
});

