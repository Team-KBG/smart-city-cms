import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import L from "leaflet";
import { useEffect } from "react";

const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const emergencyIcon = L.icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

function FitBounds({ complaints }) {
  const map = useMap();

  useEffect(() => {
    if (complaints.length > 0) {
      const bounds = complaints.map((c) => [
        c.location.coordinates[1],
        c.location.coordinates[0],
      ]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [complaints, map]);

  return null;
}

export default function HeatMapView({ complaints }) {
  const defaultCenter = [28.6139, 77.209];

  const validComplaints = complaints.filter(
    (c) => c.location?.coordinates?.length === 2
  );

  const center =
    validComplaints.length > 0
      ? [
          validComplaints[0].location.coordinates[1],
          validComplaints[0].location.coordinates[0],
        ]
      : defaultCenter;

  return (
    <div className="h-[500px] overflow-hidden rounded-2xl border border-slate-200">
      <MapContainer center={center} zoom={12} style={{ height: "100%", width: "100%" }}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <FitBounds complaints={validComplaints} />
        <MarkerClusterGroup chunkedLoading>
          {validComplaints.map((complaint) => (
            <Marker
              key={complaint._id}
              position={[
                complaint.location.coordinates[1],
                complaint.location.coordinates[0],
              ]}
              icon={complaint.isEmergency ? emergencyIcon : defaultIcon}
            >
              <Popup>
                <div className="text-sm">
                  <p className="font-bold">{complaint.title}</p>
                  <p>{complaint.complaintId}</p>
                  <p>Category: {complaint.category}</p>
                  <p>Status: {complaint.status}</p>
                  <p>Supports: {complaint.supportCount}</p>
                  {complaint.isEmergency && (
                    <span className="font-bold text-red-600">EMERGENCY</span>
                  )}
                </div>
              </Popup>
            </Marker>
          ))}
        </MarkerClusterGroup>
      </MapContainer>
    </div>
  );
}
