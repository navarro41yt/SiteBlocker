// Initialize blocked sites from storage or use defaults
let blockedSites = ["www.facebook.com", "www.instagram.com", "www.youtube.com"];

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

// Function to extract hostname from URL
function extractHostname(url) {
    try {
        return new URL(url).hostname;
    } catch (e) {
        // If URL parsing fails, try a simpler approach
        let hostname = url.replace(/^(https?:\/\/)?(www\.)?/i, '');
        hostname = hostname.split('/')[0];
        return hostname;
    }
}

// Block requests to exactly matching hostnames
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        const hostname = extractHostname(details.url);
        
        // Check if the hostname exactly matches any blocked site
        if (blockedSites.includes(hostname)) {
            return { redirectUrl: chrome.runtime.getURL("block.html") };
        }
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
