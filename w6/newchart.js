const YEARS = [
    '2000', '2001', '2002', '2003', '2004', 
    '2005', '2006', '2007', '2008', '2009', 
    '2010', '2011', '2012', '2013', '2014', 
    '2015', '2016', '2017', '2018', '2019', 
    '2020', '2021'
];

async function fetchBirthDeathData(areaCode) {
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
                        values: [areaCode]
                    }
                },
                {
                    code: "Tiedot",
                    selection: {
                        filter: "item",
                        values: ["vm01", "vm11"]
                    }
                }
            ],
            response: {
                format: "json-stat2"
            }
        })
    });
    const data = await response.json();
    return {
        births: data.value.slice(0, YEARS.length),
        deaths: data.value.slice(YEARS.length)
    };
}

async function fetchMunicipalityCodes() {
    const response = await fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px");
    const data = await response.json();

    const municipalityCodes = {};
    data.variables[1].valueTexts.forEach((name, index) => {
        municipalityCodes[name.toLowerCase()] = data.variables[1].values[index];
    });
    return municipalityCodes;
};

async function makeChart() {
    const urlParams = new URLSearchParams(window.location.search);
    const areaCode = urlParams.get('municipalityCode');
    const {births, deaths} = await fetchBirthDeathData(areaCode);

    new frappe.Chart("#chart", {
        height: 450,
        type: "bar",
        colors: ['#63d0ff','#363636'],
        data: {
            labels: YEARS, // x_labels didn't work. Used this, since it ends up on the x-axis anyway.
            datasets: [
                {name: "Births", values: births}, {name: "Deaths", values: deaths}
            ]
        },
        title: "Births and deaths in " + areaCode
    });
}

makeChart();