// ==========================================
// Rotten Moderation Dashboard
// As a moderator, you have to deal with every situation with fairness
// your role is to help keep our community safe not to control them 
// you are not a leader or an owner, you are just keeping the environment safe
// dont use your authority to your own favor 
// unreasonable bans will lead to position displacement.
// any unauthorized data access will lead to position desplacement.
// no warnings for moderators, make 1 mistake and youre out
// moderators are not allowed to work as a middle man for any kind of selling processes
// moderators are not allowed to monitize / advertise for a specific product
// ==========================================



const threadList =
    document.getElementById("thread-list");

const threadDetails =
    document.getElementById("thread-details");

const searchForm =
    document.getElementById("search-form");

const searchInput =
    document.getElementById("search-input");

const showAllButton =
    document.getElementById("show-all");


// ==========================================
// Load all threads
// ==========================================

function loadThreads() {

    fetch("/api/moderation/threads")

        .then(response => {

            if (!response.ok) {
                throw new Error("Failed to load threads");
            }

            return response.json();

        })

        .then(threads => {

            displayThreads(threads);

        })

        .catch(error => {

            console.error(error);

            threadList.innerHTML = `
                <p>Failed to load threads.</p>
            `;

        });

}


// ==========================================
// Display threads
// ==========================================

function displayThreads(threads) {

    threadList.innerHTML = "";


    if (threads.length === 0) {

        threadList.innerHTML = `
            <p>No threads found.</p>
        `;

        return;

    }


    threads.forEach(thread => {

        const div =
            document.createElement("div");

        div.className = "thread-item";


        div.innerHTML = `

            <h3>
                No.${thread.id}
                — ${thread.subject || "(No subject)"}
            </h3>

            <div class="thread-meta">

                /${thread.board_slug}
                —
                ${thread.name || "Anonymous"}
                —
                ${thread.created_at}

            </div>

        `;


        div.addEventListener(
            "click",
            () => {

                loadThread(thread.id);

            }
        );


        threadList.appendChild(div);

    });

}


// ==========================================
// Load one thread
// ==========================================

function loadThread(threadId) {

    fetch(`/api/moderation/thread/${threadId}`)

        .then(response => {

            if (!response.ok) {
                throw new Error("Thread not found");
            }

            return response.json();

        })

        .then(data => {

            displayThread(data);

        })

        .catch(error => {

            console.error(error);

            threadDetails.innerHTML = `
                <p>Failed to load thread.</p>
            `;

        });

}


// ==========================================
// Display one thread
// ==========================================

function displayThread(data) {

    const thread = data.thread;

    const replies = data.replies;


    let repliesHTML = "";


    replies.forEach(reply => {

        repliesHTML += `

            <div class="reply">

                <strong>
                    ${reply.name || "Anonymous"}
                </strong>

                <small>
                    No.${reply.id}
                </small>

                <p>
                    ${reply.comment}
                </p>

                <small>
                    ${reply.created_at}
                </small>

            </div>

        `;

    });


    if (replies.length === 0) {

        repliesHTML = `
            <p>No replies.</p>
        `;

    }


    threadDetails.innerHTML = `

        <h2>
            No.${thread.id}
            — ${thread.subject || "(No subject)"}
        </h2>

        <p>
            Board:
            <strong>/${thread.board_slug}</strong>
        </p>

        <p>
            Author:
            <strong>${thread.name || "Anonymous"}</strong>
        </p>

        <p>
            Created:
            ${thread.created_at}
        </p>


        <div class="thread-comment">

            ${thread.comment}

        </div>


        <h3>
            Replies (${replies.length})
        </h3>

        <div>

            ${repliesHTML}

        </div>


        <button
            class="delete-thread"
            id="delete-thread">

            Delete Thread

        </button>

    `;


    // ======================================
    // Delete button
    // ======================================

    document
        .getElementById("delete-thread")
        .addEventListener("click", () => {

            deleteThread(thread.id);

        });

}


// ==========================================
// Delete thread
// ==========================================

function deleteThread(threadId) {

    const confirmed =
        confirm(
            `Delete thread No.${threadId} and all of its replies?`
        );


    if (!confirmed) {

        return;

    }


    fetch(`/api/moderation/thread/${threadId}`, {

        method: "DELETE"

    })

        .then(response => {

            if (!response.ok) {

                throw new Error(
                    "Failed to delete thread"
                );

            }

            return response.json();

        })

        .then(data => {

            console.log(data);


            threadDetails.innerHTML = `

                <p>
                    Thread deleted successfully.
                </p>

            `;


            loadThreads();

        })

        .catch(error => {

            console.error(error);

            alert(
                "Failed to delete thread."
            );

        });

}


// ==========================================
// Search
// ==========================================

searchForm.addEventListener(
    "submit",
    event => {

        event.preventDefault();


        const query =
            searchInput.value.trim();


        if (!query) {

            loadThreads();

            return;

        }


        fetch(
            `/api/moderation/search?q=${encodeURIComponent(query)}`
        )

            .then(response => {

                if (!response.ok) {

                    throw new Error(
                        "Search failed"
                    );

                }

                return response.json();

            })

            .then(threads => {

                displayThreads(threads);

            })

            .catch(error => {

                console.error(error);

                threadList.innerHTML = `
                    <p>Search failed.</p>
                `;

            });

    }
);


// ==========================================
// Show all
// ==========================================

showAllButton.addEventListener(
    "click",
    () => {

        searchInput.value = "";

        loadThreads();

    }
);

document
    .getElementById("logout-button")
    .addEventListener("click", async () => {

        try {

            await fetch(
                "/api/auth/logout",
                {
                    method: "POST"
                }
            );

            window.location.href =
                "/login.html";

        }

        catch (error) {

            console.error(error);

        }

    });


// ==========================================
// Initial load
// ==========================================

checkAuthentication()
    .then(authenticated => {

        if (authenticated) {

            loadThreads();

        }

    });