// Component to find and display the nearest pub/bar and shop using the new Place API.
import React, { useState, useEffect } from 'react';
import { Wrapper, Status } from "@googlemaps/react-wrapper";

// A component to render a single item in the places list.
const PlaceListItem = ({ place, userLocation }) => {
    // --- CORRECTED DIRECTIONS URL ---
    // Creates a full directions link with a starting point (origin) and walking directions.
    const getDirectionsUrl = () => {
        if (!place || !place.displayName || !userLocation) return '#';
        const origin = `${userLocation.lat},${userLocation.lng}`;
        const destination = encodeURIComponent(`${place.displayName}, ${place.formattedAddress}`);
        return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
    };

    return (
        <div className="flex flex-col sm:flex-row justify-between items-center py-3 border-b border-beer-amber/20 last:border-b-0">
            <div className="flex-grow pr-4 text-center sm:text-left mb-2 sm:mb-0">
                <p className="font-bold text-white truncate">{place.displayName}</p>
                <p className="text-sm text-beer-foam/70 truncate">{place.formattedAddress}</p>
            </div>
            <div className="flex-shrink-0 text-center">
                <p className="font-bold text-white mb-2">{place.distance} km</p>
                <a
                    href={getDirectionsUrl()}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block bg-beer-amber text-beer-dark font-bold py-1 px-3 text-sm rounded-lg hover:bg-beer-gold transition-colors"
                >
                    Directions
                </a>
            </div>
        </div>
    );
};

// A component to display a list of places (e.g., top 3 pubs).
const PlacesList = ({ title, places, userLocation, error, status }) => (
    <div className="border-2 border-beer-amber/50 rounded-lg p-4 h-full">
        <h3 className="text-lg uppercase text-beer-amber tracking-widest mb-2 text-center">{title}</h3>
        {status === 'loading' && <p className="text-center text-beer-foam/80">Searching...</p>}
        {error && <p className="text-center text-red-400">{error}</p>}
        {status === 'success' && places.length > 0 && (
            <div className="space-y-2">
                {places.map((place) => (
                    <PlaceListItem key={place.id} place={place} userLocation={userLocation} />
                ))}
            </div>
        )}
        {status === 'success' && places.length === 0 && <p className="text-center text-beer-foam/80">No nearby places found.</p>}
    </div>
);


// This is the core component that handles all the logic. It will be rendered by the Wrapper.
const PlacesFinder = () => {
    const [status, setStatus] = useState('loading');
    const [userLocation, setUserLocation] = useState(null);
    const [top3Pubs, setTop3Pubs] = useState([]);
    const [top3Shops, setTop3Shops] = useState([]);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('error');
            setError('Geolocation is not supported by your browser.');
            return;
        }

        const geoOptions = { enableHighAccuracy: false, timeout: 10000, maximumAge: 0 };

        navigator.geolocation.getCurrentPosition(
            (position) => setUserLocation({ lat: position.coords.latitude, lng: position.coords.longitude }),
            () => {
                setStatus('error');
                setError('Location access denied or timed out. Please check browser settings.');
            },
            geoOptions
        );
    }, []);

    useEffect(() => {
        if (!userLocation || !window.google || !window.google.maps || !window.google.maps.places) return;

        const findPlaces = async () => {
            const placeFields = ['id', 'displayName', 'location', 'formattedAddress'];

            const createRequest = (types) => ({
                includedTypes: types,
                locationRestriction: { center: userLocation, radius: 50000 },
                rankPreference: 'DISTANCE',
                maxResultCount: 3,
                fields: placeFields,
            });

            const calculateDistance = (placeInstance) => {
                if (!placeInstance || !placeInstance.location) return 'N/A';
                return (
                    google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(userLocation.lat, userLocation.lng),
                        placeInstance.location
                    ) / 1000
                ).toFixed(1);
            };

            try {
                const [pubResponse, shopResponse] = await Promise.all([
                    google.maps.places.Place.searchNearby(createRequest(['bar', 'pub'])),
                    google.maps.places.Place.searchNearby(createRequest(['liquor_store', 'supermarket', 'convenience_store']))
                ]);
                
                if (pubResponse.places && pubResponse.places.length > 0) {
                    const pubsWithDistance = pubResponse.places.map(place => ({
                        ...place.toJSON(),
                        distance: calculateDistance(place)
                    }));
                    setTop3Pubs(pubsWithDistance);
                }

                if (shopResponse.places && shopResponse.places.length > 0) {
                    const shopsWithDistance = shopResponse.places.map(place => ({
                        ...place.toJSON(),
                        distance: calculateDistance(place)
                    }));
                    setTop3Shops(shopsWithDistance);
                }
                
                setStatus('success');
            } catch (e) {
                console.error("Google Maps API Error:", e);
                setError('Failed to search for places. Check API key and billing.');
                setStatus('error');
            }
        };

        findPlaces();
    }, [userLocation]);

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <PlacesList title="Nearest Pubs / Bars" places={top3Pubs} userLocation={userLocation} error={error} status={status} />
            <PlacesList title="Nearest Shops" places={top3Shops} userLocation={userLocation} error={error} status={status} />
        </div>
    );
};

// The main export component that wraps everything and handles the Google Maps script loading.
const NearestPlaces = () => {
    const render = (gmapsStatus) => {
        switch (gmapsStatus) {
            case Status.LOADING:
                return <p className="text-center text-beer-amber">Loading map services...</p>;
            case Status.FAILURE:
                return <p className="text-center text-red-400">Failed to load map services.</p>;
            case Status.SUCCESS:
                return <PlacesFinder />;
            default:
                return <p className="text-center text-beer-amber">Initializing...</p>;
        }
    };

    return (
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']} render={render} version="beta" />
    );
};

export default NearestPlaces;
