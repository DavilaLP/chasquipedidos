let map;
window.initMap = function () {


    const restaurant = { lat: -16.4050, lng: -71.5400 };

    const client = { lat: -16.4150, lng: -71.5300 };

    const rider = { lat: -16.4090, lng: -71.5375 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: rider
    });

    new google.maps.Marker({
        position: restaurant,
        map: map,
        title: "Restaurante"
    });

    const riderMarker = new google.maps.Marker({
        position: rider,
        map: map,
        title: "Motorizado"
    });

    new google.maps.Marker({
        position: client,
        map: map,
        title: "Cliente"
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true
    });

    directionsRenderer.setMap(map);

    directionsService.route(
        {
            origin: restaurant,
            destination: client,
            travelMode: google.maps.TravelMode.DRIVING
        },
        (result, status) => {
            if (status === "OK") {
                directionsRenderer.setDirections(result);
            }
        }
    );

    let step = 0;

    setInterval(() => {

        step += 0.001;

        const newPos = {
            lat: rider.lat + step,
            lng: rider.lng + step
        };

        riderMarker.setPosition(newPos);

    }, 2000);
};