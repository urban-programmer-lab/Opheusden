// ----- 1. Base map setup -----

// Initialize map with temporary view (will be adjusted when KMZ loads)
const map = L.map('map').setView([51.933, 5.633], 12);

// Base layer: OpenStreetMap
const osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Aerial imagery base layer (PDOK Luchtfoto)
const aerialBase = L.tileLayer.wms('https://service.pdok.nl/hwh/luchtfotorgb/wms/v1_0', {
    layers: '2023_orthoHR',
    format: 'image/png',
    transparent: false,
    version: '1.3.0',
    attribution: 'PDOK – Actuele Luchtfoto'
});

// BRT Achtergrondkaart (topographic map)
const topoBase = L.tileLayer('https://service.pdok.nl/brt/achtergrondkaart/wmts/v2_0/standaard/EPSG:3857/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: 'Kadaster / PDOK – BRT Achtergrondkaart'
});

// You can add more base layers later if needed
const baseLayers = {
    "OpenStreetMap": osmBase,
    "Aerial Photo (2023)": aerialBase,
    "Topographic Map": topoBase
};

// ----- 2. Custom Legend Definitions -----

const customLegends = {
    "flood_riskzone": {
        items: [
            { color: "#0066CC", label: "High flood risk area" },
            { color: "#3399FF", label: "Medium flood risk area" },
            { color: "#99CCFF", label: "Low flood risk area" }
        ]
    },
    "soil_bro_bodemkaart": {
        items: [
            { color: "#8B4513", label: "Clay soils" },
            { color: "#DEB887", label: "Sandy soils" },
            { color: "#F4A460", label: "Peat soils" },
            { color: "#D2691E", label: "Loamy soils" },
            { color: "#CD853F", label: "Mixed soils" }
        ]
    },
    "natura2000": {
        items: [
            { color: "#228B22", label: "Natura 2000 protected area" },
            { color: "#90EE90", label: "Buffer zone" }
        ]
    },
    "heritage_cultuurhistorie": {
        items: [
            { color: "#8B008B", label: "Protected monument" },
            { color: "#BA55D3", label: "Protected cityscape" },
            { color: "#DA70D6", label: "Archaeological site" }
        ]
    },
    "roads_top10nl": {
        items: [
            { color: "#FF0000", label: "Highway" },
            { color: "#FFA500", label: "Main road" },
            { color: "#FFD700", label: "Regional road" },
            { color: "#FFFF00", label: "Local road" }
        ]
    },
    "railways": {
        items: [
            { color: "#000000", label: "Railway line" },
            { color: "#666666", label: "Tram line" }
        ]
    },
    "bbg_landuse": {
        items: [
            { color: "#FF0000", label: "Residential area" },
            { color: "#800080", label: "Industrial/commercial" },
            { color: "#00FF00", label: "Agriculture" },
            { color: "#006400", label: "Forest" },
            { color: "#0000FF", label: "Water" },
            { color: "#FFFF00", label: "Recreation" },
            { color: "#808080", label: "Infrastructure" }
        ]
    },
    "top10nl_terrain": {
        items: [
            { color: "#90EE90", label: "Grassland" },
            { color: "#228B22", label: "Forest/woodland" },
            { color: "#8B4513", label: "Agricultural land" },
            { color: "#87CEEB", label: "Water bodies" },
            { color: "#D3D3D3", label: "Built-up area" }
        ]
    },
    "brk_percelen": {
        items: [
            { color: "#FF69B4", label: "Cadastral parcel boundary" }
        ]
    },
    "brk_borders": {
        items: [
            { color: "#FF1493", label: "Cadastral border" }
        ]
    },
    "bag_panden": {
        items: [
            { color: "#A0522D", label: "Building footprint" }
        ]
    }
};

// ----- 3. Criteria layers configuration -----
//
// Each entry corresponds to one "criterion" from your email:
// - Flood risk (ROR RiskZone)
// - Soil / foundation (BRO Bodemkaart)
// - Ecological value (Natura 2000)
// - Cultural-historical / heritage (Protected sites)

