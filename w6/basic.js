const YEARS = [
    '2000', '2001', '2002', '2003', '2004', 
    '2005', '2006', '2007', '2008', '2009', 
    '2010', '2011', '2012', '2013', '2014', 
    '2015', '2016', '2017', '2018', '2019', 
    '2020', '2021'
];

async function fetchPopulationData() {
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
                        values: YEARS
                    }
                },
                {
                    code: "Alue",
                    selection: {
                        filter: "item",
                        values: ["SSS"]
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

};

async function fetchMunicipalityNames() {

};


let chart; // I asked advice from a friend about how to handle the chart object being returned,
// they asked "Why not just declare it beforehand?" and I decided to use that as an inspiration for this.
async function makeChart() {
    const data = await fetchPopulationData();
    chart = new frappe.Chart("#chart", {
        height: 450,
        type: "line",
        colors: ['#eb5146'],
        data: {
            labels: YEARS,
            datasets: [{values: data}]
        },
        title: "Title here"
    })
};


makeChart();