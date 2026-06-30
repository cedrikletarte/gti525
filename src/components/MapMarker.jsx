import { useEffect, useRef } from 'react';
import { Marker, Popup } from 'react-leaflet';

export default function MapMarker({ obj, selected }) {
    const markerRef = useRef(null);

    useEffect(() => {
        if (selected && markerRef.current) {
            markerRef.current.openPopup();
        }
    }, [selected]);

    return (
        <Marker
            key={obj.ID}
            ref={markerRef}
            position={[obj.Latitude, obj.Longitude]}
        >
            <Popup>{obj.Nom}</Popup>
        </Marker>
    );
}