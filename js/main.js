
function createElemWithText(elementType, textContent, className) {
    if (elementType === undefined) {
        elementType = 'p';
    }

    if (textContent === undefined) {
        textContent = '';
    }

    var element = document.createElement(elementType);
    if (className) {
        element.className = className;
    }
    element.innerText = textContent;

    return element;
}

function createSelectOptions(usersJson) {
    if (usersJson === undefined) {
        return undefined;
    }

    var results = [];

    for (var user of usersJson) {
        var option = document.createElement("option")
        option.setAttribute("value", user.id);
        option.innerText = user.name;
        results.push(option);
    }
    return results;
}

function toggleCommentSection(postId) {
    if (!postId) {
        return undefined;
    }

    var post = document.querySelector(`section[data-post-id='${postId}']`)
    if (!post) {
        return post;
    }
    if (post.classList.contains("hide")) {
        post.classList.remove("hide");
    }
    else {
        post.classList.add("hide");
    }

    return post;
}

function toggleCommentButton(postId) {
    if (!postId) {
        return undefined;
    }

    var button = document.querySelector(`button[data-post-id='${postId}']`)
    if (!button) {
        return button;
    }
    button.innerText = button.innerText == "Show Comments" ? "Hide Comments" : "Show Comments";

    return button;
}

function deleteChildElements(parentElement) {
    if (!parentElement || !parentElement.children) {
        return undefined;
    }

    while (parentElement.lastElementChild) {
        var lastChild = parentElement.lastElementChild;
        parentElement.removeChild(lastChild);
    } 

    return parentElement;
}

function addButtonListeners() {
    var buttons = document.querySelectorAll("main button");
    if (!buttons) {
        return;
    }

    for (var button of buttons) {
        var postId = button.getAttribute("data-post-id");
        if (postId) {
            button.addEventListener("click", toggleComments);
        }
    }

    return buttons;
}

function removeButtonListeners() {
    var buttons = document.querySelectorAll("main button");
    if (!buttons) {
        return;
    }

    for (var button of buttons) {
        var postId = button.getAttribute("data-post-id");
        if (postId) {
            button.removeEventListener("click", toggleComments);
        }
    }

    return buttons;
}

function createComments(comments) {
    if (!comments) {
        return undefined;
    }

    var fragment = document.createDocumentFragment();

    for (var comment of comments) {
        var article = document.createElement("article");
        var h3 = createElemWithText("h3", comment.name);
        var para1 = createElemWithText("p", comment.body);
        var para2 = createElemWithText("p", `From: ${comment.email}`);
        article.appendChild(h3);
        article.appendChild(para1);
        article.appendChild(para2);
        fragment.appendChild(article);
    }

    return fragment;
}

function populateSelectMenu(users) {
    if (!users) {
        return undefined;
    }

    var selectMenu = document.getElementById("selectMenu");
    var options = createSelectOptions(users);
    for (var option of options) {
        selectMenu.appendChild(option);
    }

    return selectMenu;
}

async function getUsers() {
    try {
        var response = await fetch('https://jsonplaceholder.typicode.com/users');
        var users = await response.text();
        return JSON.parse(users);
    }
    catch (ex) {
        console.error("Could not get users", ex);
        return [];
    }
}

async function getUserPosts(userId) {
    if (!userId) {
        return undefined;
    }

    try {
        var response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}/posts`);
        var posts = await response.text();
        var result = JSON.parse(posts);
        return result;
    }
    catch (ex) {
        console.error("Could not get posts for user " + userId, ex);
        return [];
    }
}

async function getUser(userId) {
    if (!userId) {
        return undefined;
    }
    
    try {
        var response = await fetch(`https://jsonplaceholder.typicode.com/users/${userId}`);
        var user = await response.text();
        return JSON.parse(user);
    }
    catch (ex) {
        console.error("Could not get user " + userId, ex);
        return [];
    }
}

async function getPostComments(postId) {
    if (!postId) {
        return undefined;
    }
    
    try {
        var response = await fetch(`https://jsonplaceholder.typicode.com/posts/${postId}/comments`);
        var comments = await response.text();
        return JSON.parse(comments);
    }
    catch (ex) {
        console.error("Could not get comments for post " + postId, ex);
        return [];
    }
}

async function displayComments(postId) {
    if (!postId) {
        return undefined;
    }
    
    var section = document.createElement("section");
    section.dataset.postId = postId;
    //section.setAttribute("data-post-id", postId);
    section.classList.add("hide", "comments");
    var comments = await getPostComments(postId);
    var fragment = createComments(comments);
    section.appendChild(fragment);
    return section;
}

async function createPosts(postsJson) {
    if (!postsJson) {
        return undefined;
    }

    var fragment = document.createDocumentFragment();

    for (var post of postsJson) {
        var article = document.createElement("article");
        var h2 = createElemWithText("h2", post.title);
        var para1 = createElemWithText("p", post.body);
        var para2 = createElemWithText("p", `Post ID: ${post.id}`);
        var author = await getUser(post.userId);
        var para3 = createElemWithText("p", `Author: ${author.name} with ${author.company.name}`);
        var para4 = createElemWithText("p", author.company.catchPhrase);
        var commentButton = createElemWithText("button", "Show Comments");
        commentButton.dataset.postId = post.id;
        article.appendChild(h2);
        article.appendChild(para1);
        article.appendChild(para2);
        article.appendChild(para3);
        article.appendChild(para4);
        article.appendChild(commentButton);

        var comments = await displayComments(post.id);
        article.appendChild(comments);

        fragment.appendChild(article);
    }

    return fragment;
}

async function displayPosts(posts) {
    var main = document.querySelector("main");
    var element;
    if (posts) {
        element = await createPosts(posts)
    }
    else {
        element = createElemWithText("p");
        element.classList.add("default-text");
        element.innerText = "Select an Employee to display their posts."
    }

    main.appendChild(element);

    return element;
}

function toggleComments(e, postId) {
    if (!e || (!postId && !e.target.dataset.postId)) {
        return undefined;
    }
    e.target.listener = true;
    postId ??= e.target.dataset.postId;
    var section = toggleCommentSection(postId);
    var button = toggleCommentButton(postId);
    return [section, button];
}

async function refreshPosts(postsJson) {
    if (!postsJson) {
        return undefined;
    }

    var removedButtons = removeButtonListeners();
    var parent = deleteChildElements(document.querySelector("main"));
    var fragment = await displayPosts(postsJson);
    parent.appendChild(fragment);
    var addedButtons = addButtonListeners();
    return [removedButtons, parent, fragment, addedButtons];
}

async function selectMenuChangeEventHandler(e) {
    if (!e) {
        return undefined;
    }
    console.log("selectMenuChangeEvent",e);
    var selectMenu = document.getElementById("selectMenu");
    selectMenu.setAttribute("disabled","disabled");
    var userId = e.target.value || 1;
    var posts = await getUserPosts(userId);
    var refreshResult = await refreshPosts(posts);
    selectMenu.removeAttribute("disabled");
    return [userId, posts, refreshResult];
}

async function initPage() {
    var users = await getUsers();
    var selectElement = populateSelectMenu(users);
    return [users, selectElement];
}

function initApp() {
    initPage();
    var selectMenu = document.getElementById("selectMenu");
    selectMenu.addEventListener("change", selectMenuChangeEventHandler);
}

document.addEventListener("DOMContentLoaded", initApp);
