/**
 * scripts/seed.ts
 * Seeds the MongoDB database with real product and category data
 * scraped from itechdevices.ae
 *
 * Run with:   npx tsx scripts/seed.ts
 */

import { MongoClient, ObjectId } from "mongodb";
import * as fs from "fs";
import * as path from "path";

// ---------------------------------------------------------------------------
// Load .dev.vars for MONGODB_URI / MONGODB_DB
// ---------------------------------------------------------------------------
function loadDevVars(): Record<string, string> {
  const devVarsPath = path.join(process.cwd(), ".dev.vars");
  if (!fs.existsSync(devVarsPath)) return {};
  const lines = fs.readFileSync(devVarsPath, "utf-8").split("\n");
  const vars: Record<string, string> = {};
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    vars[key] = val;
  }
  return vars;
}

const env = loadDevVars();
const MONGODB_URI = env.MONGODB_URI || process.env.MONGODB_URI || "";
const MONGODB_DB = env.MONGODB_DB || process.env.MONGODB_DB || "opennest";

if (!MONGODB_URI) {
  console.error("❌  MONGODB_URI not found in .dev.vars or environment.");
  process.exit(1);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function makeId() {
  return new ObjectId().toHexString();
}

/** Build a CDN image entry from a seed SKU like "HPE-662257-001" or "DELL-PER610" */
function cdnImg(
  sku: string,
  alt: string
): { url: string; alt: string; is_primary: boolean; sort_order: number } {
  // Strip leading brand prefix (e.g. "HPE-", "DELL-", "HP-", "TOS-", "KNG-", "MEL-",
  // "SAM-", "WD-", "SEA-", "UBI-", "ARISTA-", "CISCO-", "DELTA-", "MICRON-", "SYN-")
  const partNum = sku.replace(/^[A-Z0-9]+-/, "");
  return {
    url: `https://cdn.itechdevices.ae/images/Images/Products/${partNum}-A3.webp`,
    alt,
    is_primary: true,
    sort_order: 0,
  };
}

// ---------------------------------------------------------------------------
// CATEGORIES
// ---------------------------------------------------------------------------
const now = new Date().toISOString();

interface CategoryDoc {
  _id: string;
  id: number;
  name: string;
  slug: string;
  parent_id: number | null;
  category_path: string;
  url: string;
  image: string | null;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  description: string | null;
  footer_description: string | null;
  google_product_category: string;
  active: boolean;
  weight_default: number;
  dimensions_default: { l: number; w: number; h: number; unit: string };
  created_at: string;
  updated_at: string;
}

const categories: CategoryDoc[] = [
  // ── Level 1 ───────────────────────────────────────────────────────────────
  {
    _id: makeId(),
    id: 1,
    name: "Servers",
    slug: "servers",
    parent_id: null,
    category_path: "Servers",
    url: "https://www.itechdevices.ae/categories/pc-and-servers/servers.html",
    image: null,
    meta_title: "Servers – Rack, Tower & Blade | Open Nest",
    meta_description:
      "Buy HPE, Dell and Supermicro rack, tower and blade servers in UAE.",
    meta_keywords: "servers, rack server, tower server, blade server, UAE",
    description:
      "Enterprise-grade servers from HPE, Dell, Supermicro and more for data centers and businesses across the UAE.",
    footer_description: null,
    google_product_category: "Electronics > Computers > Servers",
    active: true,
    weight_default: 10,
    dimensions_default: { l: 600, w: 450, h: 100, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
  {
    _id: makeId(),
    id: 2,
    name: "Solid State Drives",
    slug: "solid-state-drives",
    parent_id: null,
    category_path: "Storage > Solid State Drives",
    url: "https://www.itechdevices.ae/categories/storage-devices/solid-state-drives.html",
    image: null,
    meta_title: "Solid State Drives (SSD) | Open Nest UAE",
    meta_description: "Buy enterprise and consumer SSDs in UAE – Dell, HPE, Samsung, WD.",
    meta_keywords: "SSD, solid state drive, NVMe, SATA SSD, SAS SSD, UAE",
    description:
      "High-performance SSDs for enterprise servers, workstations, and storage arrays. SATA, SAS, and NVMe form factors.",
    footer_description: null,
    google_product_category:
      "Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drives",
    active: true,
    weight_default: 0.1,
    dimensions_default: { l: 70, w: 70, h: 7, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
  {
    _id: makeId(),
    id: 3,
    name: "Network Switches",
    slug: "network-switches",
    parent_id: null,
    category_path: "Network & Accessories > Network Switches",
    url: "https://www.itechdevices.ae/categories/network-and-accessories/network-switches.html",
    image: null,
    meta_title: "Network Switches – Cisco, HPE, Dell | Open Nest",
    meta_description:
      "Enterprise and SMB network switches from Cisco, HPE, Dell, Arista and more.",
    meta_keywords:
      "network switch, cisco switch, HPE Aruba, managed switch, UAE",
    description:
      "L2/L3 managed and unmanaged network switches for enterprise, data centres and branch offices.",
    footer_description: null,
    google_product_category:
      "Electronics > Networking > Network Switches",
    active: true,
    weight_default: 3,
    dimensions_default: { l: 440, w: 250, h: 44, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
  {
    _id: makeId(),
    id: 4,
    name: "Server Hard Drives",
    slug: "server-hard-drives",
    parent_id: null,
    category_path: "Storage > Hard Drives > Server Hard Drives",
    url: "https://www.itechdevices.ae/categories/storage-devices/hard-drives/server-hard-drives.html",
    image: null,
    meta_title: "Server Hard Drives – SAS, SATA, NVMe | Open Nest",
    meta_description:
      "Buy server hard drives in UAE – Dell, HP, Seagate, WD, Toshiba.",
    meta_keywords: "server hard drives, SAS HDD, SATA HDD, enterprise HDD, UAE",
    description:
      "Enterprise server hard drives designed for 24/7 workloads. Covers SAS, SATA and NVMe options from all major vendors.",
    footer_description: null,
    google_product_category:
      "Electronics > Electronics Accessories > Computer Components > Storage Devices > Hard Drives",
    active: true,
    weight_default: 0.25,
    dimensions_default: { l: 100, w: 70, h: 15, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
  {
    _id: makeId(),
    id: 5,
    name: "Server Memory",
    slug: "server-memory",
    parent_id: null,
    category_path: "Memory > Server Memory",
    url: "https://www.itechdevices.ae/categories/memory/server-memory.html",
    image: null,
    meta_title: "Server Memory – ECC, RDIMM, DDR4/DDR5 | Open Nest",
    meta_description:
      "Buy server ECC memory and registered DIMMs in UAE – Dell, HPE, Kingston.",
    meta_keywords:
      "server memory, ECC RAM, RDIMM, DDR4 server RAM, DDR5, UAE",
    description:
      "Registered and ECC server memory modules from Dell, HPE, Kingston and Samsung. DDR3, DDR4, and DDR5 options available.",
    footer_description: null,
    google_product_category:
      "Electronics > Electronics Accessories > Computer Components > Computer Memory",
    active: true,
    weight_default: 0.05,
    dimensions_default: { l: 135, w: 30, h: 5, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
  {
    _id: makeId(),
    id: 6,
    name: "Power Supplies",
    slug: "power-supplies",
    parent_id: null,
    category_path: "Power Equipment > Power Supplies",
    url: "https://www.itechdevices.ae/categories/power-equipment/power-supplies.html",
    image: null,
    meta_title: "Power Supplies for Servers & PCs | Open Nest UAE",
    meta_description:
      "Buy server and PC power supplies in UAE – Dell, HP, HPE, Delta, Supermicro.",
    meta_keywords:
      "power supply, server PSU, redundant power supply, HP PSU, Dell PSU, UAE",
    description:
      "Redundant and hot-plug power supplies for enterprise servers, workstations, and rack equipment.",
    footer_description: null,
    google_product_category:
      "Electronics > Electronics Accessories > Power > Computer Power Supplies",
    active: true,
    weight_default: 0.8,
    dimensions_default: { l: 200, w: 100, h: 40, unit: "mm" },
    created_at: now,
    updated_at: now,
  },
];

// ---------------------------------------------------------------------------
// Build a lookup: category slug → {_id, id, name, slug, category_path}
// ---------------------------------------------------------------------------
const catBySlug = Object.fromEntries(
  categories.map((c) => [
    c.slug,
    { id: String(c.id), name: c.name, slug: c.slug, path: c.category_path },
  ])
);

// ---------------------------------------------------------------------------
// PRODUCTS
// ---------------------------------------------------------------------------
interface ProductDoc {
  _id: string;
  sku: string;
  name: string;
  slug: string;
  brand: { id: string; name: string; slug: string } | null;
  category: { id: string; name: string; slug: string; path: string };
  price: { aed: number; compare_aed?: number };
  stock: { qty: number; status: "in_stock" | "out_of_stock" | "backorder" };
  images: {
    url: string;
    alt: string;
    is_primary: boolean;
    sort_order: number;
  }[];
  description: string | null;
  short_description: string | null;
  attributes: Record<string, string>;
  price_tiers: unknown[];
  meta: { title: string; description: string; keywords: string };
  google_product_category: string;
  weight: number;
  dimensions: { l: number; w: number; h: number };
  active: boolean;
  featured: boolean;
  created_at: string;
  updated_at: string;
}

function makeProduct(
  sku: string,
  name: string,
  brandName: string | null,
  catSlug: string,
  priceAed: number,
  comparePriceAed: number | undefined,
  shortDesc: string,
  attrs: Record<string, string>,
  featured = false,
  stockQty = 10
): ProductDoc {
  const cat = catBySlug[catSlug];
  const brandSlug = brandName ? slug(brandName) : null;
  return {
    _id: makeId(),
    sku,
    name,
    slug: slug(name),
    brand: brandName
      ? { id: `brand_${brandSlug}`, name: brandName, slug: brandSlug! }
      : null,
    category: cat,
    price: comparePriceAed
      ? { aed: priceAed, compare_aed: comparePriceAed }
      : { aed: priceAed },
    stock: {
      qty: stockQty,
      status: stockQty > 0 ? "in_stock" : "out_of_stock",
    },
    images: [cdnImg(sku, name)],
    description: `<p>${shortDesc}</p>`,
    short_description: shortDesc,
    attributes: attrs,
    price_tiers: [],
    meta: {
      title: `${name} | Open Nest UAE`,
      description: `Buy ${name} in UAE. Fast delivery, warranty. ${shortDesc}`,
      keywords: `${sku}, ${brandName || ""}, ${cat.name}, UAE`,
    },
    google_product_category: cat.path,
    weight: 0.5,
    dimensions: { l: 100, w: 80, h: 30 },
    active: true,
    featured,
    created_at: now,
    updated_at: now,
  };
}

const products: ProductDoc[] = [
  // ── SERVERS ──────────────────────────────────────────────────────────────
  makeProduct(
    "HPE-662257-001",
    "HPE 662257-001 IMSourcing ProLiant DL380p G8 2U Rack Server",
    "HPE",
    "servers",
    4449.90, 5200.00,
    "HPE ProLiant DL380p Gen8 2U rack server with Intel Xeon E5 platform.",
    { "Form Factor": "2U Rack", "Generation": "Gen8", "CPU Socket": "LGA2011" },
    true
  ),
  makeProduct(
    "HPE-850517-S01",
    "HPE 850517-S01 ProLiant DL380 Gen9 2U Rack Server",
    "HPE",
    "servers",
    5147.10, 6000.00,
    "HPE ProLiant DL380 Gen9 2U rack server — scalable enterprise workhorse.",
    { "Form Factor": "2U Rack", "Generation": "Gen9", "Max RAM": "3TB" },
    true
  ),
  makeProduct(
    "HPE-850519-S01",
    "HPE 850519-S01 ProLiant DL380 Gen9 2U Rack Server",
    "HPE",
    "servers",
    1884.75, undefined,
    "HPE ProLiant DL380 Gen9 2U rack server.",
    { "Form Factor": "2U Rack", "Generation": "Gen9" }
  ),
  makeProduct(
    "HPE-850520-S01",
    "HPE 850520-S01 ProLiant DL380 Gen9 2U Rack Server",
    "HPE",
    "servers",
    5378.10, undefined,
    "HPE ProLiant DL380 Gen9 2U rack server with enhanced memory capacity.",
    { "Form Factor": "2U Rack", "Generation": "Gen9" }
  ),
  makeProduct(
    "HPE-813197-B21",
    "HPE 813197-B21 ProLiant BL460c G9 Blade Server 2x E5-2680V4",
    "HPE",
    "servers",
    3546.90, undefined,
    "HPE ProLiant BL460c Gen9 blade server with dual E5-2680V4 CPUs and DDR4 support.",
    { "Form Factor": "Blade", "Generation": "Gen9", "CPU": "2x Intel E5-2680V4", "Memory Type": "DDR4" }
  ),
  makeProduct(
    "DELL-PER610",
    "Dell PER610 PowerEdge R610 1x E5640 2.66GHz 1U Rack Server",
    "Dell",
    "servers",
    2234.40, undefined,
    "Dell PowerEdge R610 1U rack server with Intel Xeon E5640 processor.",
    { "Form Factor": "1U Rack", "CPU": "Intel Xeon E5640 2.66GHz", "Drive Bays": "6x SFF 2.5in" }
  ),
  makeProduct(
    "SYN-FS6400",
    "Synology FS6400 24-Bay Hot-Swap SAS 2.5-Inch SSD NAS Server",
    "Synology",
    "servers",
    64664.25, undefined,
    "Synology FS6400 all-flash 24-bay NAS server with hot-swap SAS SSD bays.",
    { "Drive Bays": "24x 2.5in SAS SSD", "Form Factor": "4U Rack", "Network": "10GbE" },
    true, 3
  ),
  makeProduct(
    "HPE-P69310-005",
    "HPE P69310-005 ProLiant ML350 Gen11 4U Rack Server",
    "HPE",
    "servers",
    30531.90, undefined,
    "HPE ProLiant ML350 Gen11 4U rack/tower server designed for performance and reliability.",
    { "Form Factor": "4U Rack/Tower", "Generation": "Gen11" },
    true
  ),
  makeProduct(
    "HPE-P55533-001",
    "HPE P55533-001 ProLiant ML110 Gen11 4x LFF 4.5U Tower Server",
    "HPE",
    "servers",
    6344.10, undefined,
    "HPE ProLiant ML110 Gen11 single-socket tower server with 4x LFF drive bays.",
    { "Form Factor": "4.5U Tower", "Generation": "Gen11", "Drive Bays": "4x LFF" }
  ),
  makeProduct(
    "HPE-P65096-001",
    "HPE P65096-001 ProLiant ML30 Gen11 4U Tower Server",
    "HPE",
    "servers",
    5533.50, undefined,
    "HPE ProLiant ML30 Gen11 entry-level tower server ideal for small businesses.",
    { "Form Factor": "4U Tower", "Generation": "Gen11" }
  ),
  makeProduct(
    "SYN-DS124",
    "Synology DS124 DiskStation Realtek RTD1619B 1.7GHz 1-Bay NAS",
    "Synology",
    "servers",
    887.25, undefined,
    "Synology DiskStation DS124 compact 1-bay NAS powered by Realtek RTD1619B 1.7GHz CPU.",
    { "CPU": "Realtek RTD1619B 1.7GHz", "Drive Bays": "1x 3.5in", "RAM": "1GB DDR4" }
  ),
  makeProduct(
    "HPE-P77245-425",
    "HPE P77245-425 ProLiant DL385 Gen11 AMD EPYC 9124 Server",
    "HPE",
    "servers",
    46754.40, undefined,
    "HPE ProLiant DL385 Gen11 2U rack server with AMD EPYC 9124 processor.",
    { "Form Factor": "2U Rack", "Generation": "Gen11", "CPU": "AMD EPYC 9124" },
    true, 5
  ),
  makeProduct(
    "DELL-R660XS",
    "Dell R660XS-8SFF PowerEdge R660xs 8x 2.5in Chassis",
    "Dell",
    "servers",
    42840.00, undefined,
    "Dell PowerEdge R660xs enterprise 1U server with 8x 2.5in SFF drive bays.",
    { "Form Factor": "1U Rack", "Drive Bays": "8x 2.5in SFF" },
    true, 4
  ),
  makeProduct(
    "DELL-R740XD",
    "Dell R740xd PowerEdge 24-Bay SFF 2U Rackmount Server",
    "Dell",
    "servers",
    13206.90, 15000.00,
    "Dell PowerEdge R740xd high-density 2U server with 24 SFF drive bays.",
    { "Form Factor": "2U Rack", "Drive Bays": "24x 2.5in SFF", "Max RAM": "3TB DDR4" }
  ),
  makeProduct(
    "HPE-P52532-B21",
    "HPE ProLiant DL380 Gen11 Configure to Order",
    "HPE",
    "servers",
    31500.00, undefined,
    "HPE ProLiant DL380 Gen11 CTO 2U rack server for enterprise data centres.",
    { "Form Factor": "2U Rack", "Generation": "Gen11" },
    true
  ),
  makeProduct(
    "HPE-P83287-005",
    "HPE P83287-005 ProLiant DL360 Gen11 1U Rack Server",
    "HPE",
    "servers",
    29282.40, undefined,
    "HPE ProLiant DL360 Gen11 1U compact rack server for virtualization workloads.",
    { "Form Factor": "1U Rack", "Generation": "Gen11" }
  ),

  // ── SSDs ─────────────────────────────────────────────────────────────────
  makeProduct(
    "DELL-R87FK",
    "Dell R87FK 1.92TB MLC SAS 12Gb/s SFF 2.5 SSD",
    "Dell",
    "solid-state-drives",
    1244.25, undefined,
    "Dell 1.92TB MLC 2.5-inch SFF SAS 12Gb/s solid state drive for enterprise servers.",
    { "Capacity": "1.92TB", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF", "Type": "MLC" }
  ),
  makeProduct(
    "MICRON-6550-61T",
    "Micron MTFDLAL61T4THL 6550 Ion 61.44TB NVMe 3D NAND SSD",
    "Micron",
    "solid-state-drives",
    42630.00, undefined,
    "Micron 6550 Ion 61.44TB enterprise NVMe 3D NAND SSD for high-capacity storage.",
    { "Capacity": "61.44TB", "Interface": "NVMe PCIe", "Type": "3D NAND" },
    true, 2
  ),
  makeProduct(
    "SAM-MZ77E1T0",
    "Samsung MZ-77E1T0 1TB SFF 6Gb/s SATA 2.5 SSD",
    "Samsung",
    "solid-state-drives",
    598.50, 750.00,
    "Samsung 1TB SATA 6Gb/s 2.5-inch SSD for servers and workstations.",
    { "Capacity": "1TB", "Interface": "SATA 6Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "WD-WDS400T2R0A",
    "WD WDS400T2R0A Red SA500 4TB SATA Internal 2.5in SSD",
    "Western Digital",
    "solid-state-drives",
    1709.40, undefined,
    "Western Digital Red SA500 NAS 4TB 2.5-inch SATA SSD optimised for NAS systems.",
    { "Capacity": "4TB", "Interface": "SATA", "Form Factor": "2.5in", "Optimised For": "NAS" }
  ),
  makeProduct(
    "MICRON-3T84",
    "Micron MTFDKCC3T8TGP 3.84TB PCIe SFF 2.5 SSD",
    "Micron",
    "solid-state-drives",
    3244.50, undefined,
    "Micron 3.84TB PCIe 2.5-inch SFF enterprise SSD.",
    { "Capacity": "3.84TB", "Interface": "PCIe NVMe", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "DELL-400-ASEG",
    "Dell 400-ASEG 120GB SFF 2.5 MLC 6Gb/s SATA SSD",
    "Dell",
    "solid-state-drives",
    186.90, undefined,
    "Dell 120GB MLC 2.5-inch SATA 6Gb/s SSD for PowerEdge and PowerVault systems.",
    { "Capacity": "120GB", "Interface": "SATA 6Gb/s", "Form Factor": "2.5in SFF", "Type": "MLC" }
  ),
  makeProduct(
    "DELL-88T52",
    "Dell 88T52 240GB SFF 2.5 TLC 6Gb/s SATA SSD",
    "Dell",
    "solid-state-drives",
    199.50, undefined,
    "Dell 240GB TLC 2.5-inch SATA 6Gb/s SSD for Dell enterprise systems.",
    { "Capacity": "240GB", "Interface": "SATA 6Gb/s", "Form Factor": "2.5in SFF", "Type": "TLC" }
  ),
  makeProduct(
    "HPE-P04533-B21",
    "HPE P04533-B21 1.6TB SAS 12Gb/s SFF 2.5 SSD",
    "HPE",
    "solid-state-drives",
    1188.60, undefined,
    "HPE 1.6TB write-intensive SAS 12G SFF 2.5in SSD for HPE servers.",
    { "Capacity": "1.6TB", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "HPE-P06580-001",
    "HPE P06580-001 1.6TB SAS 12Gb/s SFF 2.5 SSD",
    "HPE",
    "solid-state-drives",
    1188.60, undefined,
    "HPE 1.6TB mixed-use SAS 12G SFF 2.5in SSD.",
    { "Capacity": "1.6TB", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "HPE-727402-001",
    "HPE 727402-001 400GB 3PAR StoreServ SFF 2.5 MLC 6Gb/s SAS SSD",
    "HPE",
    "solid-state-drives",
    598.50, undefined,
    "HPE 400GB MLC SAS SSD designed for HP 3PAR StoreServ storage arrays.",
    { "Capacity": "400GB", "Interface": "SAS 6Gb/s", "Form Factor": "2.5in SFF", "System": "3PAR StoreServ" }
  ),

  // ── NETWORK SWITCHES ─────────────────────────────────────────────────────
  makeProduct(
    "ARISTA-DCS7050T",
    "Arista DCS-7050T-36-F 32-Port RJ-45 + 4-Port SFP+ L3 Network Switch",
    "Arista",
    "network-switches",
    2364.60, undefined,
    "Arista DCS-7050T-36-F 32-port 10/100/1000T + 4-port SFP+ Layer 3 switch.",
    { "Ports": "32x RJ-45 + 4x SFP+", "Layer": "L3", "Switching": "Managed" }
  ),
  makeProduct(
    "UBI-USW-48",
    "Ubiquiti USW-48 UniFi 48-Port Layer 2 Network Switch",
    "Ubiquiti",
    "network-switches",
    1884.75, 2200.00,
    "Ubiquiti UniFi USW-48 48-port Gigabit managed Layer 2 switch.",
    { "Ports": "48x GbE + 4x SFP", "Layer": "L2", "PoE": "No", "Management": "UniFi Controller" }
  ),
  makeProduct(
    "MEL-MSN2100-CB2F",
    "Mellanox MSN2100-CB2F Spectrum 16-Port 100GBase-X 1U Switch",
    "Mellanox",
    "network-switches",
    48260.10, undefined,
    "Mellanox Spectrum MSN2100 16-port 100GbE QSFP28 1U open networking switch.",
    { "Ports": "16x 100GbE QSFP28", "Layer": "L3", "Switching Capacity": "3.2Tbps" },
    false, 5
  ),
  makeProduct(
    "CISCO-C1000-24P",
    "Cisco C1000-24P-4X-L Catalyst 24-Port PoE+ 4x 10G SFP+ Switch",
    "Cisco",
    "network-switches",
    3528.00, 4200.00,
    "Cisco Catalyst 1000 24-port PoE+ Gigabit switch with 4x 10G SFP+ uplinks.",
    { "Ports": "24x PoE+ GbE + 4x 10G SFP+", "PoE Budget": "370W", "Layer": "L2+", "Management": "WebUI / CLI" },
    true
  ),
  makeProduct(
    "HPE-JL626A",
    "HPE JL626A Aruba 8325-32C 32-Port QSFP28 100GBase-X Switch",
    "HPE",
    "network-switches",
    17109.75, undefined,
    "HPE Aruba 8325-32C 32-port 100GbE switch with high-density core switching.",
    { "Ports": "32x QSFP28 100GbE", "Layer": "L3", "Stacking": "Yes" }
  ),
  makeProduct(
    "HPE-JL324A",
    "HPE JL324A Aruba 2930M 24G 24-Port PoE+ 5GBase-T Switch",
    "HPE",
    "network-switches",
    5402.25, 6500.00,
    "HPE Aruba 2930M 24-port 5-speed PoE+ switch with stacking capability.",
    { "Ports": "24x PoE+ 5GBase-T + 4x SFP+", "Layer": "L3", "Stacking": "Yes" }
  ),
  makeProduct(
    "HPE-JL682A",
    "HPE JL682A Aruba Instant On 1930 24G 4SFP/SFP+ Switch",
    "HPE",
    "network-switches",
    1228.50, 1500.00,
    "HPE Aruba Instant On 1930 smart-managed 24-port Gigabit switch.",
    { "Ports": "24x GbE + 4x SFP/SFP+", "Layer": "L2+", "Management": "Cloud / App" }
  ),
  makeProduct(
    "HPE-JL586-61001",
    "HPE JL586-61001 FlexFabric 5710 56-Port L3 Switch",
    "HPE",
    "network-switches",
    20052.90, undefined,
    "HPE FlexFabric 5710 56-port 10GbE/100GbE data-centre switch.",
    { "Ports": "48x 10GbE SFP+ + 8x 100GbE QSFP28", "Layer": "L3", "Data Centre": "Yes" }
  ),
  makeProduct(
    "HPE-JL693-61001",
    "HPE JL693-61001 Aruba 2930F 12-Port PoE RJ-45 + 2-Port SFP",
    "HPE",
    "network-switches",
    3200.40, undefined,
    "HPE Aruba 2930F 12-port PoE Gigabit switch with 2x SFP uplinks.",
    { "Ports": "12x PoE GbE + 2x SFP", "Layer": "L3", "PoE Budget": "124W" }
  ),
  makeProduct(
    "HPE-JL664A",
    "HPE JL664A Aruba 6300M 24-Port 1GbE and 4-Port SFP56 Switch",
    "HPE",
    "network-switches",
    27549.90, undefined,
    "HPE Aruba CX 6300M stackable managed switch with 24x 1GbE and 4x SFP56 uplinks.",
    { "Ports": "24x GbE + 4x SFP56", "Layer": "L3", "Stacking": "Yes", "Management": "AOS-CX" },
    true
  ),
  makeProduct(
    "DELL-210-AJIT",
    "Dell 210-AJIT N1124P-ON 24-Port + 4-Port SFP+ Layer 2 Switch",
    "Dell",
    "network-switches",
    10046.40, undefined,
    "Dell Networking N1124P-ON 24-port PoE+ Gigabit switch with 4x 10GbE SFP+ uplinks.",
    { "Ports": "24x PoE+ GbE + 4x 10G SFP+", "Layer": "L2", "PoE Budget": "500W" }
  ),
  makeProduct(
    "HPE-JL587A",
    "HPE JL587A FlexFabric 5710 24-Port SFP+ Network Switch",
    "HPE",
    "network-switches",
    21695.10, undefined,
    "HPE FlexFabric 5710 24-port 10GbE SFP+ data-centre switch.",
    { "Ports": "24x 10GbE SFP+ + 6x 100GbE QSFP28", "Layer": "L3" }
  ),

  // ── SERVER HARD DRIVES ────────────────────────────────────────────────────
  makeProduct(
    "DELL-0MFK2F",
    "Dell 0MFK2F 1.2TB 10000RPM SAS 12Gb/s 512n 2.5-in HDD",
    "Dell",
    "server-hard-drives",
    618.24, undefined,
    "Dell 1.2TB 10K RPM SAS 12Gb/s 512n enterprise 2.5-in hard drive.",
    { "Capacity": "1.2TB", "RPM": "10000", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in" }
  ),
  makeProduct(
    "DELL-TX8WW",
    "Dell TX8WW 4TB 7.2K-RPM SAS 12Gb/s LFF 3.5 HDD",
    "Dell",
    "server-hard-drives",
    417.90, undefined,
    "Dell 4TB 7200 RPM 3.5-inch SAS 12Gb/s LFF enterprise hard drive.",
    { "Capacity": "4TB", "RPM": "7200", "Interface": "SAS 12Gb/s", "Form Factor": "3.5in LFF" }
  ),
  makeProduct(
    "TOS-HDWG71AEZ",
    "Toshiba HDWG71AEZSTA 10TB 7200RPM SATA 6Gb/s 3.5-in HDD",
    "Toshiba",
    "server-hard-drives",
    1209.59, undefined,
    "Toshiba 10TB 7200 RPM SATA 6Gb/s 3.5-inch NAS/server hard drive.",
    { "Capacity": "10TB", "RPM": "7200", "Interface": "SATA 6Gb/s", "Form Factor": "3.5in" }
  ),
  makeProduct(
    "WD-0F38462",
    "Western Digital 0F38462 16TB 7.2K-RPM SATA 6Gb/s 3.5-in HDD",
    "Western Digital",
    "server-hard-drives",
    1811.25, undefined,
    "Western Digital Ultrastar 16TB 7200 RPM SATA 6Gb/s enterprise 3.5-inch drive.",
    { "Capacity": "16TB", "RPM": "7200", "Interface": "SATA 6Gb/s", "Form Factor": "3.5in" }
  ),
  makeProduct(
    "SEA-ST20000NM001J",
    "Seagate ST20000NM001J EXOS X20z 20TB SATA 3.5-in HDD",
    "Seagate",
    "server-hard-drives",
    2520.00, undefined,
    "Seagate EXOS X20z 20TB SATA enterprise hard drive optimised for data centres.",
    { "Capacity": "20TB", "RPM": "7200", "Interface": "SATA 6Gb/s", "Form Factor": "3.5in", "Product Line": "EXOS X20z" },
    true
  ),
  makeProduct(
    "HP-765464-B21",
    "HP 765464-B21 1TB 7.2K-RPM SAS 12Gb/s SFF 2.5 HDD",
    "HP",
    "server-hard-drives",
    212.10, undefined,
    "HP 1TB 7200 RPM SAS 12Gb/s 2.5-inch hot-plug server hard drive.",
    { "Capacity": "1TB", "RPM": "7200", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "WD-0F22791",
    "Western Digital 0F22791 6TB 7.2K-RPM SAS 12Gb/s LFF 3.5 HDD",
    "Western Digital",
    "server-hard-drives",
    753.90, undefined,
    "WD Ultrastar 6TB 7200 RPM SAS 12Gb/s 3.5-inch enterprise hard drive.",
    { "Capacity": "6TB", "RPM": "7200", "Interface": "SAS 12Gb/s", "Form Factor": "3.5in LFF" }
  ),
  makeProduct(
    "HP-796365-003",
    "HP 796365-003 900GB 10K-RPM SAS 12Gb/s SFF 2.5 HDD",
    "HP",
    "server-hard-drives",
    239.40, undefined,
    "HP 900GB 10K RPM SAS 12Gb/s 2.5-inch hot-plug drive for HP ProLiant servers.",
    { "Capacity": "900GB", "RPM": "10000", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "HP-785067-B21",
    "HP 785067-B21 300GB 10K-RPM SAS 12Gb/s SFF 2.5 HDD",
    "HP",
    "server-hard-drives",
    239.40, undefined,
    "HP 300GB 10K RPM SAS 12Gb/s Enterprise 2.5-inch hard drive.",
    { "Capacity": "300GB", "RPM": "10000", "Interface": "SAS 12Gb/s", "Form Factor": "2.5in SFF" }
  ),
  makeProduct(
    "HP-EG0900JETKB",
    "HP EG0900JETKB 900GB 10K-RPM SAS 6Gb/s SFF 2.5 HDD",
    "HP",
    "server-hard-drives",
    239.40, undefined,
    "HP 900GB 10K RPM SAS 6Gb/s 2.5-inch SFF hot-plug server hard drive.",
    { "Capacity": "900GB", "RPM": "10000", "Interface": "SAS 6Gb/s", "Form Factor": "2.5in SFF" }
  ),

  // ── SERVER MEMORY ─────────────────────────────────────────────────────────
  makeProduct(
    "DELL-M1G12",
    "Dell M1G12 16GB RDIMM 288-Pin DDR4 Memory Module",
    "Dell",
    "server-memory",
    792.75, undefined,
    "Dell 16GB RDIMM 288-pin DDR4 registered server memory module.",
    { "Capacity": "16GB", "Type": "RDIMM", "Pins": "288", "Generation": "DDR4" }
  ),
  makeProduct(
    "DELL-A2257179",
    "Dell A2257179 8GB Kit (2x4GB) FB-DIMM 240-Pin Memory",
    "Dell",
    "server-memory",
    173.25, undefined,
    "Dell 8GB (2x4GB) Fully Buffered DIMM 240-pin DDR2 server memory kit.",
    { "Capacity": "8GB (2x4GB)", "Type": "FB-DIMM", "Pins": "240" }
  ),
  makeProduct(
    "DELL-A8475624",
    "Dell A8475624 8GB RDIMM 240-Pin Memory Module",
    "Dell",
    "server-memory",
    173.25, undefined,
    "Dell 8GB RDIMM 240-pin registered server memory module.",
    { "Capacity": "8GB", "Type": "RDIMM", "Pins": "240" }
  ),
  makeProduct(
    "DELL-A3138306",
    "Dell A3138306 16GB RDIMM 240-Pin Memory Module",
    "Dell",
    "server-memory",
    239.40, undefined,
    "Dell 16GB RDIMM 240-pin registered memory for Dell PowerEdge servers.",
    { "Capacity": "16GB", "Type": "RDIMM", "Pins": "240" }
  ),
  makeProduct(
    "HPE-500203-061",
    "HPE 500203-061 4GB RDIMM 240-Pin Memory Module",
    "HPE",
    "server-memory",
    173.25, undefined,
    "HPE 4GB RDIMM 240-pin DDR3 registered server memory module.",
    { "Capacity": "4GB", "Type": "RDIMM", "Pins": "240", "Generation": "DDR3" }
  ),
  makeProduct(
    "DELL-X1562",
    "Dell X1562 1GB RDIMM 240-Pin Memory Module",
    "Dell",
    "server-memory",
    173.25, undefined,
    "Dell 1GB RDIMM 240-pin registered server memory module.",
    { "Capacity": "1GB", "Type": "RDIMM", "Pins": "240" }
  ),
  makeProduct(
    "KNG-KTD-PE3138-4G",
    "Kingston KTD-PE3138/4G 4GB DDR3-1333 Server Memory",
    "Kingston",
    "server-memory",
    173.25, undefined,
    "Kingston 4GB DDR3-1333 server memory compatible with Dell PowerEdge servers.",
    { "Capacity": "4GB", "Speed": "DDR3-1333", "Type": "RDIMM" }
  ),
  makeProduct(
    "DELL-116V2",
    "Dell 116V2 8GB RDIMM 240-Pin Memory Module",
    "Dell",
    "server-memory",
    173.25, undefined,
    "Dell 8GB RDIMM 240-pin registered server memory.",
    { "Capacity": "8GB", "Type": "RDIMM", "Pins": "240" }
  ),
  makeProduct(
    "HPE-452265-B21",
    "HPE 452265-B21 8GB Kit (2x4GB) FB-DIMM 240-Pin Memory",
    "HPE",
    "server-memory",
    173.25, undefined,
    "HPE 8GB (2x4GB) Fully Buffered DIMM 240-pin server memory kit.",
    { "Capacity": "8GB (2x4GB)", "Type": "FB-DIMM", "Pins": "240" }
  ),
  makeProduct(
    "DELL-P134G",
    "Dell P134G 8GB RDIMM 240-Pin Memory Module",
    "Dell",
    "server-memory",
    173.25, undefined,
    "Dell 8GB RDIMM 240-pin registered server memory module.",
    { "Capacity": "8GB", "Type": "RDIMM", "Pins": "240" }
  ),

  // ── POWER SUPPLIES ────────────────────────────────────────────────────────
  makeProduct(
    "DELTA-DPST1000EB",
    "Delta DPST-1000EB A Avaya 1000W Switching Power Supply",
    "Delta",
    "power-supplies",
    386.40, undefined,
    "Delta 1000W switching power supply used in Avaya enterprise networking equipment.",
    { "Wattage": "1000W", "Type": "Switching", "Compatible": "Avaya" }
  ),
  makeProduct(
    "HP-406393-001",
    "HP 406393-001 575-Watt Redundant Power Supply for DL380 Gen4",
    "HP",
    "power-supplies",
    186.90, undefined,
    "HP 575W redundant hot-plug power supply for ProLiant DL380 Gen4 servers.",
    { "Wattage": "575W", "Type": "Redundant Hot-Plug", "Compatible": "HP ProLiant DL380 Gen4" }
  ),
  makeProduct(
    "HPE-HSTNS-PC41-1",
    "HPE HSTNS-PC41-1 800-Watt Power Supply",
    "HPE",
    "power-supplies",
    186.90, undefined,
    "HPE 800W Flex Slot hot-plug power supply for HPE ProLiant servers.",
    { "Wattage": "800W", "Type": "Hot-Plug Flex Slot" }
  ),
  makeProduct(
    "DELL-450-ADHQ",
    "Dell 450-ADHQ 1600-Watt Power Supply",
    "Dell",
    "power-supplies",
    186.90, undefined,
    "Dell 1600W platinum-level redundant power supply for PowerEdge servers.",
    { "Wattage": "1600W", "Type": "Redundant", "Efficiency": "Platinum" }
  ),
  makeProduct(
    "DELL-D09YF",
    "Dell D09YF 250-Watt Power Supply",
    "Dell",
    "power-supplies",
    186.90, undefined,
    "Dell 250W power supply for OptiPlex desktop systems.",
    { "Wattage": "250W", "Type": "Standard" }
  ),
  makeProduct(
    "DELL-450-AENU",
    "Dell 450-AENU 2000-Watt Platinum Redundant Power Supply",
    "Dell",
    "power-supplies",
    186.90, undefined,
    "Dell 2000W 200/240V platinum redundant power supply for high-density servers.",
    { "Wattage": "2000W", "Type": "Redundant", "Efficiency": "Platinum", "Voltage": "200-240V" }
  ),
  makeProduct(
    "DELL-K7WDP",
    "Dell K7WDP 2000-Watt Platinum Redundant Power Supply",
    "Dell",
    "power-supplies",
    186.90, undefined,
    "Dell 2000W redundant platinum power supply module.",
    { "Wattage": "2000W", "Type": "Redundant", "Efficiency": "Platinum" }
  ),
  makeProduct(
    "DELL-FWFCY",
    "Dell FWFCY 550-Watt Redundant Power Supply",
    "Dell",
    "power-supplies",
    186.90, undefined,
    "Dell 550W redundant hot-plug power supply for PowerEdge servers.",
    { "Wattage": "550W", "Type": "Redundant Hot-Plug" }
  ),
  makeProduct(
    "DELTA-NPS885AB",
    "Delta NPS-885AB 870-Watt Redundant Power Supply for PowerEdge R710",
    "Delta",
    "power-supplies",
    194.25, undefined,
    "Delta 870W redundant hot-swap power supply for Dell PowerEdge R710 servers.",
    { "Wattage": "870W", "Type": "Redundant Hot-Swap", "Compatible": "Dell PowerEdge R710" }
  ),
  makeProduct(
    "HP-613763-001",
    "HP 613763-001 240-Watt Power Supply",
    "HP",
    "power-supplies",
    199.50, undefined,
    "HP 240W power supply for ProLiant ML110 and similar small servers.",
    { "Wattage": "240W", "Type": "Standard" }
  ),
  makeProduct(
    "DELL-M619F",
    "Dell M619F 235-Watt Power Supply",
    "Dell",
    "power-supplies",
    199.50, undefined,
    "Dell 235W power supply for OptiPlex desktop systems.",
    { "Wattage": "235W", "Type": "Standard" }
  ),
  makeProduct(
    "DELL-CC6WF",
    "Dell CC6WF 1100-Watt Power Supply",
    "Dell",
    "power-supplies",
    199.50, undefined,
    "Dell 1100W hot-plug power supply for PowerEdge rack servers.",
    { "Wattage": "1100W", "Type": "Hot-Plug" }
  ),
];

// ---------------------------------------------------------------------------
// Seed function
// ---------------------------------------------------------------------------
async function seed() {
  console.log("\n🌱  Connecting to MongoDB…");
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const db = client.db(MONGODB_DB);

  try {
    // -- Categories ----------------------------------------------------------
    console.log("📂  Seeding categories…");
    const catCol = db.collection("categories");

    // Drop existing docs with the same slugs to avoid duplicates
    const catSlugs = categories.map((c) => c.slug);
    await catCol.deleteMany({ slug: { $in: catSlugs } });

    const catResult = await catCol.insertMany(categories);
    console.log(`   ✅  Inserted ${catResult.insertedCount} categories.`);

    // -- Products ------------------------------------------------------------
    console.log("📦  Seeding products…");
    const prodCol = db.collection("products");

    const prodSlugs = products.map((p) => p.slug);
    await prodCol.deleteMany({ slug: { $in: prodSlugs } });

    const prodResult = await prodCol.insertMany(products);
    console.log(`   ✅  Inserted ${prodResult.insertedCount} products.`);

    // -- Summary -------------------------------------------------------------
    console.log("\n🎉  Seed complete!");
    console.log(`   Categories: ${catResult.insertedCount}`);
    console.log(`   Products  : ${prodResult.insertedCount}`);
    console.log(
      `\n   Categories seeded: ${categories.map((c) => c.name).join(", ")}`
    );
  } finally {
    await client.close();
  }
}

seed().catch((err) => {
  console.error("❌  Seed failed:", err);
  process.exit(1);
});
