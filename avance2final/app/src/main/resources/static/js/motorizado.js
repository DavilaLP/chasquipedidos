let map;

window.initMap = function () {

    const center = { lat: -16.4090, lng: -71.5375 };

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 14,
        center: center
    });

    new google.maps.Marker({
        position: center,
        map: map,
        title: "Motorizado"
    });

    const restaurant = { lat: -16.4050, lng: -71.5400 };

    new google.maps.Marker({
        position: restaurant,
        map: map,
        title: "Restaurante"
    });

    const client = { lat: -16.4150, lng: -71.5300 };

    new google.maps.Marker({
        position: client,
        map: map,
        title: "Cliente"
    });

    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer();

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
};

function setStatus(status) {

    const el = document.querySelector(".status");

    el.classList.remove("online", "busy", "offline");

    if (status === "online") {
        el.classList.add("online");
        el.innerText = "Disponible";
    }

    if (status === "busy") {
        el.classList.add("busy");
        el.innerText = "Ocupado";
    }

    if (status === "offline") {
        el.classList.add("offline");
        el.innerText = "Desconectado";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    console.log("Motorizado panel cargado ✔");
});