const criteriaLayers = {
    flood: {
        label: "Flood risk (ROR)",
        layers: [
            {
                id: "flood_riskzone",
                label: "RiskZone – Overstromingen (ROR)",
                type: "wms",
                url: "https://service.pdok.nl/rws/overstromingen-risicogebied/wms/v1_0",
                options: {
                    layers: "NZ.RiskZone",              // INSPIRE Natural Hazards layer name
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Rijkswaterstaat / PDOK – Gebieden met natuurrisico's - Overstromingen - Risicogebied (ROR)"
                }
            }
        ]
    },

    soil: {
        label: "Soil & foundation (BRO Bodemkaart)",
        layers: [
            {
                id: "soil_bro_bodemkaart",
                label: "BRO Bodemkaart – Soil areas",
                type: "wms",
                url: "https://service.pdok.nl/bzk/bro-bodemkaart/wms/v1_0?",
                options: {
                    // in DigiTwin configuration the featureName is "soilarea"
                    layers: "soilarea",
                    // if you want a specific style you could try: styles: "soilslope"
                    format: "image/png",
                    transparent: true,
                    attribution: "BRO Bodemkaart (SGM) – PDOK"
                }
            }
        ]
    },

    ecology: {
        label: "Ecology / Natura 2000",
        layers: [
            {
                id: "natura2000",
                label: "Natura 2000 areas",
                type: "wms",
                // PDOK Natura 2000 WMS
                url: "https://service.pdok.nl/rvo/natura2000/wms/v1_0",
                options: {
                    // Layer name from WMS GetCapabilities
                    layers: "natura2000:lnv_natura2000",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "RVO / PDOK – Beschermde Gebieden Natura 2000"
                }
            }
        ]
    },

    heritage: {
        label: "Cultural-historical / heritage",
        layers: [
            {
                id: "heritage_cultuurhistorie",
                label: "Protected cultural sites (Rijksmonumenten, etc.)",
                type: "wms",
                // INSPIRE Cultuurhistorie service
                url: "https://service.pdok.nl/rce/beschermde-gebieden-cultuurhistorie/wms/v1_0?",
                options: {
                    // INSPIRE protected sites, layer name from metadata: PS.ProtectedSite
                    layers: "PS.ProtectedSite",
                    format: "image/png",
                    transparent: true,
                    attribution: "RCE / PDOK – Beschermde Gebieden Cultuurhistorie"
                }
            }
        ]
    },

    transport: {
        label: "Transport & Accessibility",
        layers: [
            {
                id: "roads_top10nl",
                label: "Road network (TOP10NL)",
                type: "wms",
                url: "https://service.pdok.nl/brt/top10nl/wms/v1_0",
                options: {
                    layers: "wegdeel_hartlijn",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – TOP10NL"
                }
            },
            {
                id: "railways",
                label: "Railway network",
                type: "wms",
                url: "https://service.pdok.nl/brt/top10nl/wms/v1_0",
                options: {
                    layers: "spoorbaandeel_hartlijn",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – TOP10NL"
                }
            }
        ]
    },

    landuse: {
        label: "Land use & Zoning",
        layers: [
            {
                id: "bbg_landuse",
                label: "Land use (Bestand Bodemgebruik 2015)",
                type: "wms",
                url: "https://service.pdok.nl/cbs/bbg/2015/wms/v1_0",
                options: {
                    layers: "bbg_2015",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "CBS / PDOK – Bestand Bodemgebruik 2015"
                }
            },
            {
                id: "top10nl_terrain",
                label: "Terrain types (TOP10NL)",
                type: "wms",
                url: "https://service.pdok.nl/brt/top10nl/wms/v1_0",
                options: {
                    layers: "terrein_vlak",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – TOP10NL Terrain"
                }
            }
        ]
    },

    cadastral: {
        label: "Land ownership & Parcels",
        layers: [
            {
                id: "brk_percelen",
                label: "Cadastral parcels (BRK)",
                type: "wms",
                url: "https://service.pdok.nl/kadaster/kadastralekaart/wms/v5_0",
                options: {
                    layers: "Perceel",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – Kadastralekaart"
                }
            },
            {
                id: "brk_borders",
                label: "Cadastral boundaries",
                type: "wms",
                url: "https://service.pdok.nl/kadaster/kadastralekaart/wms/v5_0",
                options: {
                    layers: "kadastralegrens",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – Kadastralekaart"
                }
            }
        ]
    },

    buildings: {
        label: "Buildings & Built Environment",
        layers: [
            {
                id: "bag_panden",
                label: "Buildings (BAG Panden)",
                type: "wms",
                url: "https://service.pdok.nl/lv/bag/wms/v2_0",
                options: {
                    layers: "pand",
                    format: "image/png",
                    transparent: true,
                    version: "1.3.0",
                    attribution: "Kadaster / PDOK – BAG"
                }
            }
        ]
    }
};

