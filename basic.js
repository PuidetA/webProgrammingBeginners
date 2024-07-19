
// Exercise 1:
const statinURL = 'https://statfin.stat.fi/PxWeb/sq/4e244893-7761-4c4f-8e55-7a8d41d86eff';
const table = document.getElementById('table-body');

async function populateTable() {
    const populatePromise = await fetch(statinURL); // Fetch the data from the URL
    const populateJSON = await populatePromise.json(); // Convert the data to JSON

    const area = populateJSON.dataset.dimension.Alue.category.label; // Get municipality names
    const population = populateJSON.dataset.value; // Get the population values

    population.forEach((population, index) => { // Iterate through each population value
        
        const areaIndex = Object.keys(area)[index]; // Get the index for the municipality via the population index
        const municipality = area[areaIndex]; // Get the municipality name with the index we just got


        // Create new table row and cells. Then populate them with the data we just recieved.
        const newRow = document.createElement('tr');
        const newCell1 = document.createElement('td');
        const newCell2 = document.createElement('td');

        newCell1.innerText = municipality;
        newCell2.innerText = population;

        newRow.appendChild(newCell1);
        newRow.appendChild(newCell2);

        table.appendChild(newRow);
    });
}

populateTable();