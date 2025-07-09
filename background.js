// Initialize blocked sites from storage or use defaults
let blockedSites = ["facebook.com", "instagram.com", "youtube.com"];

// Load saved blocked sites when extension starts
chrome.storage.sync.get(['blockedSites'], function(result) {
    if (result.blockedSites) {
        blockedSites = result.blockedSites;
        console.log("Loaded blocked sites:", blockedSites);
    } else {
        // Save default sites if no saved list exists
        chrome.storage.sync.set({blockedSites: blockedSites});
    }
});

// Listen for changes to the blocked sites list
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue;
        console.log("Updated blocked sites:", blockedSites);
    }
});

// Block requests to matching sites
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        for (let site of blockedSites) {
            if (details.url.includes(site)) {
                return { redirectUrl: chrome.runtime.getURL("block.html") };
            }
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);