// ----- 3. Internal storage for Leaflet layers -----

const leafletLayers = {};
const activeLayers = new Map(); // Track active layers with their definitions

// Create a Leaflet layer object from our config
function createLeafletLayer(layerDef) {
    if (layerDef.type === "wms") {
        return L.tileLayer.wms(layerDef.url, layerDef.options);
    }

    // Extend here later for WFS → GeoJSON, vector tiles, etc.
    console.warn("Unsupported layer type:", layerDef.type);
    return null;
}

// Get legend URL for WMS layer
function getLegendUrl(layerDef) {
    if (layerDef.type !== "wms") return null;

    const baseUrl = layerDef.url.split('?')[0];
    const params = new URLSearchParams({
        SERVICE: 'WMS',
        VERSION: layerDef.options.version || '1.3.0',
        REQUEST: 'GetLegendGraphic',
        FORMAT: 'image/png',
        LAYER: layerDef.options.layers,
        STYLE: layerDef.options.styles || ''
    });

    return `${baseUrl}?${params.toString()}`;
}

// Update the legend display
function updateLegend() {
    const legendDiv = document.getElementById('legend');
    const legendContent = document.getElementById('legend-content');

    if (activeLayers.size === 0) {
        legendDiv.classList.add('hidden');
        return;
    }

    legendDiv.classList.remove('hidden');
    legendContent.innerHTML = '';

    activeLayers.forEach((layerDef, layerId) => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'legend-item';

        const title = document.createElement('div');
        title.className = 'legend-item-title';
        title.textContent = layerDef.label;
        itemDiv.appendChild(title);

        // Check if we have a custom legend for this layer
        const customLegend = customLegends[layerId];

        if (customLegend && customLegend.items) {
            // Create custom legend with color swatches
            const legendTable = document.createElement('div');
            legendTable.style.fontSize = '11px';
            legendTable.style.marginTop = '4px';

            customLegend.items.forEach(item => {
                const row = document.createElement('div');
                row.style.display = 'flex';
                row.style.alignItems = 'center';
                row.style.marginBottom = '3px';

                const colorBox = document.createElement('div');
                colorBox.style.width = '20px';
                colorBox.style.height = '12px';
                colorBox.style.backgroundColor = item.color;
                colorBox.style.border = '1px solid #999';
                colorBox.style.marginRight = '6px';
                colorBox.style.flexShrink = '0';

                const labelSpan = document.createElement('span');
                labelSpan.textContent = item.label;

                row.appendChild(colorBox);
                row.appendChild(labelSpan);
                legendTable.appendChild(row);
            });

            itemDiv.appendChild(legendTable);
        } else {
            // Fallback: generic layer indicator
            const genericMsg = document.createElement('div');
            genericMsg.style.fontSize = '11px';
            genericMsg.style.color = '#666';
            genericMsg.style.marginTop = '4px';
            genericMsg.textContent = 'Layer active on map';
            itemDiv.appendChild(genericMsg);
        }

        legendContent.appendChild(itemDiv);
    });
}

// ----- 4. Build the sidebar UI (criteria + checkboxes) -----

function initCriteriaControls() {
    const container = document.getElementById("criteria-controls");

    Object.keys(criteriaLayers).forEach(criteriaKey => {
        const group = criteriaLayers[criteriaKey];

        const groupDiv = document.createElement("div");
        groupDiv.className = "criteria-group";

        const title = document.createElement("h3");
        title.textContent = group.label;
        groupDiv.appendChild(title);

        group.layers.forEach(layerDef => {
            const layerId = layerDef.id;
            const leafletLayer = createLeafletLayer(layerDef);

            if (leafletLayer) {
                leafletLayers[layerId] = leafletLayer;
            }

            const label = document.createElement("label");
            label.className = "criteria-layer";

            const checkbox = document.createElement("input");
            checkbox.type = "checkbox";
            checkbox.dataset.layerId = layerId;

            checkbox.addEventListener("change", (e) => {
                const id = e.target.dataset.layerId;
                const layer = leafletLayers[id];

                if (!layer) return;

                if (e.target.checked) {
                    layer.addTo(map);
                    activeLayers.set(id, layerDef);
                } else {
                    map.removeLayer(layer);
                    activeLayers.delete(id);
                }

                updateLegend();
            });

            const text = document.createElement("span");
            text.textContent = layerDef.label;

            label.appendChild(checkbox);
            label.appendChild(text);
            groupDiv.appendChild(label);
        });

        container.appendChild(groupDiv);
    });
}

