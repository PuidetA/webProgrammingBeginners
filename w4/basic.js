document.getElementById('submit-data').addEventListener('click', async function() {
    const text = document.getElementById('input-show').value;
    const getData = await fetch('https://api.tvmaze.com/search/shows?q=' + text);
    const data = await getData.json();

    


    // Source: https://www.w3schools.com/jsref/met_document_queryselector.asp
    const container = document.querySelector(".show-container");

    container.innerHTML = '';
    
    data.forEach(result => {
        const showData = document.createElement('div');
        showData.classList.add('show-data');
        // used https://jsonviewer.stack.hu/ to understand the structure of the json
        // Whoever said JSONs are extremely easy to read is a liar.
        const showImg = result.show.image ? result.show.image.medium : '';
        const showTitle = result.show.name;
        const showSummary = result.show.summary;
        
        showData.innerHTML = `
            <img src="${showImg}"> 
            <div class="show-info"> 
                <h1>${showTitle}</h1> 
                <p>${showSummary}</p> 
            </div> 
             `
        container.appendChild(showData);
    });
    
    document.getElementById('input-show').value = '';
})