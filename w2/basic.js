console.log('Hello World!');

function sum(a, b) {
    return a + b;
}

console.log(sum(5, 2));

let sum2 = function (a, b) {
    return a + b;
}

console.log(sum2(5, 2));

setTimeout(function () {
    console.log('2 seconds have passed.."');
    console.log(sum2(15, 13));

}, 2000);

let sum3 = (a, b) =>  a + b;
let squared = x => x * x;
let largerFunction = (a, b, c) => {
    // do something
    return a + b / c;
}

console.log(sum3(5, 4));
console.log(squared(9));

console.log('Done!');


//<!--Exercise 2 & 4:-->
const addNewRow = document.getElementById("submit-data");

addNewRow.addEventListener("click", function() {
    let usernameFree = true;
    const tableBody = document.getElementById("table-body");
    const image = document.getElementById("input-image").files[0];


    //Loop through each row in the table and check if the username value is the same in both cases. 
    //If it is, then update all fields except the username (since it's the same).
    for (i=0; i<document.getElementById("table-body").rows.length; i++) {
        if (document.getElementById("table-body").rows[i].cells[0].innerHTML == document.getElementById("input-username").value) {
            tableBody.rows[i].cells[1].innerHTML = document.getElementById("input-email").value;
            tableBody.rows[i].cells[2].innerHTML = document.getElementById("input-admin").checked ? "X" : "-";

            //Clear the potential image. The purpose of this part of the function originally was to edit existing rows.
            //This means that you replace the admin priviledge or the email. So should the image be replaced as well by this logic.
            tableBody.rows[i].cells[3].innerHTML = ""; 
            addImage(tableBody.rows[i].cells[3], image);


            usernameFree = false; //Make it so that it doesn't add a new row.
            break;
        }}

    if (usernameFree) {
        const newRowData = document.getElementById("table-body").insertRow();

        newRowData.insertCell(0).innerHTML = document.getElementById("input-username").value;
        newRowData.insertCell(1).innerHTML = document.getElementById("input-email").value;
        newRowData.insertCell(2).innerHTML = document.getElementById("input-admin").checked ? "X" : "-";
        addImage(newRowData.insertCell(3), image);
    }
    


});


//<!--Exercise 3:-->


const wipeDataButton = document.getElementById("empty-table");
/*
wipeDataButton.addEventListener("click", function() {
    document.getElementById("input-username").value = "";
    document.getElementById("input-email").value = "";
    document.getElementById("input-admin").checked = false;
});*/
wipeDataButton.addEventListener("click", function() {
    for (i=0; i<document.getElementById("table-body").rows.length; i++) {
        document.getElementById("table-body").deleteRow(i);
        i--; //go back one step to not skip a row.
    }
});

//<!--Exercise 5:--> This adds an image to the table. It's a separate function to make it more readable.
const image = document.getElementById("input-image");

let addImage = function(cell, image) {
    const img = document.createElement("img");
    img.src = URL.createObjectURL(image);
    img.height = 64;
    img.width = 64;
    cell.innerHTML = ""; //Clear it first, so we don't have multiple images later on.
    cell.appendChild(img);
};
