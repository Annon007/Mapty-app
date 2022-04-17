'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

class Workout {
    data = new Date();
    id = (Date.now() + "").slice(-10);
    constructor(coords, distance, duration) {
        this.coords = coords;
        this.distance = distance;
        this.duration = duration;
    }
}
class Running extends Workout {
    constructor(coords, distance, duration, candence) {
        super(coords, distance, duration);
        this.candence = candence;
        this.calcPace()
    }

    calcPace() {
        this.pace = this.duration / this.distance;

    }

}
class Cycling extends Workout {
    constructor(coords, distance, duration, elevationGain) {
        super(coords, distance, duration);
        this.elevationGain = elevationGain;
        this.calcSpeed()
    }

    calcSpeed() {
        this.speed = this.distance / (this.duration / 60);
    }
}
// const run1 = new Running([39, -12], 5.2, 24, 178);
// const cycling1 = new Cycling([39, -12], 27, 95, 178);

// console.log(run1, cycling1)
///////////////////////////////
class App {
    #mapEvent;
    #map;
    #workouts = [];
    constructor() {
        this._getPosition();
        form.addEventListener("submit", this._newWorkout.bind(this));
        inputType.addEventListener("change", this._toggleElevationField)
    }

    _getPosition() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(this._loadMap.bind(this), function () {
                console.log("Could Not Get Your Location")
            })
        }

    }

    _loadMap(position) {
        const { longitude } = position.coords;
        const { latitude } = position.coords;
        // console.log(longitude, latitude)
        // console.log(`https://www.google.com/maps/@${longitude},${latitude}`)
        const cords = [latitude, longitude]
        this.#map = L.map('map').setView(cords, 13);
        console.log(this.#map)
        L.tileLayer('https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(this.#map);

        this.#map.on("click", this._showForm.bind(this))
    }

    _showForm(mapE) {

        this.#mapEvent = mapE;
        // console.log(this.#mapEvent)
        form.classList.remove("hidden");
        inputDistance.focus()
    }

    _toggleElevationField() {
        inputElevation.closest(".form__row").classList.toggle("form__row--hidden")
        inputCadence.closest(".form__row").classList.toggle("form__row--hidden")
    }

    _newWorkout(e) {
        e.preventDefault();
        const validInputs = (...inputs) => inputs.every(inp => Number.isFinite(inp));
        const allPositive = (...inputs) => inputs.every(inp => inp > 0);
        const type = inputType.value;
        const distance = +inputDistance.value;
        const duration = +inputDuration.value;
        const { lat, lng } = this.#mapEvent.latlng
        let workout;
        if (type === 'running') {
            const cadence = +inputCadence.value;

            // Check if data is valid
            if (!validInputs(distance, duration, cadence) || !allPositive(distance, duration, cadence)) {
                return alert('Inputs have to be positive numbers!');
            }

            workout = new Running([lat, lng], distance, duration, cadence);

        }

        // If workout cycling, create cycling object
        if (type === 'cycling') {
            const elevation = +inputElevation.value;

            if (
                !validInputs(distance, duration, elevation) ||
                !allPositive(distance, duration)
            )
                return alert('Inputs have to be positive numbers!');

            workout = new Cycling([lat, lng], distance, duration, elevation);
        }
        this.#workouts.push(workout)

        L.marker([lat, lng]).addTo(this.#map)
            .bindPopup(L.popup({
                maxHeight: 250,
                maxWidth: 100,
                autoClose: false,
                className: `${type}-popup`,
                closeOnClick: false
            }))
            .setPopupContent(`Workout ${workout.distance} `)
            .openPopup();

        form.reset();
        form.classList.add("hidden");
    }
}

const app = new App();

