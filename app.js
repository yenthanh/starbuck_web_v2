const mapStyle = [
    {
        "featureType": "landscape",
        "stylers": [
            {
                "hue": "#FFBB00"
            },
            {
                "saturation": 43.400000000000006
            },
            {
                "lightness": 37.599999999999994
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.highway",
        "stylers": [
            {
                "hue": "#FFC200"
            },
            {
                "saturation": -61.8
            },
            {
                "lightness": 45.599999999999994
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.arterial",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 51.19999999999999
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "road.local",
        "stylers": [
            {
                "hue": "#FF0300"
            },
            {
                "saturation": -100
            },
            {
                "lightness": 52
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "water",
        "stylers": [
            {
                "hue": "#0078FF"
            },
            {
                "saturation": -13.200000000000003
            },
            {
                "lightness": 2.4000000000000057
            },
            {
                "gamma": 1
            }
        ]
    },
    {
        "featureType": "poi",
        "stylers": [
            {
                "hue": "#00FF6A"
            },
            {
                "saturation": -1.0989010989011234
            },
            {
                "lightness": 11.200000000000017
            },
            {
                "gamma": 1
            }
        ]
    }
  ];
  
  // Escapes HTML characters in a template literal string, to prevent XSS.
  // See https://www.owasp.org/index.php/XSS_%28Cross_Site_Scripting%29_Prevention_Cheat_Sheet#RULE_.231_-_HTML_Escape_Before_Inserting_Untrusted_Data_into_HTML_Element_Content
  function sanitizeHTML(strings) {
    const entities = {'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;'};
    let result = strings[0];
    for (let i = 1; i < arguments.length; i++) {
      result += String(arguments[i]).replace(/[&<>'"]/g, (char) => {
        return entities[char];
      });
      result += strings[i];
    }
    return result;
  }
  
  /**
   * Initialize the Google Map.
   */
  
  function initMap() {
    // Create the map.
    const map = new google.maps.Map(document.getElementById('map'), {
      zoom: 7,
      center: {lat: 52.632469, lng: -1.689423},
      styles: mapStyle,
    });
  
    const input = document.getElementById("pac-input");
    const searchBox = new google.maps.places.SearchBox(input);
    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
      searchBox.setBounds(map.getBounds());
    });
    let markers = [];
    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
      const places = searchBox.getPlaces();

      if (places.length == 0) {
        return;
      }
      // Clear out the old markers.
      markers.forEach((marker) => {
        marker.setMap(null);
      });
      markers = [];
      // For each place, get the icon, name and location.
      const bounds = new google.maps.LatLngBounds();
      places.forEach((place) => {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }

        // Create a marker for each place.
        markers.push(
          new google.maps.Marker({
            map,
            title: place.name,
            position: place.geometry.location,
          })
        );

        if (place.geometry.viewport) {
          // Only geocodes have viewport.
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      map.fitBounds(bounds);
    });

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      console.log("Geolocation is not supported by this browser.");
    }
  
    function showPosition(position) {
      const navigatorpos = {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      };
      map.setCenter(navigatorpos);
      map.setZoom(12);
    }
      
  
  
  
  
    // Load the stores GeoJSON onto the map.
    map.data.loadGeoJson('stores.json', {idPropertyName: 'storeid'});
  
    // Define the custom marker icons, using the store's "category".
    map.data.setStyle((feature) => {
      return {
        icon: {
          url: `store.png`,
          scaledSize: new google.maps.Size(40, 40),
        },
      };
    });
  
    const apiKey = 'AIzaSyDdnX69tdR-uAK5gYWO4204dYoAuCtaKic';
    const infoWindow = new google.maps.InfoWindow();
  
    // Show the information for a store when its marker is clicked.
    map.data.addListener('click', (event) => {
      const name = event.feature.getProperty('name');
      const description = event.feature.getProperty('description');
      const hours = event.feature.getProperty('hours');
      const phone = event.feature.getProperty('phone');
      const position = event.feature.getGeometry().get();
      const content = sanitizeHTML`
        <img style="float:left; width:200px; margin-top:30px" src="store.png">
        <div style="margin-left:220px; margin-bottom:20px;">
          <h2>${name}</h2><p>${description}</p>
          <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
          <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
        </div>
        `;
  
      infoWindow.setContent(content);
      infoWindow.setPosition(position);
      infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
      infoWindow.open(map);
    });
  
    // Build and add the search bar
    const card = document.getElementById('pac-card');
    const titleBar = document.createElement('div');
    const title = document.createElement('div');
    const container = document.createElement('div');
    const options = {
      types: [],
    };
    title.setAttribute('id', 'title');
    title.textContent = 'Find a store';
    titleBar.appendChild(title);
    container.setAttribute('id', 'pac-container');
    container.appendChild(input);
    card.appendChild(titleBar);
    card.appendChild(container);
  
    // Make the search bar into a Places Autocomplete search bar and select
    // which detail fields should be returned about the place that
    // the user selects from the suggestions.
    const autocomplete = new google.maps.places.Autocomplete(input, options);
  
    // Set the origin point when the user selects an address
    const originMarker = new google.maps.Marker({map: map});
    originMarker.setVisible(false);
    let originLocation = map.getCenter();
  
    autocomplete.addListener('place_changed', async () => {
      originMarker.setVisible(false);
      originLocation = map.getCenter();
      const place = autocomplete.getPlace();
  
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        return;
      }
  
      // Recenter the map to the selected address
      originLocation = place.geometry.location;
      map.setCenter(originLocation);
      map.setZoom(9);
  
      originMarker.setPosition(originLocation);
      originMarker.setVisible(true);
  
      // Use the selected address as the origin to calculate distances
      // to each of the store locations
      const rankedStores = await calculateDistances(map.data, originLocation);
      showStoresList(map.data, rankedStores);
  
      return;
    });
    function showStoresList(data, stores) {
      map.data.addListener('click', (event) => {
        const name = event.feature.getProperty('name');
        const description = event.feature.getProperty('description');
        const hours = event.feature.getProperty('hours');
        const phone = event.feature.getProperty('phone');
        const position = event.feature.getGeometry().get();
        const content = sanitizeHTML`
          <img style="float:left; width:200px; margin-top:30px" src="store.png">
          <div style="margin-left:220px; margin-bottom:20px;">
            <h2>${name}</h2><p>${description}</p>
            <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
            <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
          </div>
          `;
    
        infoWindow.setContent(content);
        infoWindow.setPosition(position);
        infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
        infoWindow.open(map);
        map.setCenter(position);
        map.setZoom(17);
      });
      const apiKey = 'AIzaSyDdnX69tdR-uAK5gYWO4204dYoAuCtaKic';
      const infoWindow = new google.maps.InfoWindow();
      if (stores.length == 0) {
        return "Nothing here";
      }
    
      let panel = document.getElementById('store-list');
      // If the panel already exists, use it. Else, create it and add to the page.
      if (document.getElementById('store-list')) {
        panel = document.getElementById('store-list');
      } else {
        panel = document.getElementById('store-list');
        panel.insertBefore(panel, panel.childNodes[0]);
      }
    
    
      // Clear the previous details
      while (panel.lastChild) {
        panel.removeChild(panel.lastChild);
      }
    
      stores.forEach((store) => {
        // Add store details with text formatting
        const name = document.createElement('p');
        name.classList.add('place');
        const currentStore = data.getFeatureById(store.storeid);
        const position = currentStore.getGeometry().get();
        name.textContent = currentStore.j.name;
        panel.appendChild(name);
        $(name).click(function(event){
          const title = currentStore.getProperty('name');
          const description = currentStore.getProperty('description');
          const hours = currentStore.getProperty('hours');
          const phone = currentStore.getProperty('phone');
          const content = sanitizeHTML`
          <img style="float:left; width:200px; margin-top:30px" src="store.png">
          <div style="margin-left:220px; margin-bottom:20px;">
            <h2>${title}</h2><p>${description}</p>
            <p><b>Open:</b> ${hours}<br/><b>Phone:</b> ${phone}</p>
            <p><img src="https://maps.googleapis.com/maps/api/streetview?size=350x120&location=${position.lat()},${position.lng()}&key=${apiKey}"></p>
          </div>
          `;
          infoWindow.setContent(content);
          infoWindow.setPosition(position);
          infoWindow.setOptions({pixelOffset: new google.maps.Size(0, -30)});
          infoWindow.open(map);
          map.setCenter(position);
          map.setZoom(17);
        });
        const hoursText = document.createElement('p');
        hoursText.classList.add('hoursText');
        hoursText.textContent = currentStore.getProperty('hours');
        panel.appendChild(hoursText);
        const phone = document.createElement('p');
        phone.classList.add('phone');
        phone.textContent = currentStore.getProperty('phone');
        hoursText.appendChild(phone);
        const image = document.createElement('img');
        image.classList.add('image');
        image.setAttribute("src", "https://maps.googleapis.com/maps/api/streetview?size=350x120&location="+ position.lat()+ "," + position.lng()+ "&key=" + apiKey);
        hoursText.appendChild(image);
        const moreInfo = document.createElement('img');
        moreInfo.classList.add('moreInfo');
        moreInfo.setAttribute("src", "dropdown.png");
        panel.appendChild(moreInfo);
        $(moreInfo).click(function(event){
          event.preventDefault();
          // create accordion variables
          var accordion = $(name);
          var accordionContent = accordion.next('.hoursText');
          // toggle accordion link open class
          $(moreInfo).toggleClass("down");
          if(moreInfo.classList.contains('down')){
            moreInfo.setAttribute("src", "dropup.png");
          }
          else{
            moreInfo.setAttribute("src", "dropdown.png");
          }
          // toggle accordion content
          accordionContent.slideToggle(250);
        });
      });
    
      // Open the panel
      panel.classList.add('open');
    
      return;
    }
  }
  
  /**
   * Use Distance Matrix API to calculate distance from origin to each store.
   * @param {google.maps.Data} data The geospatial data object layer for the map
   * @param {google.maps.LatLng} origin Geographical coordinates in latitude
   * and longitude
   * @return {Promise<object[]>} n Promise fulfilled by an array of objects with
   * a distanceText, distanceVal, and storeid property, sorted ascending
   * by distanceVal.
   */
  async function calculateDistances(data, origin) {
    const stores = [];
    const destinations = [];
  
    // Build parallel arrays for the store IDs and destinations
    data.forEach((store) => {
      const storeNum = store.getProperty('storeid');
      const storeLoc = store.getGeometry().get();
  
      stores.push(storeNum);
      destinations.push(storeLoc);
    });
  
    // Retrieve the distances of each store from the origin
    // The returned list will be in the same order as the destinations list
    const service = new google.maps.DistanceMatrixService();
    const getDistanceMatrix =
      (service, parameters) => new Promise((resolve, reject) => {
        service.getDistanceMatrix(parameters, (response, status) => {
          if (status != google.maps.DistanceMatrixStatus.OK) {
            reject(response);
          } else {
            const distances = [];
            const results = response.rows[0].elements;
            for (let j = 0; j < results.length; j++) {
              const element = results[j];
              const distanceText = element.distance.text;
              const distanceVal = element.distance.value;
              const distanceObject = {
                storeid: stores[j],
                distanceText: distanceText,
                distanceVal: distanceVal,
              };
              distances.push(distanceObject);
            }
  
            resolve(distances);
          }
        });
      });
  
    const distancesList = await getDistanceMatrix(service, {
      origins: [origin],
      destinations: destinations,
      travelMode: 'DRIVING',
      unitSystem: google.maps.UnitSystem.METRIC,
    });
  
    distancesList.sort((first, second) => {
      return first.distanceVal - second.distanceVal;
    });
    return distancesList;
  }
  
  /**
   * Build the content of the side panel from the sorted list of stores
   * and display it.
   * @param {google.maps.Data} data The geospatial data object layer for the map
   * @param {object[]} stores An array of objects with a distanceText,
   * distanceVal, and storeid property.
   */