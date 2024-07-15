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
