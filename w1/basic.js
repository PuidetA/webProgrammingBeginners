
if (document.readyState !== "loading") {
    console.log("Document is ready!");
    initializeCode();
    } else {
        document.addEventListener("DOMContentLoaded", function() {
            console.log("Document is ready after waiting!");
            initializeCode();
        })
    }


function initializeCode() {
    const helloWorldButton = document.getElementById("my-button");

    helloWorldButton.addEventListener("click", function() {
        console.log("hello world");
        document.getElementById("my-h1").innerHTML = "Moi maailma";
    });

    const addDataButton = document.getElementById("add-data");
    
    addDataButton.addEventListener("click", function() {
        const myList = document.getElementById("my-list");

        let newList = document.createElement("li");
        newList.innerHTML = document.getElementById("my-textarea").value;

        myList.appendChild(newList);

    });

    
}