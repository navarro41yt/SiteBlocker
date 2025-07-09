document.addEventListener('DOMContentLoaded', function() {
    // DOM elements
    const newSiteInput = document.getElementById('new-site');
    const addBtn = document.getElementById('add-btn');
    const sitesList = document.getElementById('sites-list');
    const sitesCount = document.getElementById('sites-count');
    const importBtn = document.getElementById('import-btn');
    const exportBtn = document.getElementById('export-btn');
    const helpBtn = document.getElementById('help-btn');
    const helpModal = document.getElementById('help-modal');
    const closeModal = document.querySelector('.close');
    const currentTime = document.getElementById('current-time');
    
    // Display current time
    function updateTime() {
        const now = new Date();
        const formattedTime = now.toISOString().replace('T', ' ').substring(0, 19);
        currentTime.textContent = formattedTime;
    }
    
    updateTime();
    setInterval(updateTime, 1000);
    
    // Load blocked sites from storage
    function loadBlockedSites() {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            if (result.blockedSites && result.blockedSites.length > 0) {
                displaySites(result.blockedSites);
            } else {
                showEmptyState();
            }
        });
    }
    
    // Display sites in the UI
    function displaySites(sites) {
        sitesList.innerHTML = '';
        sitesCount.textContent = sites.length;
        
        if (sites.length === 0) {
            showEmptyState();
            return;
        }
        
        sites.forEach(site => {
            const siteItem = document.createElement('div');
            siteItem.className = 'site-item';
            
            siteItem.innerHTML = `
                <span class="site-name">${site}</span>
                <div class="site-actions">
                    <button class="delete-btn" data-site="${site}" title="Remove site">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;
            
            sitesList.appendChild(siteItem);
        });
        
        // Add event listeners to delete buttons
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                const siteToRemove = this.getAttribute('data-site');
                removeSite(siteToRemove);
            });
        });
    }
    
    // Show empty state message
    function showEmptyState() {
        sitesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-info-circle"></i>
                <p>No sites are currently blocked. Add your first site above.</p>
            </div>
        `;
        sitesCount.textContent = '0';
    }
    
    // Add a new site to the blocked list
    function addSite() {
        let newSite = newSiteInput.value.trim().toLowerCase();
        
        // Basic validation
        if (!newSite) {
            showError(newSiteInput);
            return;
        }
        
        // Remove http://, https://, and www. if present
        newSite = newSite.replace(/^(https?:\/\/)?(www\.)?/, '');
        
        // Check if site already contains a path and remove it
        if (newSite.includes('/')) {
            newSite = newSite.split('/')[0];
        }
        
        chrome.storage.sync.get(['blockedSites'], function(result) {
            let sites = result.blockedSites || [];
            
            // Check if site already exists
            if (sites.includes(newSite)) {
                showError(newSiteInput, 'Site already blocked');
                return;
            }
            
            // Add the new site
            sites.push(newSite);
            
            // Save the updated list
            chrome.storage.sync.set({blockedSites: sites}, function() {
                newSiteInput.value = '';
                displaySites(sites);
                showSuccess();
            });
        });
    }
    
    // Remove a site from the blocked list
    function removeSite(site) {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            let sites = result.blockedSites || [];
            
            // Filter out the site to remove
            sites = sites.filter(s => s !== site);
            
            // Save the updated list
            chrome.storage.sync.set({blockedSites: sites}, function() {
                displaySites(sites);
            });
        });
    }
    
    // Show error state on input
    function showError(element, message) {
        element.classList.add('error');
        
        if (message) {
            const existingToast = document.querySelector('.toast');
            if (existingToast) {
                existingToast.remove();
            }
            
            const toast = document.createElement('div');
            toast.className = 'toast';
            toast.textContent = message;
            document.body.appendChild(toast);
            
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
        
        setTimeout(() => {
            element.classList.remove('error');
        }, 500);
    }
    
    // Show success animation
    function showSuccess() {
        const successIcon = document.createElement('div');
        successIcon.className = 'success-icon';
        successIcon.innerHTML = '<i class="fas fa-check"></i>';
        document.body.appendChild(successIcon);
        
        setTimeout(() => {
            successIcon.remove();
        }, 1500);
    }
    
    // Export sites list
    function exportSites() {
        chrome.storage.sync.get(['blockedSites'], function(result) {
            const sites = result.blockedSites || [];
            const blob = new Blob([JSON.stringify(sites, null, 2)], {type: 'application/json'});
            const url = URL.createObjectURL(blob);
            
            const a = document.createElement('a');
            a.href = url;
            a.download = 'blocked_sites.json';
            a.click();
            
            URL.revokeObjectURL(url);
        });
    }
    
    // Import sites list
    function importSites() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        
        input.onchange = e => {
            const file = e.target.files[0];
            
            if (!file) return;
            
            const reader = new FileReader();
            reader.onload = event => {
                try {
                    const sites = JSON.parse(event.target.result);
                    
                    if (!Array.isArray(sites)) {
                        throw new Error('Invalid format');
                    }
                    
                    chrome.storage.sync.set({blockedSites: sites}, function() {
                        displaySites(sites);
                        showSuccess();
                    });
                } catch (error) {
                    alert('Error importing file. Please make sure it\'s a valid JSON array.');
                }
            };
            
            reader.readAsText(file);
        };
        
        input.click();
    }
    
    // Event Listeners
    addBtn.addEventListener('click', addSite);
    
    newSiteInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSite();
        }
    });
    
    importBtn.addEventListener('click', importSites);
    exportBtn.addEventListener('click', exportSites);
    
    // Help modal
    helpBtn.addEventListener('click', function() {
        helpModal.style.display = 'block';
    });
    
    closeModal.addEventListener('click', function() {
        helpModal.style.display = 'none';
    });
    
    window.addEventListener('click', function(event) {
        if (event.target === helpModal) {
            helpModal.style.display = 'none';
        }
    });
    
    // Load sites when popup opens
    loadBlockedSites();
});
