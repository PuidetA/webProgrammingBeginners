async function fetchAndCreateMap() {
    // #### FETCHING DATA ####
    // fetch geojson data
    const fetchingGeo = await fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326')
    const dataGeo = await fetching.json()
    //fetch statfin
    //const fetchingStatPositive = await fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f')
    //const dataStatPositive = await fetchingStatPositive.json()
    //fetch statfin
    //const fetchingStatNegative = await fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e')
    //const dataStatNegative = await fetchingStatNegative.json()


    // #### CREATING MAP ####
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJsonL = L.geoJSON(dataGeo, {
        weight: 2
    }).addTo(map)

    map.fitBounds(geoJsonL.getBounds())


}


fetchAndCreateMap()