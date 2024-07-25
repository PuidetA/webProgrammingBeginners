const YEARS = [
    '2000', '2001', '2002', '2003', '2004', 
    '2005', '2006', '2007', '2008', '2009', 
    '2010', '2011', '2012', '2013', '2014', 
    '2015', '2016', '2017', '2018', '2019', 
    '2020', '2021'
];

let currentYears = [...YEARS]; //Source: https://www.freecodecamp.org/news/three-dots-operator-in-javascript/
let currentPage = 'home';

async function fetchPopulationData(areaCode = "SSS") {

    const response = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            query: [
                {
                    code: "Vuosi",
                    selection: {
                        filter: "item",
                        values: currentYears
                    }
                },
                {
                    code: "Alue",
                    selection: {
                        filter: "item",
                        values: [areaCode]
                    }
                },
                {
                    code: "Tiedot",
                    selection: {
                        filter: "item",
                        values: ["vaesto"]
                    }
                }
            ],
            response: {
                format: "json-stat2"
            }
        })
    });
    const data = await response.json();
    return data.value;
};

async function fetchMunicipalityCodes() {
    const response = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px");
    const data = await response.json();

    const municipalityCodes = {};
    data.variables[1].valueTexts.forEach((name, index) => {
        municipalityCodes[name.toLowerCase()] = data.variables[1].values[index];
    });
    return municipalityCodes;
};

document.getElementById('submit-data').addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('input-area').value.toLowerCase();
    const municipalityCodes = await fetchMunicipalityCodes();
    const municipalityCode = municipalityCodes[name];

    if (municipalityCode) {
        currentYears = [...YEARS];
        const populationData = await fetchPopulationData(municipalityCode);
        chart.update({
            labels: currentYears,
            datasets: [{ values: populationData }]
        });
    } else {
        console.log('Municipality not found');
    }
});

function predictData(data) {
    let dataDeltas = 0;
    for (let i = 0; i < data.length-1; i++) {
        dataDeltas += data[i + 1] - data[i];
    }
    const meanDelta = dataDeltas / (data.length - 1);
    const predictedData = data[data.length - 1] + meanDelta;
    return Math.round(predictedData);
};

document.getElementById('predict-data').addEventListener('click', () => {
    const data = chart.data.datasets[0].values;
    const predictedData = predictData(data);
    const predictedYear = (parseInt(currentYears.slice(-1)[0]) + 1).toString()

    currentYears.push(predictedYear);
    data.push(predictedData);

    chart.update({
        labels: currentYears,
        datasets: [{ values: data}],    });
    
});


let chart; // I asked advice from a friend about how to handle the chart object being returned,
// they asked "Why not just declare it beforehand?" and I decided to use that as an inspiration for this.
async function makeChart() {
    const data = await fetchPopulationData();
    chart = new frappe.Chart("#chart", {
        height: 450,
        type: "line",
        colors: ['#eb5146'],
        data: {
            labels: currentYears, // x_labels didn't work. Used this, since it ends up on the x-axis anyway.
            datasets: [{values: data}]
        },
        title: "Population growth data in Finland"
    })
};

document.getElementById('navigation').addEventListener('click', async (e) => {
    e.preventDefault();
    const name = document.getElementById('input-area').value.toLowerCase();
    const municipalityCodes = await fetchMunicipalityCodes();
    const municipalityCode = municipalityCodes[name];

    if (!municipalityCode) {
        console.log('Municipality not found');
        return;
    }
    
    window.location.href = `newchart.html?municipalityCode=${municipalityCode}`;
});

makeChart();