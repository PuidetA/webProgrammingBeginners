async function fetchAndCreateMap() {
    // #### FETCHING DATA ####
    // fetch geojson data
    const fetchingGeo = await fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326')
    const dataGeo = await fetchingGeo.json()
    //fetch statfin
    //const fetchingStatPositive = await fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f')
    //const dataStatPositive = await fetchingStatPositive.json()
    //fetch statfin
    //const fetchingStatNegative = await fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e')
    //const dataStatNegative = await fetchingStatNegative.json()

    // #### ADDING FEATURES ####
    // this comes before making the map to initalize everything first
    // Add tooltip with municipality names via leaflet
    // SOURCE: https://leafletjs.com/reference.html#geojson-oneachfeature
    const addTooltip = (feature, layer) => {
        layer.bindTooltip(feature.properties.nimi)
    };

    
    // #### CREATING MAP ####
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJsonL = L.geoJSON(dataGeo, {
        weight: 2,
        onEachFeature: addTooltip
    }).addTo(map)

    map.fitBounds(geoJsonL.getBounds())

    

}


fetchAndCreateMap()