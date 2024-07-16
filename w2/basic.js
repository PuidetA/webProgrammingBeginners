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


    //Loop through each row in the table and check if the username value is the same in both cases. 
    //If it is, then update all fields except the username (since it's the same).
    for (i=0; i<document.getElementById("table-body").rows.length; i++) {
        if (document.getElementById("table-body").rows[i].cells[0].innerHTML == document.getElementById("input-username").value) {
            tableBody.rows[i].cells[1].innerHTML = document.getElementById("input-email").value;
            tableBody.rows[i].cells[2].innerHTML = document.getElementById("input-admin").checked ? "X" : "-";
            usernameFree = false; //Make it so that it doesn't add a new row.
            break;
        }}

    if (usernameFree) {
        const newRowData = document.getElementById("table-body").insertRow();

        newRowData.insertCell(0).innerHTML = document.getElementById("input-username").value;
        newRowData.insertCell(1).innerHTML = document.getElementById("input-email").value;
        newRowData.insertCell(2).innerHTML = document.getElementById("input-admin").checked ? "X" : "-";
    }
    


});


//<!--Exercise 3:-->
const wipeDataButton = document.getElementById("empty-table");

wipeDataButton.addEventListener("click", function() {
    document.getElementById("input-username").value = "";
    document.getElementById("input-email").value = "";
    document.getElementById("input-admin").checked = false;
});