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
    updateBlockingRules();
});

// Listen for changes to the blocked sites list
chrome.storage.onChanged.addListener(function(changes, namespace) {
    if (changes.blockedSites) {
        blockedSites = changes.blockedSites.newValue;
        console.log("Updated blocked sites:", blockedSites);
        updateBlockingRules();
    }
});

// Update declarativeNetRequest rules based on blocked sites
function updateBlockingRules() {
    // First, remove all existing rules
    chrome.declarativeNetRequest.getDynamicRules((existingRules) => {
        const existingRuleIds = existingRules.map(rule => rule.id);
        
        chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: existingRuleIds,
            addRules: createBlockingRules()
        }, () => {
            if (chrome.runtime.lastError) {
                console.error("Error updating rules:", chrome.runtime.lastError);
            } else {
                console.log("Blocking rules updated successfully");
            }
        });
    });
}

// Create blocking rules for declarativeNetRequest
function createBlockingRules() {
    const rules = [];
    
    blockedSites.forEach((site, index) => {
        // Create rule for exact hostname match
        rules.push({
            id: index + 1,
            priority: 1,
            action: {
                type: "redirect",
                redirect: { url: chrome.runtime.getURL("block.html") }
            },
            condition: {
                urlFilter: `||${site}/*`,
                resourceTypes: ["main_frame", "sub_frame"]
            }
        });
    });
    
    return rules;
}
