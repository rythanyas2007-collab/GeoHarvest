import React, { useEffect, useRef, useState } from 'react';
import * as maplibregl from 'maplibre-gl';
import { Watershed, Intervention } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  buildWatershedGeoJson,
  buildInterventionsGeoJson,
  DRAINAGE_STREAMS_GEOJSON,
  validatePointInWatershed
} from '../../utils/gisData';
import { getWatersheds, getInterventions } from '../../utils/apiClient';
import {
  Layers,
  MapPin,
  Eye,
  EyeOff,
  Crosshair,
  Info,
  Maximize2,
  ZoomIn,
  ZoomOut,
  Droplets,
  Building,
  Ruler,
  ChevronRight,
  RefreshCw,
  Sliders,
  Compass
} from 'lucide-react';

interface GisExplorerProps {
  onSelectIntervention?: (interventionId: string) => void;
  onSelectWatershed?: (watershedId: string) => void;
}

const BASEMAPS = [
  {
    id: 'positron',
    name: 'Carto Positron (Light)',
    styleUrl: 'https://basemaps.cartocdn.com/gl/positron-gl-style/style.json'
  },
  {
    id: 'voyager',
    name: 'Carto Voyager (Terrain)',
    styleUrl: 'https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json'
  },
  {
    id: 'dark',
    name: 'Carto Dark Matter',
    styleUrl: 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json'
  }
];

