// Initialize blocked sites from storage or use defaults
let blockedSites = ["www.facebook.com", "instagram.com", "youtube.com"];

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

// Function to check if a hostname should be blocked based on the blocking rules
function shouldBlockHostname(hostname, blockedSite) {
    // Split both hostnames into parts
    const hostnameParts = hostname.split('.');
    const blockedSiteParts = blockedSite.split('.');
    
    // If the blocked site has only two parts (domain.tld), block all subdomains
    if (blockedSiteParts.length === 2) {
        // Check if the last two parts of the hostname match the blocked site
        return hostnameParts.length >= 2 && 
               hostnameParts[hostnameParts.length - 2] === blockedSiteParts[0] && 
               hostnameParts[hostnameParts.length - 1] === blockedSiteParts[1];
    } 
    // If the blocked site has three or more parts, require an exact match
    else {
        return hostname === blockedSite;
    }
}

// Block requests to matching hostnames based on the rules
chrome.webRequest.onBeforeRequest.addListener(
    function (details) {
        const hostname = extractHostname(details.url);
        
        // Check each blocked site against our matching rules
        for (const blockedSite of blockedSites) {
            if (shouldBlockHostname(hostname, blockedSite)) {
                return { redirectUrl: chrome.runtime.getURL("block.html") };
            }
        }
        
        // Allow the request if no matches
        return { cancel: false };
    },
    { urls: ["<all_urls>"] },
    ["blocking"]
);
