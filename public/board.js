

// Get the current URL
const path = window.location.pathname;
// Split the URL by "/"
// ["", "board", "music"]
const parts = path.split("/");
const slug = parts[parts.length - 1];

let allReplies = [];

// Ask the backend for this board
fetch(`/api/boards/${slug}`).then(response => response.json()).then(board => {

    // Change the page title
    document.getElementById("board-title").textContent = `/${board.slug} - ${board.title}`;

    document.getElementById("board-description").textContent = board.description;
    fetch(`/api/threads/${slug}`).then(response => response.json()).then(threads => {
        const threadSection = document.getElementById("threads");
        threadSection.innerHTML = "";
        threads.forEach(thread => {
const div = document.createElement("div");
div.className = "thread";
div.id = `post-${thread.id}`;
            div.id = `reply-${thread.id}`;
div.innerHTML = `
<h3>
    <a href="/thread/${thread.id}">
        ${thread.subject}
    </a>
</h3>

<strong>${thread.name || "Anonymous"}</strong>
<span class="post-id" data-post="${thread.id}">
    No.${thread.id}
</span>
<p>${thread.comment}</p>
${
    thread.image ? `
    <div class="post-image">
    <img 
        src= "${thread.image}"
        alt = "thread image"
        loading = "lazy">
        </div>
    `
    : ""
}
<div class="post-replies">
</div>
<hr>

<div class="replies" id="replies-${thread.id}">

</div>

<form class="reply-form" data-thread="${thread.id}">

    <input
        class="reply-name"
        type="text"
        placeholder="Anonymous">

    <textarea
        class="reply-comment"
        placeholder="Write a reply..."></textarea>

    <button type="submit">

        Reply

    </button>

</form>
`;
            threadSection.appendChild(div);

            const repliesDiv = div.querySelector(".replies");

fetch(`/api/replies/${thread.id}`)
.then(response => response.json())
.then(replies => {
 allReplies.push(...replies);
    replies.forEach(reply => {

        const replyDiv = document.createElement("div");
        replyDiv.id = `reply-${reply.id}`;

        replyDiv.className = "reply";
        replyDiv.id = `post-${reply.id}`;

const formattedComment = reply.comment.replace(
    />>(\d+)/g,
    '<a class="quote" href="#post-$1">>>$1</a>'
);

replyDiv.innerHTML = `
    <strong>${reply.name}</strong>
    <span class="post-id" data-post="${reply.id}">
        No.${reply.id}
    </span>

    <p>${formattedComment}</p>

    <hr>
`;

        repliesDiv.appendChild(replyDiv);

    });

})
.catch(console.error);

            const replyForm = div.querySelector(".reply-form");

replyForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const threadId = replyForm.dataset.thread;

    const name =
        replyForm.querySelector(".reply-name").value;

    const comment =
        replyForm.querySelector(".reply-comment").value;

    fetch("/api/replies", {

        method: "POST",

        headers: {
            "Content-Type": "application/json"
        },

        body: JSON.stringify({

            thread_id: threadId,

            name: name,

            comment: comment

        })

    })
    .then(res => res.json())
    .then(data => {

        console.log(data);

        location.reload();

    })
    .catch(console.error);

});
            
        });
    }).catch(err => console.error(err));

    document.getElementById("board-name").textContent =
    board.title;

})
    .catch(error => {
        console.error("faild to load the board : ", error);
    });
// Change the board description

//create a thread

//find forum
const threadForm = document.getElementById("thread-form");

threadForm.addEventListener("submit", (event) => {

    event.preventDefault();

    const name = document.getElementById("thread-name").value;

    const subject = document.getElementById("thread-subject").value;

    const comment = document.getElementById("thread-comment").value;

    const imageInput = document.getElementById("thread-image");

    const formData = new FormData();

    formData.append("board", slug);
    formData.append("name", name);
    formData.append("subject", subject);
    formData.append("comment" , comment);

    if(imageInput.files.length > 0) {
        formData.append(
            "image", 
            imageInput.files[0]
        );
    }

    fetch("/api/threads", {

        method: "POST",

        body: formData,

    })

    .then(response => {
        if(!response.ok) {
            throw new Error(
                "Faild to create thread"
            );
        }
        return response.json();

    })

    .then(data => {

        console.log("Thread created: ",data);

        // Refresh to display the new thread
        location.reload();

    })
    .catch(err =>
        { console.error(
        "Failed to create thread: ", error
    )
});

});
document.addEventListener("click", (event) => {

    if (!event.target.classList.contains("post-id"))
        return;

    const id = event.target.dataset.post;

    // Insert >>id into the currently focused reply form (if any)
    const activeReplyForm =
        document.activeElement.closest(".reply-form");

    if (activeReplyForm) {

        const textarea =
            activeReplyForm.querySelector(".reply-comment");

        textarea.value += `>>${id}\n`;

        textarea.focus();

    }

    // Find the referenced post
    const target = document.getElementById(`reply-${id}`);

    if (!target)
        return;

    // Scroll smoothly
    target.scrollIntoView({

        behavior: "smooth",

        block: "center"

    });

    // Flash highlight
    target.classList.add("highlight");

    setTimeout(() => {

        target.classList.remove("highlight");

    }, 2000);

});

function findRepliesTo(postId, allReplies) {

    const result = [];

    allReplies.forEach(reply => {

        const matches = reply.comment.match(/>>(\d+)/g);

        if (!matches) return;

        matches.forEach(match => {

            const quotedId = match.substring(2);

            if (quotedId === String(postId)) {

                result.push(reply.id);

            }

        });

    });

    return result;
}

document.addEventListener("click", (event) => {

    if (!event.target.classList.contains("post-id")) {
        return;
    }

    const id = event.target.dataset.post;

    const activeElement = document.activeElement;

    const activeReplyForm =
        activeElement?.closest(".reply-form");

    if (activeReplyForm) {

        const textarea =
            activeReplyForm.querySelector(".reply-comment");

        textarea.value += `>>${id}\n`;

        textarea.focus();

        return;
    }

    const target =
        document.getElementById(`post-${id}`);

    if (!target) {
        return;
    }

    target.scrollIntoView({
        behavior: "smooth",
        block: "center"
    });

    target.classList.add("highlight");

    setTimeout(() => {

        target.classList.remove("highlight");

    }, 2000);

});