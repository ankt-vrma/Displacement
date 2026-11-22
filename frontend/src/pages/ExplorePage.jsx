import { MapContainer, TileLayer, ZoomControl } from "react-leaflet";
import "leaflet/dist/leaflet.css";

export default function ExplorePage() {
  return (
    <div>
      <p className="eyebrow">Explore</p>
      <h1 className="mt-3 text-5xl leading-[1.02] sm:text-7xl">The world, at a glance.</h1>

      <div className="explore-map mt-10 h-[68vh] min-h-[420px] overflow-hidden rounded-2xl border border-line shadow-[0_24px_60px_-35px_rgba(60,45,20,0.4)]">
        <MapContainer
          center={[22, 20]}
          zoom={2}
          minZoom={2}
          maxZoom={12}
          zoomControl={false}
          worldCopyJump
          maxBounds={[[-85, -360], [85, 360]]}
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          <ZoomControl position="bottomright" />
        </MapContainer>
      </div>
    </div>
  );
}