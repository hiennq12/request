let rules = [];

// Load rules from storage
chrome.storage.local.get(['rules'], (data) => {
    rules = data.rules || [];
});

// Listen for storage changes
chrome.storage.onChanged.addListener((changes) => {
    if (changes.rules) {
        rules = changes.rules.newValue || [];
    }
});

// Function to modify JSON response
const modifyJsonResponse = (originalResponse, fieldPath, newValue) => {
    try {
        const response = JSON.parse(originalResponse);
        const paths = fieldPath.split('.');
        let current = response;

        // Navigate through the object
        for (let i = 0; i < paths.length - 1; i++) {
            if (current[paths[i]] === undefined) {
                current[paths[i]] = {};
            }
            current = current[paths[i]];
        }

        // Set the value
        current[paths[paths.length - 1]] = newValue;
        return JSON.stringify(response);
    } catch (error) {
        console.error('Error modifying response:', error);
        return originalResponse;
    }
};

// Create a map to store fetch controllers
const fetchControllers = new Map();

// Function to handle request interception
const handleRequest = async (details) => {
    const rule = rules.find(r =>
        r.type === 'modify' &&
        details.url.match(new RegExp(r.from))
    );

    if (!rule) return;

    // Cancel any existing request
    if (fetchControllers.has(details.requestId)) {
        fetchControllers.get(details.requestId).abort();
    }

    // Create new controller for this request
    const controller = new AbortController();
    fetchControllers.set(details.requestId, controller);

    try {
        // Make the request ourselves
        const response = await fetch(details.url, {
            signal: controller.signal,
            method: details.method,
            headers: details.requestHeaders,
            body: details.method !== 'GET' ? details.requestBody : undefined
        });

        // Read the response
        let responseText = await response.text();

        // Modify the response based on rule type
        if (rule.modifyType === 'static') {
            responseText = rule.staticResponse;
        } else if (rule.modifyType === 'dynamic') {
            responseText = modifyJsonResponse(responseText, rule.fieldPath, rule.newValue);
        }

        // Return modified response
        return {
            redirectUrl: 'data:application/json;charset=utf-8,' + encodeURIComponent(responseText)
        };
    } catch (error) {
        console.error('Error intercepting request:', error);
        fetchControllers.delete(details.requestId);
        return;
    }
};

// Clear fetch controller after request completes
chrome.webRequest.onCompleted.addListener(
    (details) => {
        fetchControllers.delete(details.requestId);
    },
    { urls: ["<all_urls>"] }
);

chrome.webRequest.onErrorOccurred.addListener(
    (details) => {
        fetchControllers.delete(details.requestId);
    },
    { urls: ["<all_urls>"] }
);

// Listen for requests
chrome.webRequest.onBeforeRequest.addListener(
    handleRequest,
    { urls: ["<all_urls>"] },
    ["blocking"]
);