
// Exercise 1:
const statinURL = 'https://statfin.stat.fi/PxWeb/sq/4e244893-7761-4c4f-8e55-7a8d41d86eff';
const employmentURL = 'https://statfin.stat.fi/PxWeb/sq/5e288b40-f8c8-4f1e-b3b0-61b86ce5c065';
const table = document.getElementById('table-body');

async function populateTable() {

    //Municipality and population fetching
    const populatePromise = await fetch(statinURL); // Fetch the data from the URL
    const populateJSON = await populatePromise.json(); // Convert the data to JSON

    //Employment amount fetching
    const employmentPromise = await fetch(employmentURL);
    const employmentJSON = await employmentPromise.json();


    // Source used to understand the json format: https://jsonviewer.stack.hu/
    // Get data from the JSON.
    const area = populateJSON.dataset.dimension.Alue.category.label; // Get municipality names
    const population = populateJSON.dataset.value; // Get the population values
    
    const employment = employmentJSON.dataset.value;;

    population.forEach((population, index) => { // Iterate through each population value

        // Source: https://www.w3schools.com/jsref/jsref_object_values.asp
        // Get municipality names from the json. I checked the source and by accessing the object, we can extract the values.
        // The values are in the same order as in the population. So we can use the same index.
        const municipality = Object.values(area)[index];

        // Get employment amount to add to the table
        const employmentAmount = employment[index];

        // Source: https://www.w3schools.com/jsref/jsref_tofixed.asp
        const employmentPercentage = ((employmentAmount / population) * 100).toFixed(2);
        

        // Create a new row
        const newRow = document.createElement('tr');

        // Source: https://www.shecodes.io/athena/3913-how-to-add-a-class-to-an-html-element-in-javascript
        // Check if a row should be coloured different based on percentage.
        if (employmentPercentage > 45){
            newRow.classList.add('table-row-over45');
        }
        if (employmentPercentage < 25){
            newRow.classList.add('table-row-under25');
        }

        // Create new cells
        const newCell1 = document.createElement('td');
        const newCell2 = document.createElement('td');
        const newCell3 = document.createElement('td');
        const newCell4 = document.createElement('td');


        // #### ADDING DATA TO THE TABLE ####
        // Create new cells. Then populate them with the data we just recieved.
        newCell1.innerText = municipality;
        newCell2.innerText = population;
        newCell3.innerText = employmentAmount;
        newCell4.innerText = employmentPercentage+"%";

        newRow.appendChild(newCell1);
        newRow.appendChild(newCell2);
        newRow.appendChild(newCell3);
        newRow.appendChild(newCell4);

        table.appendChild(newRow);
    });
}

populateTable();