initCriteriaControls();

// ----- 5. (Optional) Layer control in the map corner -----

// Build an overlay object dynamically from leafletLayers once they are checked.
// For now, we just show base layers in the standard layer control.
// You can extend this later if you want all overlays listed there.
L.control.layers(baseLayers, null, { collapsed: true }).addTo(map);

// ----- 6. Load KMZ file (My Places) -----

// Function to load and parse KMZ file
async function loadKMZ(url) {
    try {
        console.log('Loading KMZ file from:', url);

        // Fetch the KMZ file
        const response = await fetch(url);
        const arrayBuffer = await response.arrayBuffer();

        // Unzip the KMZ file using JSZip
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Find the KML file inside (usually doc.kml or the first .kml file)
        let kmlFile = zip.file('doc.kml');
        if (!kmlFile) {
            // Look for any .kml file
            const kmlFiles = Object.keys(zip.files).filter(name => name.endsWith('.kml'));
            if (kmlFiles.length > 0) {
                kmlFile = zip.file(kmlFiles[0]);
            }
        }

        if (!kmlFile) {
            throw new Error('No KML file found in KMZ archive');
        }

        // Extract the KML content
        const kmlText = await kmlFile.async('string');

        // Parse KML to DOM
        const parser = new DOMParser();
        const kmlDom = parser.parseFromString(kmlText, 'text/xml');

        // Convert KML to GeoJSON using toGeoJSON
        const geojson = toGeoJSON.kml(kmlDom);

        console.log('KMZ parsed successfully, features found:', geojson.features.length);
        console.log('GeoJSON:', geojson);

        // Filter features to only include those in Opheusden area (Netherlands)
        // Approximate bounding box: lat 51.5-52.5, lon 5.0-6.5
        const filteredFeatures = geojson.features.filter(feature => {
            if (feature.geometry.type === 'Point') {
                const [lon, lat] = feature.geometry.coordinates;
                return lat >= 51.5 && lat <= 52.5 && lon >= 5.0 && lon <= 6.5;
            } else if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
                // For polygons, check if any coordinate is in the area
                const coords = feature.geometry.type === 'Polygon'
                    ? feature.geometry.coordinates[0]
                    : feature.geometry.coordinates[0][0];
                const firstCoord = coords[0];
                const [lon, lat] = firstCoord;
                return lat >= 51.5 && lat <= 52.5 && lon >= 5.0 && lon <= 6.5;
            }
            return true;
        });

        console.log('Filtered features (Opheusden area):', filteredFeatures.length);

        // Create filtered GeoJSON
        const filteredGeoJSON = {
            type: 'FeatureCollection',
            features: filteredFeatures
        };

        // Create a Leaflet GeoJSON layer
        const kmzLayer = L.geoJSON(filteredGeoJSON, {
            style: function (feature) {
                // Style for polygons and lines
                return {
                    color: '#FF6B6B',
                    weight: 2,
                    opacity: 0.8,
                    fillColor: '#FF6B6B',
                    fillOpacity: 0.3
                };
            },
            pointToLayer: function (feature, latlng) {
                // Style for points
                return L.marker(latlng);
            },
            onEachFeature: function (feature, layer) {
                // Add popup with properties
                if (feature.properties) {
                    let popupContent = '';
                    if (feature.properties.name) {
                        popupContent += '<strong>' + feature.properties.name + '</strong>';
                    }
                    if (feature.properties.description) {
                        popupContent += '<br>' + feature.properties.description;
                    }
                    if (popupContent) {
                        layer.bindPopup(popupContent);
                    }
                }
            }
        }).addTo(map);

        // Fit map to KMZ bounds with padding
        if (kmzLayer.getBounds().isValid()) {
            map.fitBounds(kmzLayer.getBounds(), { padding: [50, 50] });
            console.log('Map fitted to KMZ bounds');
        } else {
            // Fallback to Opheusden if bounds invalid
            map.setView([51.933, 5.633], 12);
        }

        return kmzLayer;

    } catch (error) {
        console.error('Error loading KMZ file:', error);
        alert('Failed to load KMZ file: ' + error.message);
    }
}

// Load the My Places KMZ file
loadKMZ('data/My Places.kmz');
