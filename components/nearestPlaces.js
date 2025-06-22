// Component to find and display the nearest pub/bar and shop.
import React, { useState, useEffect } from 'react';
import { Wrapper } from "@googlemaps/react-wrapper";

// Renders the details for a specific place type (pub or shop)
const PlaceCard = ({ title, place, error, status }) => {
    // Generates a Google Maps directions link
    const getDirectionsUrl = () => {
        if (!place || !place.geometry) return '#';
        const { lat, lng } = place.geometry.location;
        return `https://www.google.com/maps/dir/?api=1&destination=${lat()},${lng()}`;
    };

    return (
        <div className="border-2 border-beer-amber/50 rounded-lg p-4 text-center h-full flex flex-col justify-center">
            <h3 className="text-sm uppercase text-beer-amber/80 tracking-widest mb-2">{title}</h3>
            {status === 'loading' && <p className="text-beer-foam/80">Searching...</p>}
            {error && <p className="text-red-400">{error}</p>}
            {status === 'success' && place && (
                <div>
                    <p className="text-2xl font-bold text-white truncate">{place.name}</p>
                    <p className="text-lg text-beer-foam/80 mb-3">{place.distance} km away</p>
                    <a
                        href={getDirectionsUrl()}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block bg-beer-amber text-beer-dark font-bold py-2 px-4 rounded-lg hover:bg-beer-gold transition-colors duration-300"
                    >
                        Get Directions
                    </a>
                </div>
            )}
             {status === 'success' && !place && <p className="text-beer-foam/80">No nearby places found.</p>}
        </div>
    );
};


const NearestPlaces = () => {
    const [status, setStatus] = useState('idle'); // idle, loading, success, error
    const [userLocation, setUserLocation] = useState(null);
    const [nearestPub, setNearestPub] = useState(null);
    const [nearestShop, setNearestShop] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        setStatus('loading');
        if (!navigator.geolocation) {
            setStatus('error');
            setError('Geolocation is not supported by your browser.');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                setUserLocation({ lat: latitude, lng: longitude });
            },
            () => {
                setStatus('error');
                setError('Unable to retrieve your location. Please allow location access.');
            }
        );
    }, []);

    const findNearby = (maps, service) => {
        if (!userLocation) return;
        
        const searchRequest = (types, setter) => {
            const request = {
                location: userLocation,
                rankBy: google.maps.places.RankBy.DISTANCE,
                type: types,
            };

            service.nearbySearch(request, (results, searchStatus) => {
                if (searchStatus === google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
                    const place = results[0];
                    const distance = google.maps.geometry.spherical.computeDistanceBetween(
                        new google.maps.LatLng(userLocation.lat, userLocation.lng),
                        place.geometry.location
                    ) / 1000; // Convert to km
                    
                    setter({ ...place, distance: distance.toFixed(1) });
                } else {
                    setter(null);
                }
            });
        };
        
        // Perform searches for both types
        searchRequest(['bar', 'pub'], setNearestPub);
        searchRequest(['liquor_store', 'supermarket', 'convenience_store'], setNearestShop);
        setStatus('success');
    };
    
    // This effect runs once the userLocation is available
    useEffect(() => {
        if (userLocation && window.google) {
            const maps = window.google.maps;
            const service = new maps.places.PlacesService(document.createElement('div'));
            findNearby(maps, service);
        }
    }, [userLocation, window.google]);


    if (status === 'error') {
         return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlaceCard title="Nearest Pub / Bar" error={error} />
                <PlaceCard title="Nearest Shop" error={error} />
            </div>
         )
    }

    return (
        <Wrapper apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY} libraries={['places', 'geometry']}>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <PlaceCard title="Nearest Pub / Bar" place={nearestPub} status={status} />
                <PlaceCard title="Nearest Shop" place={nearestShop} status={status} />
            </div>
        </Wrapper>
    );
};

export default NearestPlaces;

