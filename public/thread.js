// ==========================================
// Get thread ID from URL
// ==========================================

const path = window.location.pathname;

const parts = path.split("/");

// /thread/20
// ["", "thread", "20"]

// /board/music/thread/20
// ["", "board", "music", "thread", "20"]

const threadId = parts[parts.length - 1];

console.log("Thread ID:", threadId);


// ==========================================
// Get the thread
// ==========================================

fetch(`/api/threads/single/${threadId}`)

    .then(response => {

        if (!response.ok) {
            throw new Error("Thread not found");
        }

        return response.json();

    })

    .then(data => {

        console.log("Thread data:", data);

        const thread = data.thread;
        const replies = data.replies;


        // ==================================
        // Update page title
        // ==================================

        document.title =
            `${thread.subject} - Rotten`;


        // ==================================
        // Thread information
        // ==================================

        document.getElementById("thread-subject").textContent =
            thread.subject;


        document.getElementById("thread-author").textContent =
            thread.name || "Anonymous";


        document.getElementById("thread-comment").textContent =
            thread.comment;

        // image part

        const threadImage = 
            document.getElementById("thread-image");

            if(thread.image){
                threadImage.innerHTML = `
                <div class = "post-image">
                <img
                src = "${thread.image}"
                alt = "Thread image"
                loading = "lazy">

                </div>
                `;
            } else {
                threadImage.innerHTML = "";
            }
        // ==================================
        // Replies container
        // ==================================

        const repliesContainer =
            document.getElementById("replies");

        repliesContainer.innerHTML = "";


        // ==================================
        // Display replies
        // ==================================

        replies.forEach(reply => {

            const replyDiv =
                document.createElement("div");

            replyDiv.className = "reply";

            replyDiv.id =
                `post-${reply.id}`;


            // Turn >>123 into a clickable quote
            const formattedComment =
                reply.comment.replace(
                    />>(\d+)/g,
                    '<a class="quote" href="#post-$1">>>$1</a>'
                );


            replyDiv.innerHTML = `

                <strong>
                    ${reply.name || "Anonymous"}
                </strong>

                <span
                    class="post-id"
                    data-post="${reply.id}">
                    No.${reply.id}
                </span>

                <p>
                    ${formattedComment}
                </p>

                <hr>

            `;


            repliesContainer.appendChild(replyDiv);

        });


        // ==================================
        // Reply form
        // ==================================

        const replyForm =
            document.getElementById("reply-form");


        replyForm.addEventListener(
            "submit",
            event => {

                event.preventDefault();


                const name =
                    document.getElementById("reply-name").value;


                const comment =
                    document.getElementById("reply-comment").value;


                if (!comment.trim()) {

                    alert("Reply cannot be empty.");

                    return;

                }


                // ==================================
                // Send reply to backend
                // ==================================

                fetch("/api/replies", {

                    method: "POST",

                    headers: {
                        "Content-Type": "application/json"
                    },

                    body: JSON.stringify({

                        thread_id: thread.id,

                        name: name,

                        comment: comment

                    })

                })

                .then(response => {

                    if (!response.ok) {
                        throw new Error(
                            "Failed to create reply"
                        );
                    }

                    return response.json();

                })

                .then(data => {

                    console.log("Reply created:", data);

                    location.reload();

                })

                .catch(error => {

                    console.error(
                        "Failed to create reply:",
                        error
                    );

                });

            }
        );

    })

    .catch(error => {

        console.error(error);


        document.getElementById(
            "thread-container"
        ).innerHTML = `

            <h2>
                Thread not found
            </h2>

            <p>
                This thread does not exist.
            </p>

        `;

    });


// ==========================================
// Clicking No.X
// ==========================================

document.addEventListener("click", event => {

    if (!event.target.classList.contains("post-id")) {
        return;
    }


    const id =
        event.target.dataset.post;


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