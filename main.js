import "./style.css";
import "./navigation.js";

const tabList = document.querySelector('[role="tablist"]');
const tabs = tabList ? tabList.querySelectorAll('[role="tab"]') : [];
const mainContainer = tabList ? tabList.closest("main") : null;

// Global variable to hold the fetched data
let spaceData = null;
let currentCategory = null; // Will be 'destinations', 'crew', or 'technology'
let currentDataArray = null;

/**
 * Determines the data category based on the current page's body class.
 * This is a reliable way to map HTML pages to JSON data keys.
 * @returns {string|null} The key in the data.json file (e.g., 'destinations').
 */
function determineCategory() {
    const bodyClass = document.body.className;
    if (bodyClass.includes("destination")) return "destinations";
    if (bodyClass.includes("crew")) return "crew";
    if (bodyClass.includes("technology")) return "technology";
    return null;
}

/**
 * Updates the content of the page based on the selected tab data.
 * @param {number} index The index of the item in the current data array.
 */
function updateContent(index) {
    if (!currentDataArray || index === undefined) {
        console.error("Data not loaded or index is missing.");
        return;
    }

    const data = currentDataArray[index];
    if (!data) {
        console.error("Data for index", index, "not found.");
        return;
    }

    // --- Content Area Update ---
    const content = document.getElementById("dynamic-content");
    if (!content) return; // Exit if the content area isn't found (shouldn't happen)

    try {
        if (currentCategory === "destinations") {
            document.getElementById("destination-name").textContent = data.name;
            document.getElementById("destination-description").textContent =
                data.description;
            document.getElementById("destination-distance").textContent =
                data.distance;
            document.getElementById("destination-travel").textContent =
                data.travel;

            // Image Update (using webp and png for compatibility)
            const webpSource = document.getElementById("image-webp-source");
            const pngSource = document.getElementById("image-png-source");
            if (webpSource) webpSource.srcset = data.images.webp;
            if (pngSource) {
                pngSource.src = data.images.png;
                pngSource.alt = data.name;
            }
        } else if (currentCategory === "crew") {
            document.getElementById("crew-role").textContent = data.role;
            document.getElementById("crew-name").textContent = data.name;
            document.getElementById("crew-bio").textContent = data.bio;

            // Image Update
            const webpSource = document.getElementById("image-webp-source");
            const pngSource = document.getElementById("image-png-source");
            if (webpSource) webpSource.srcset = data.images.webp;
            if (pngSource) {
                pngSource.src = data.images.png;
                pngSource.alt = data.name;
            }
        } else if (currentCategory === "technology") {
            document.getElementById("technology-name").textContent = data.name;
            document.getElementById("technology-description").textContent =
                data.description;

            // Image Update (using landscape/portrait for responsiveness)
            const landscapeSource = document.getElementById(
                "image-landscape-source",
            );
            const portraitSource = document.getElementById(
                "image-portrait-source",
            );
            const defaultImage = document.getElementById("image-default");

            if (landscapeSource) landscapeSource.srcset = data.images.landscape;
            if (portraitSource) portraitSource.srcset = data.images.portrait;
            if (defaultImage) {
                defaultImage.src = data.images.portrait; // Default to portrait
                defaultImage.alt = data.name;
            }
        }
    } catch (e) {
        console.error("Error updating content:", e);
    }
}

/**
 * Handles the click event on a tab.
 * @param {Event} e The click event object.
 */
function changeTabPanel(e) {
    const targetTab = e.target.closest('[role="tab"]');
    if (!targetTab) return; // Ensure a tab was clicked

    const tabContainer = targetTab.parentNode;

    // 1. Update aria-selected state
    tabContainer
        .querySelector('[aria-selected="true"]')
        .setAttribute("aria-selected", false);

    targetTab.setAttribute("aria-selected", true);

    // 2. Get the index and update content dynamically
    const index = parseInt(targetTab.getAttribute("data-index"));
    if (!isNaN(index)) {
        updateContent(index);
    }

    // The content is already visible and dynamic, so we just focus on it
    const dynamicContent = document.getElementById("dynamic-content");
    if (dynamicContent) {
        // Focus is primarily for keyboard navigation accessibility
        dynamicContent.focus();
    }
}

/**
 * Handles keyboard navigation for tabs.
 * This function remains mostly the same, but now calls updateContent on keydown selection.
 * @param {Event} e The keydown event object.
 */
let tabFocus = 0;
function changeTabFocus(e) {
    const keydownLeft = 37;
    const keydownRight = 39;

    if (e.keyCode === keydownLeft || e.keyCode === keydownRight) {
        tabs[tabFocus].setAttribute("tabindex", -1);
    }

    if (e.keyCode === keydownRight) {
        tabFocus++;
        if (tabFocus >= tabs.length) {
            tabFocus = 0;
        }
    }

    if (e.keyCode === keydownLeft) {
        tabFocus--;
        if (tabFocus < 0) {
            tabFocus = tabs.length - 1;
        }
    }

    if (e.keyCode === keydownLeft || e.keyCode === keydownRight) {
        // Find the newly focused tab
        const newTab = tabs[tabFocus];

        newTab.setAttribute("tabindex", 0);
        newTab.focus();

        // --- Dynamically update content on keyboard selection ---
        const index = parseInt(newTab.getAttribute("data-index"));
        if (!isNaN(index)) {
            // Simulate a click event to trigger content update and aria-selected change
            changeTabPanel({ target: newTab });
        }
    }
}

/**
 * Initializes the tab system: loads data, sets up event listeners, and displays initial content.
 */
async function loadDataAndInitializeTabs() {
    currentCategory = determineCategory();

    if (!currentCategory) {
        console.log(
            "Not on a content page (destination, crew, or technology). Tab logic skipped.",
        );
        return;
    }

    try {
        // Fetch data
        const response = await fetch("/data.json");
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        spaceData = await response.json();
        currentDataArray = spaceData[currentCategory];

        // 1. Set up event listeners
        if (tabList) {
            tabList.addEventListener("keydown", changeTabFocus);
            tabs.forEach((tab) => {
                tab.addEventListener("click", changeTabPanel);
            });
        }

        // 2. Initialize the first tab's content
        // The first tab should have aria-selected="true" and data-index="0"
        const initialTab = tabList.querySelector('[aria-selected="true"]');
        const initialIndex = initialTab
            ? parseInt(initialTab.getAttribute("data-index"))
            : 0;

        updateContent(initialIndex);
    } catch (error) {
        console.error("Failed to load space data or initialize tabs:", error);
        // Display a user-friendly error message if content areas exist
        const content = document.getElementById("dynamic-content");
        if (content)
            content.innerHTML =
                '<p style="color:red;">Error loading content. Please check the data.json file path and format.</p>';
    }
}

// Start the initialization process when the script loads
loadDataAndInitializeTabs();
