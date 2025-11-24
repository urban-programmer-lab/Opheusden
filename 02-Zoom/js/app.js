// ----- 1. Base map setup -----

// Center on Opheusden (approximate)
const map = L.map('map').setView([51.933, 5.633], 12);

// Base layer: OpenStreetMap
const osmBase = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// You can add more base layers later if needed
const baseLayers = {
    "OpenStreetMap": osmBase
};

// ----- 2. Criteria layers configuration -----
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
    }
};

// ----- 3. Internal storage for Leaflet layers -----

const leafletLayers = {};

// Create a Leaflet layer object from our config
function createLeafletLayer(layerDef) {
    if (layerDef.type === "wms") {
        return L.tileLayer.wms(layerDef.url, layerDef.options);
    }

    // Extend here later for WFS → GeoJSON, vector tiles, etc.
    console.warn("Unsupported layer type:", layerDef.type);
    return null;
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
                } else {
                    map.removeLayer(layer);
                }
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
