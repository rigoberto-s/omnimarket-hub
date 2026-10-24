import { sql } from "drizzle-orm";
import { db } from "./index";
import { orders, products } from "./schema";

// Generador pseudoaleatorio con semilla fija: siempre produce los mismos datos
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const STATUSES = ["pending", "preparing", "shipped", "delivered"] as const;

const CUSTOMERS = [
  "Ana Torres", "Luis Hernández", "María García", "Carlos Ramírez",
  "Sofía Morales", "Jorge Castillo", "Valeria Núñez", "Diego Ortega",
  "Paola Jiménez", "Andrés Vargas", "Fernanda Ríos", "Ricardo Salinas",
  "Daniela Cruz", "Miguel Ángel Soto", "Lucía Mendoza", "Emilio Aguilar",
  "Camila Reyes", "Hugo Navarro", "Isabel Cortés", "Tomás Herrera",
];

// Montos en centavos. El costo siempre es menor al precio.
const PRODUCTS = [
  { name: "Audífonos Bluetooth", sku: "AUD-001", category: "Electrónica", priceCents: 79900, costCents: 48000, stock: 120 },
  { name: "Cargador USB-C 65W", sku: "CAR-002", category: "Electrónica", priceCents: 54900, costCents: 29000, stock: 200 },
  { name: "Mouse Inalámbrico", sku: "MOU-003", category: "Computación", priceCents: 34900, costCents: 18000, stock: 150 },
  { name: "Teclado Mecánico", sku: "TEC-004", category: "Computación", priceCents: 129900, costCents: 78000, stock: 80 },
  { name: "Monitor 24 pulgadas", sku: "MON-005", category: "Computación", priceCents: 289900, costCents: 195000, stock: 40 },
  { name: "Webcam HD", sku: "WEB-006", category: "Computación", priceCents: 89900, costCents: 52000, stock: 90 },
  { name: "Bocina Portátil", sku: "BOC-007", category: "Electrónica", priceCents: 109900, costCents: 64000, stock: 110 },
  { name: "Smartwatch Deportivo", sku: "SMA-008", category: "Electrónica", priceCents: 219900, costCents: 140000, stock: 60 },
  { name: "Mochila para Laptop", sku: "MOC-009", category: "Accesorios", priceCents: 59900, costCents: 28000, stock: 180 },
  { name: "Funda para Celular", sku: "FUN-010", category: "Accesorios", priceCents: 19900, costCents: 6000, stock: 400 },
  { name: "Lámpara LED de Escritorio", sku: "LAM-011", category: "Hogar", priceCents: 44900, costCents: 21000, stock: 130 },
  { name: "Licuadora 600W", sku: "LIC-012", category: "Hogar", priceCents: 79900, costCents: 46000, stock: 70 },
  { name: "Cafetera Eléctrica", sku: "CAF-013", category: "Hogar", priceCents: 99900, costCents: 58000, stock: 65 },
  { name: "Silla Ergonómica", sku: "SIL-014", category: "Muebles", priceCents: 399900, costCents: 250000, stock: 30 },
  { name: "Escritorio Plegable", sku: "ESC-015", category: "Muebles", priceCents: 249900, costCents: 150000, stock: 35 },
  { name: "Disco Duro Externo 1TB", sku: "DIS-016", category: "Computación", priceCents: 139900, costCents: 90000, stock: 75 },
  { name: "Memoria USB 64GB", sku: "USB-017", category: "Computación", priceCents: 17900, costCents: 8000, stock: 300 },
  { name: "Cámara de Seguridad WiFi", sku: "CAM-018", category: "Hogar", priceCents: 119900, costCents: 68000, stock: 85 },
  { name: "Power Bank 20000mAh", sku: "POW-019", category: "Electrónica", priceCents: 69900, costCents: 36000, stock: 160 },
  { name: "Tapete para Mouse XL", sku: "TAP-020", category: "Accesorios", priceCents: 24900, costCents: 9000, stock: 220 },
];

export async function seedDatabase() {
  const rand = mulberry32(42);
  const pick = <T>(arr: readonly T[]): T => arr[Math.floor(rand() * arr.length)];

  const DAY = 24 * 60 * 60 * 1000;
  const now = Date.now();

  // Todo en una transacción: si algo falla, la base no se queda vacía a medias
  return db.transaction(async (tx) => {
    await tx.execute(sql`TRUNCATE TABLE orders, products RESTART IDENTITY CASCADE`);

    const insertedProducts = await tx.insert(products).values(PRODUCTS).returning();

    const rows = Array.from({ length: 300 }, (_, i) => {
      const product = pick(insertedProducts);
      const quantity = 1 + Math.floor(rand() * 5);
      // El pedido id = 1 es el más reciente, para que siempre salga en el Kanban (limit=200)
      const createdAt = i === 0 ? new Date(now) : new Date(now - Math.floor(rand() * 90 * DAY));
      return {
        customer: pick(CUSTOMERS),
        productId: product.id,
        quantity,
        totalCents: product.priceCents * quantity,
        costCents: product.costCents * quantity,
        // Contrato del equipo: el pedido id = 1 siempre queda en "pending"
        status: i === 0 ? ("pending" as const) : pick(STATUSES),
        createdAt,
        updatedAt: createdAt,
      };
    });

    await tx.insert(orders).values(rows);

    return { products: insertedProducts.length, orders: rows.length };
  });
}