export const GisExplorer: React.FC<GisExplorerProps> = ({
  onSelectIntervention,
  onSelectWatershed
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);

  const [watersheds, setWatersheds] = useState<Watershed[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [selectedItem, setSelectedItem] = useState<{
    type: 'watershed' | 'intervention';
    data: any;
  } | null>(null);

  // Layer toggles
  const [layersVisible, setLayersVisible] = useState({
    boundaries: true,
    streams: true,
    structures: true,
    siltHeat: false
  });

  const [activeBasemap, setActiveBasemap] = useState<string>('positron');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [inspectorOpen, setInspectorOpen] = useState<boolean>(true);
  const [mapLoaded, setMapLoaded] = useState<boolean>(false);

  // Load backend data
  useEffect(() => {
    Promise.all([
      getWatersheds(),
      getInterventions()
    ])
      .then(([wsList, intList]) => {
        setWatersheds(wsList);
        setInterventions(intList);
      })
      .catch(err => console.warn('GIS layer data load warning:', err));
  }, []);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current) return;

    // Fallback vector style if remote style is blocked
    const fallbackStyle: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'osm-tiles': {
          type: 'raster',
          tiles: [
            'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            'https://b.tile.openstreetmap.org/{z}/{x}/{y}.png'
          ],
          tileSize: 256,
          attribution: '&copy; OpenStreetMap Contributors'
        }
      },
      layers: [
        {
          id: 'osm-tiles-layer',
          type: 'raster',
          source: 'osm-tiles',
          minzoom: 0,
          maxzoom: 19
        }
      ]
    };

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: BASEMAPS.find(b => b.id === activeBasemap)?.styleUrl || fallbackStyle,
      center: [78.92, 12.315], // Chengam / Tiruvannamalai
      zoom: 11.8,
      attributionControl: false
    });

    map.addControl(new maplibregl.AttributionControl({ compact: true }), 'bottom-right');
    map.addControl(new maplibregl.NavigationControl({ showCompass: true }), 'top-right');
    map.addControl(new maplibregl.ScaleControl({ unit: 'metric' }), 'bottom-left');

    map.on('load', () => {
      setMapLoaded(true);
      renderLayers(map);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, [activeBasemap]);

  // Render vector layers when data or map loads
  const renderLayers = (map: maplibregl.Map) => {
    if (!map || !map.isStyleLoaded()) return;

    const wsGeoJson = buildWatershedGeoJson(watersheds);
    const intGeoJson = buildInterventionsGeoJson(interventions);

    // 1. Add Watershed Boundaries
    if (!map.getSource('watersheds-source')) {
      map.addSource('watersheds-source', {
        type: 'geojson',
        data: wsGeoJson as any
      });

      map.addLayer({
        id: 'watersheds-fill',
        type: 'fill',
        source: 'watersheds-source',
        paint: {
          'fill-color': [
            'match',
            ['get', 'healthCategory'],
            'Healthy',
            '#147D9A',
            'Needs Attention',
            '#D0641A',
            '#2563A6'
          ],
          'fill-opacity': 0.15
        }
      });

      map.addLayer({
        id: 'watersheds-line',
        type: 'line',
        source: 'watersheds-source',
        paint: {
          'line-color': '#163A63',
          'line-width': 2.5,
          'line-dasharray': [2, 1]
        }
      });

      // Click on watershed
      map.on('click', 'watersheds-fill', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        setSelectedItem({
          type: 'watershed',
          data: props
        });
        setInspectorOpen(true);
      });

      map.on('mouseenter', 'watersheds-fill', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'watersheds-fill', () => {
        map.getCanvas().style.cursor = '';
      });
    } else {
      (map.getSource('watersheds-source') as maplibregl.GeoJSONSource).setData(wsGeoJson as any);
    }

    // 2. Add Drainage Streams
    if (!map.getSource('streams-source')) {
      map.addSource('streams-source', {
        type: 'geojson',
        data: DRAINAGE_STREAMS_GEOJSON as any
      });

      map.addLayer({
        id: 'streams-line',
        type: 'line',
        source: 'streams-source',
        paint: {
          'line-color': '#1E6091',
          'line-width': [
            'match',
            ['get', 'order'],
            3,
            3.5,
            2,
            2.2,
            1.5
          ],
          'line-opacity': 0.85
        }
      });
    }

    // 3. Add Interventions
    if (!map.getSource('interventions-source')) {
      map.addSource('interventions-source', {
        type: 'geojson',
        data: intGeoJson as any
      });

      map.addLayer({
        id: 'interventions-glow',
        type: 'circle',
        source: 'interventions-source',
        paint: {
          'circle-radius': 11,
          'circle-color': '#FFFFFF',
          'circle-opacity': 0.9
        }
      });

      map.addLayer({
        id: 'interventions-circle',
        type: 'circle',
        source: 'interventions-source',
        paint: {
          'circle-radius': 7.5,
          'circle-color': [
            'match',
            ['get', 'status'],
            'operational',
            '#248A52',
            'needs_maintenance',
            '#D0641A',
            'critical_damage',
            '#BC3A3A',
            '#2563A6'
          ],
          'circle-stroke-width': 2,
          'circle-stroke-color': '#FFFFFF'
        }
      });

      // Click on intervention
      map.on('click', 'interventions-circle', (e) => {
        if (!e.features || e.features.length === 0) return;
        const props = e.features[0].properties;
        setSelectedItem({
          type: 'intervention',
          data: props
        });
        setInspectorOpen(true);
      });

      map.on('mouseenter', 'interventions-circle', () => {
        map.getCanvas().style.cursor = 'pointer';
      });
      map.on('mouseleave', 'interventions-circle', () => {
        map.getCanvas().style.cursor = '';
      });
    } else {
      (map.getSource('interventions-source') as maplibregl.GeoJSONSource).setData(intGeoJson as any);
    }
  };

  // Update layer visibility
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded) return;

    if (map.getLayer('watersheds-fill')) {
      map.setLayoutProperty('watersheds-fill', 'visibility', layersVisible.boundaries ? 'visible' : 'none');
      map.setLayoutProperty('watersheds-line', 'visibility', layersVisible.boundaries ? 'visible' : 'none');
    }
    if (map.getLayer('streams-line')) {
      map.setLayoutProperty('streams-line', 'visibility', layersVisible.streams ? 'visible' : 'none');
    }
    if (map.getLayer('interventions-circle')) {
      map.setLayoutProperty('interventions-circle', 'visibility', layersVisible.structures ? 'visible' : 'none');
      map.setLayoutProperty('interventions-glow', 'visibility', layersVisible.structures ? 'visible' : 'none');
    }
  }, [layersVisible, mapLoaded]);

  // Re-render layers when data updates
  useEffect(() => {
    if (mapInstance.current && mapLoaded) {
      renderLayers(mapInstance.current);
    }
  }, [watersheds, interventions, mapLoaded]);

  // Filter interventions
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded || !map.getLayer('interventions-circle')) return;

    if (filterType === 'ALL') {
      map.setFilter('interventions-circle', null);
      map.setFilter('interventions-glow', null);
    } else {
      map.setFilter('interventions-circle', ['==', ['get', 'type'], filterType]);
      map.setFilter('interventions-glow', ['==', ['get', 'type'], filterType]);
    }
  }, [filterType, mapLoaded]);

  const zoomToWatershed = (ws: Watershed) => {
    if (!mapInstance.current) return;
    mapInstance.current.flyTo({
      center: [ws.coordinates[1], ws.coordinates[0]],
      zoom: 12.8,
      essential: true
    });
    setSelectedItem({
      type: 'watershed',
      data: ws
    });
  };

  return (
    <div className="space-y-3">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#D9E0E7] pb-3">
        <div>
          <h1 className="text-xl font-bold text-[#163A63] tracking-tight flex items-center gap-2">
            <Compass className="w-5 h-5 text-[#147D9A]" />
            Interactive Spatial GIS Explorer
          </h1>
          <p className="text-xs text-[#5B6573]">
            Vector layers, Strahler drainage networks, geofenced boundaries, and operational asset inventory.
          </p>
        </div>

        {/* Quick Zoom Actions */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[11px] font-semibold text-[#5B6573]">Focus:</span>
          {watersheds.map((ws) => (
            <button
              key={ws.id}
              type="button"
              onClick={() => zoomToWatershed(ws)}
              className="px-2.5 py-1 rounded-md bg-white border border-[#D9E0E7] hover:border-[#163A63] text-xs font-semibold text-[#163A63] shadow-xs flex items-center gap-1 transition-colors"
            >
              <Crosshair className="w-3 h-3 text-[#147D9A]" />
              {ws.name.split(' ')[0]} ({ws.code})
            </button>
          ))}
        </div>
      </div>

      {/* Main Map Canvas and Inspector Container */}
      <div className="relative h-[650px] w-full rounded-lg border border-[#D9E0E7] overflow-hidden bg-[#E5E9EE] shadow-sm flex">
        {/* MapLibre DOM Node */}
        <div ref={mapContainer} className="h-full w-full relative z-0" />

        {/* Floating Layer Controls Panel (Top Left) */}
        <div className="absolute top-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#D9E0E7] rounded-lg p-3 shadow-md w-64 space-y-3">
          <div className="flex items-center justify-between border-b border-[#D9E0E7] pb-1.5">
            <span className="text-xs font-bold text-[#163A63] uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5" /> Map Layers
            </span>
            <span className="text-[10px] text-[#5B6573]">GIS Live</span>
          </div>

          <div className="space-y-1.5 text-xs">
            <label className="flex items-center justify-between cursor-pointer hover:bg-[#F5F7F9] p-1 rounded">
              <span className="flex items-center gap-2 text-[#1F2937]">
                <span className="w-3 h-3 rounded-sm border border-[#163A63] bg-[#147D9A]/30" />
                Watershed Bounds
              </span>
              <input
                type="checkbox"
                checked={layersVisible.boundaries}
                onChange={(e) => setLayersVisible({ ...layersVisible, boundaries: e.target.checked })}
                className="rounded text-[#163A63]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-[#F5F7F9] p-1 rounded">
              <span className="flex items-center gap-2 text-[#1F2937]">
                <span className="w-3 h-0.5 bg-[#1E6091]" />
                Drainage Streams (Orders 1-3)
              </span>
              <input
                type="checkbox"
                checked={layersVisible.streams}
                onChange={(e) => setLayersVisible({ ...layersVisible, streams: e.target.checked })}
                className="rounded text-[#163A63]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer hover:bg-[#F5F7F9] p-1 rounded">
              <span className="flex items-center gap-2 text-[#1F2937]">
                <span className="w-3 h-3 rounded-full bg-[#248A52] border border-white" />
                Existing Structures
              </span>
              <input
                type="checkbox"
                checked={layersVisible.structures}
                onChange={(e) => setLayersVisible({ ...layersVisible, structures: e.target.checked })}
                className="rounded text-[#163A63]"
              />
            </label>
          </div>

          {/* Structure Type Filter */}
          <div className="pt-2 border-t border-[#D9E0E7]">
            <label className="block text-[11px] font-semibold text-[#5B6573] mb-1">
              Filter by Structure Type:
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full text-xs rounded border border-[#D9E0E7] px-2 py-1 bg-white text-[#1F2937]"
            >
              <option value="ALL">All Structures ({interventions.length})</option>
              <option value="check_dam">Check Dams</option>
              <option value="farm_pond">Farm Ponds</option>
              <option value="percolation_tank">Percolation Tanks</option>
              <option value="recharge_structure">Recharge Structures</option>
              <option value="plantation">Agro-Forestry Buffer</option>
              <option value="contour_trench">Contour Trenches</option>
            </select>
          </div>

          {/* Basemap Selection */}
          <div className="pt-2 border-t border-[#D9E0E7]">
            <label className="block text-[11px] font-semibold text-[#5B6573] mb-1">
              Base Map Style:
            </label>
            <select
              value={activeBasemap}
              onChange={(e) => setActiveBasemap(e.target.value)}
              className="w-full text-xs rounded border border-[#D9E0E7] px-2 py-1 bg-white text-[#1F2937]"
            >
              {BASEMAPS.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Floating Legend (Bottom Left) */}
        <div className="absolute bottom-3 left-3 z-10 bg-white/95 backdrop-blur-xs border border-[#D9E0E7] rounded-md p-2.5 shadow-md text-[11px] space-y-1">
          <div className="font-bold text-[#163A63] uppercase tracking-wider text-[10px]">
            Structure Condition
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#248A52]" /> Operational
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#D0641A]" /> Needs Maint.
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-[#BC3A3A]" /> Critical
            </span>
          </div>
        </div>

        {/* Collapsible Spatial Inspector Sidebar (Right Side) */}
        {inspectorOpen && (
          <div className="absolute top-0 right-0 bottom-0 z-20 w-80 sm:w-96 bg-white border-l border-[#D9E0E7] shadow-xl flex flex-col transition-all">
            {/* Inspector Header */}
            <div className="p-3 bg-[#163A63] text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-[#147D9A]" />
                <span className="text-xs font-bold uppercase tracking-wider">
                  Spatial Feature Inspector
                </span>
              </div>
              <button
                type="button"
                onClick={() => setInspectorOpen(false)}
                className="p-1 rounded text-white/70 hover:text-white"
              >
                ✕
              </button>
            </div>

            {/* Inspector Body */}
            <div className="p-4 flex-1 overflow-y-auto space-y-4 text-xs">
              {!selectedItem ? (
                <div className="text-center py-16 text-[#5B6573] space-y-2">
                  <Crosshair className="w-8 h-8 mx-auto text-[#147D9A]/50" />
                  <div className="font-semibold text-[#163A63]">No Feature Selected</div>
                  <p className="text-[11px] max-w-xs mx-auto">
                    Click any watershed polygon or structure node on the map to inspect engineering specifications, silt levels, and field evidence.
                  </p>
                </div>
              ) : selectedItem.type === 'intervention' ? (
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-mono text-xs font-bold text-[#163A63]">
                        {selectedItem.data.code}
                      </span>
                      <h3 className="text-sm font-bold text-[#1F2937] mt-0.5">
                        {selectedItem.data.name}
                      </h3>
                      <div className="text-[11px] text-[#5B6573]">
                        Village: <strong>{selectedItem.data.villageName}</strong> • {selectedItem.data.watershedName}
                      </div>
                    </div>
                    <StatusBadge status={selectedItem.data.status} size="sm" />
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D9E0E7]">
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Condition Score</div>
                      <div className="text-base font-bold text-[#163A63]">
                        {selectedItem.data.conditionScore}/100
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Silt Accumulation</div>
                      <div className={`text-base font-bold ${selectedItem.data.siltLevelPercentage > 50 ? 'text-[#BC3A3A]' : 'text-[#1F2937]'}`}>
                        {selectedItem.data.siltLevelPercentage}%
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Holding Capacity</div>
                      <div className="text-base font-bold text-[#147D9A] font-mono">
                        {selectedItem.data.capacityCubicMetres ? selectedItem.data.capacityCubicMetres.toLocaleString() : '-'} m³
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Beneficiary Ayacut</div>
                      <div className="text-base font-bold text-[#287A4B]">
                        {selectedItem.data.beneficiaryHouseholds || '-'} Farms
                      </div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded bg-[#EFF6FF] border border-[#BFDBFE] space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-wider text-[#2563A6]">
                      Approved Scheme Allocation
                    </div>
                    <div className="font-semibold text-xs text-[#163A63]">
                      ₹{(selectedItem.data.approvedCostInr / 100000).toFixed(2)} Lakhs (TAWDEVA RIDF)
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-[#D9E0E7] space-y-2">
                    <button
                      type="button"
                      onClick={() => onSelectIntervention && onSelectIntervention(selectedItem.data.id)}
                      className="w-full py-2 px-3 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                    >
                      <Building className="w-3.5 h-3.5" />
                      View Structure Details & Field History
                    </button>
                  </div>
                </div>
              ) : (
                /* Selected Watershed */
                <div className="space-y-3">
                  <div>
                    <span className="font-mono text-xs font-bold text-[#163A63]">
                      {selectedItem.data.code}
                    </span>
                    <h3 className="text-sm font-bold text-[#1F2937] mt-0.5">
                      {selectedItem.data.name}
                    </h3>
                    {selectedItem.data.tamilName && (
                      <div className="text-xs text-[#5B6573]">{selectedItem.data.tamilName}</div>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <StatusBadge status={selectedItem.data.healthCategory} size="sm" />
                    <span className="text-xs font-bold text-[#163A63]">
                      Health Score: {selectedItem.data.healthScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#D9E0E7]">
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Catchment Area</div>
                      <div className="font-bold text-[#1F2937] font-mono">
                        {selectedItem.data.areaHectares} Ha
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Drainage Order</div>
                      <div className="font-bold text-[#1F2937]">
                        Order {selectedItem.data.drainageOrder} River
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Conservation Potential</div>
                      <div className="font-bold text-[#147D9A] font-mono">
                        {selectedItem.data.waterPotential} L Lakhs
                      </div>
                    </div>
                    <div className="p-2 rounded bg-[#F5F7F9]">
                      <div className="text-[10px] text-[#5B6573]">Beneficiaries</div>
                      <div className="font-bold text-[#287A4B]">
                        {selectedItem.data.beneficiaries} Households
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onSelectWatershed && onSelectWatershed(selectedItem.data.id)}
                    className="w-full py-2 px-3 rounded bg-[#163A63] hover:bg-[#0F2845] text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                  >
                    <Droplets className="w-3.5 h-3.5" />
                    Inspect Watershed Report Card
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
