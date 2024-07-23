async function fetchAndCreateMap() {
    // #### FETCHING DATA ####
    // fetch geojson data
    const fetchingGeo = await fetch('https://geo.stat.fi/geoserver/wfs?service=WFS&version=2.0.0&request=GetFeature&typeName=tilastointialueet:kunta4500k&outputFormat=json&srsName=EPSG:4326')
    const dataGeo = await fetchingGeo.json()
    //fetch statfin Positive
    const fetchingStatPositive = await fetch('https://statfin.stat.fi/PxWeb/sq/4bb2c735-1dc3-4c5e-bde7-2165df85e65f')
    const dataStatPositive = await fetchingStatPositive.json()
    //fetch statfin Negative
    const fetchingStatNegative = await fetch('https://statfin.stat.fi/PxWeb/sq/944493ca-ea4d-4fd9-a75c-4975192f7b6e')
    const dataStatNegative = await fetchingStatNegative.json()




    // #### ADDING FEATURES ####
    // this comes before making the map to initalize everything first

    // ### Exercise 4: adding advanced functionality to show positive and negative migration on the map via popups
    // SOURCE: https://leafletjs.com/reference.html#geojson-oneachfeature
    const positiveMigrationData = dataStatPositive.dataset.value;
    const negativeMigrationData = dataStatNegative.dataset.value;

    // Making ID, data maps
    const positiveMigrationMap = {};
    const negativeMigrationMap = {};

    //SOURCE: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/entries
    // A friend told me to put in the question marks to avoid errors in case the data is not there.
    // Tools used: https://jsonviewer.stack.hu/ to see the structure of the data more clearly
    Object.entries(dataStatPositive.dataset?.dimension?.Tuloalue?.category?.index || {}).forEach(([key, index]) => {
        positiveMigrationMap[key] = positiveMigrationData[index];
    });
    Object.entries(dataStatNegative.dataset?.dimension?.Lähtöalue?.category?.index || {}).forEach(([key, index]) => {
        negativeMigrationMap[key] = negativeMigrationData[index];
    });


    // ### Exercise 2: adding tooltips
    // Add tooltip with municipality names via leaflet
    const addTooltip = (feature, layer) => {
        layer.bindTooltip(feature.properties.nimi);
    };
    const addPopup = (feature, layer) => {
        const areaCode = "KU" + feature.properties.kunta;
        const positiveMigration = positiveMigrationMap[areaCode] || 'N/A';
        const negativeMigration = negativeMigrationMap[areaCode] || 'N/A';
        layer.bindPopup(`
            Positive migration: ${positiveMigration}<br>
            Negative migration: ${negativeMigration}
        `);
    };




    // #### CREATING MAP ####
    let map = L.map('map', {
        minZoom: -3
    })

    let geoJsonL = L.geoJSON(dataGeo, {
        weight: 2,
        onEachFeature: addTooltip,
        onEachFeature: addPopup
    }).addTo(map)

    map.fitBounds(geoJsonL.getBounds())

    // ### Exercise 3: adding background map via OpenStreetMap
    let osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: "© OpenStreetMap"
    }).addTo(map)
}


fetchAndCreateMap()
