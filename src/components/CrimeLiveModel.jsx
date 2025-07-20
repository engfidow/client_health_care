import React, { useEffect, useState, useRef } from 'react';
import { GoogleMap, Marker, useJsApiLoader } from '@react-google-maps/api';
import io from 'socket.io-client';

const containerStyle = { width: '100%', height: '100%' };

const CrimeLiveModel = ({ report, onClose }) => {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: 'AIzaSyCi3WjC7uOUTETqWvXtCjgdv0X6O6twIOQ'
  });

  const initialCoords = report.location.split(',').map(Number);
  const [liveCoords, setLiveCoords] = useState(
    report.liveLocation ? report.liveLocation.split(',').map(Number) : initialCoords
  );

  const mapRef = useRef();
  const socketRef = useRef();

  useEffect(() => {
    if (report.type === 'personal') {
      socketRef.current = io('http://localhost:5000'); // Replace with backend URL

      socketRef.current.on('updateLocation', (data) => {
        console.log(data)
        if (data.reportId === report._id) {
          const newCoords = [data.latitude, data.longitude];
          setLiveCoords(newCoords);

          // Smooth pan to new position
          if (mapRef.current) {
            mapRef.current.panTo({
              lat: data.latitude,
              lng: data.longitude
            });
          }
        }
      });

      return () => {
        socketRef.current.disconnect();
      };
    }
  }, [report]);

  if (!isLoaded) return <div>Loading Map...</div>;

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-lg w-full max-w-3xl h-[500px] relative">
        <h3 className="text-lg font-bold text-violet-600 dark:text-violet-300 mb-2">Live Tracking Map</h3>

        <GoogleMap
          mapContainerStyle={containerStyle}
          center={{ lat: liveCoords[0], lng: liveCoords[1] }}
          zoom={16}
          onLoad={(map) => (mapRef.current = map)}
        >
          <Marker position={{ lat: initialCoords[0], lng: initialCoords[1] }} label="Start" />

          <Marker
            position={{ lat: liveCoords[0], lng: liveCoords[1] }}
            label="Live"
            icon={{
              url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
              scaledSize: new window.google.maps.Size(50, 50)
            }}
          />
        </GoogleMap>

        <button
          onClick={onClose}
          className="absolute top-2 right-2 px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
        >
          ✖ Close
        </button>
      </div>
    </div>
  );
};

export default CrimeLiveModel;