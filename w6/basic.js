


//source used: https://www.freecodecamp.org/news/javascript-post-request-how-to-send-an-http-post-request-in-js/
fetch("https://statfin.stat.fi/PxWeb/api/v1/en/StatFin/synt/statfin_synt_pxt_12dy.px", {
    method: "POST",
    body: JSON.stringify(
        {
        "query": [
            {
                "code": "Vuosi",
                "selection":{
                    "filter":"item",
                    "values":[
                        "2000",
                        "2001",
                        "2002",
                        "2003",
                        "2004",
                        "2005",
                        "2006",
                        "2007",
                        "2008",
                        "2009",
                        "2010",
                        "2011",
                        "2012",
                        "2013",
                        "2014",
                        "2015",
                        "2016",
                        "2017",
                        "2018",
                        "2019",
                        "2020",
                        "2021"
                    ]
                }
        },
        {
            "code": "Alue",
            "selection":{
                "filter":"item",
            "values":[
                "SSS"
            ]
        }
    },
    {
        "code": "Tiedot",
        "selection": {
            "filter": "item",
            "values": [
                "vaesto"
            ]
        }}
    ],
    "response": {
        "format": "json-stat2"
    }
}
)
}
);





