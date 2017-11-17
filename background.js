var menuItem = {
    title: "שתף את הקטע ב Facebook",
    contexts: ["selection"],
    onclick: function(info) {
        fetch("https://graph.facebook.com/546349135390552/feed?message=Hello fans")
        // chrome.tabs.create({
        //     url: 'https://graph.facebook.com/546349135390552/feed?message=Hello fans‏',
        //     method: 'POST'
        // })
    }
};
chrome.contextMenus.create(menuItem)