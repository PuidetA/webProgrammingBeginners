
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

    
}