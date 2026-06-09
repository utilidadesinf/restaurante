import { Plato, Mesa } from './types';

export const INITIAL_PLATOS: Plato[] = [
  {
    id: '1',
    nombre: 'Gyozas de Cerdo Crujientes',
    descripcion: '5 empanadillas japonesas rellenas de carne de cerdo y verduras, cocinadas al vapor y doradas a la plancha. Acompañadas de salsa ponzu.',
    precio: 7.90,
    imagenUrl: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=500&q=80',
    categoria: 'Entradas',
    activo: true
  },
  {
    id: '2',
    nombre: 'Edamame Spicy',
    descripcion: 'Vainas de soja fresca al vapor salteadas con sal marina en escamas, aceite de sésamo tostado y un toque picante de chile sishitō.',
    precio: 5.50,
    imagenUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=80',
    categoria: 'Entradas',
    activo: true
  },
  {
    id: '3',
    nombre: 'Ebi Tempura Golden',
    descripcion: '4 langostinos gigantes rebozados en panko japonés súper crujiente. Servidos con salsa agridulce y alioli coreano picante.',
    precio: 10.90,
    imagenUrl: 'https://images.unsplash.com/photo-1581184953903-ee1b6ebcbfea?auto=format&fit=crop&w=500&q=80',
    categoria: 'Entradas',
    activo: true
  },
  {
    id: '4',
    nombre: 'Philly Salmon Roll',
    descripcion: '8 piezas de bocado rellenas de salmón fresco noruego, queso crema sedoso y aguacate maduro, cubiertas con sésamo negro tostado.',
    precio: 12.50,
    imagenUrl: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=500&q=80',
    categoria: 'Rolls',
    activo: true
  },
  {
    id: '5',
    nombre: 'Dragon Roll Especial',
    descripcion: '8 piezas premium rellenas de langostino tempura y pepino, cubiertas con láminas finas de anguila ahumada, aguacate y salsa unagi dulce.',
    precio: 15.90,
    imagenUrl: 'https://images.unsplash.com/photo-1611143669185-af224c5e3252?auto=format&fit=crop&w=500&q=80',
    categoria: 'Rolls',
    activo: true
  },
  {
    id: '6',
    nombre: 'Avocado Green Roll (Vegano)',
    descripcion: '8 piezas saludables con boniato caramelizado tempura, pepino crujiente y espárrago verde, cubierto con una corona de aguacate y sésamo.',
    precio: 11.50,
    imagenUrl: 'https://images.unsplash.com/photo-1553621042-f6e147245754?auto=format&fit=crop&w=500&q=80',
    categoria: 'Rolls',
    activo: true
  },
  {
    id: '7',
    nombre: 'Limonada de Jengibre y Menta',
    descripcion: 'Bebida premium ultra refrescante de jugo de limón natural exprimido, ralladura de jengibre fresco, hojas de menta maceradas y miel orgánica.',
    precio: 4.20,
    imagenUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
    categoria: 'Bebidas',
    activo: true
  },
  {
    id: '8',
    nombre: 'Cerveza Japonesa Sapporo',
    descripcion: 'Lager premium japonesa clásica, fresca y equilibrada con un acabado limpio y amargor suave, ideal para maridar con sushi.',
    precio: 4.80,
    imagenUrl: 'https://images.unsplash.com/photo-1532634922-8fe0b757fb13?auto=format&fit=crop&w=500&q=80',
    categoria: 'Bebidas',
    activo: true
  },
  {
    id: '9',
    nombre: 'Té Verde Matcha Orgánico',
    descripcion: 'Taza de té tradicional japonés preparado con polvo de matcha puro de grado ceremonial, rico en antioxidantes y con agradable aroma herbáceo.',
    precio: 3.50,
    imagenUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
    categoria: 'Bebidas',
    activo: true
  },
  {
    id: '10',
    nombre: 'Mochis Variados Artesanales',
    descripcion: 'Trío de pastelitos tradicionales japoneses de arroz glutinoso de textura elástica y suave, rellenos de helado de Té Verde, Mango y Chocolate belga.',
    precio: 6.90,
    imagenUrl: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=500&q=80',
    categoria: 'Postres',
    activo: true
  },
  {
    id: '11',
    nombre: 'Tempura de Helado y Cacao',
    descripcion: 'Bola cremosa de helado de vainilla natural envuelta en bizcocho esponjoso, frita rápidamente en tempura dulce crujiente. Bañada con hilos de chocolate amargo.',
    precio: 7.50,
    imagenUrl: 'https://images.unsplash.com/photo-1505394033-41a5059bb09b?auto=format&fit=crop&w=500&q=80',
    categoria: 'Postres',
    activo: true
  }
];

export const INITIAL_MESAS: Mesa[] = [
  { id: 'm1', numeroMesa: 1, estado: 'libre' },
  { id: 'm2', numeroMesa: 2, estado: 'ocupada', cuentaActivaId: 'c2' }, // pre-occupied for dynamic showcase
  { id: 'm3', numeroMesa: 3, estado: 'libre' },
  { id: 'm4', numeroMesa: 4, estado: 'libre' },
  { id: 'm5', numeroMesa: 5, estado: 'esperando_limpieza' }, // pre-dirty for dynamic showcase
  { id: 'm6', numeroMesa: 6, estado: 'libre' },
  { id: 'm7', numeroMesa: 7, estado: 'libre' },
  { id: 'm8', numeroMesa: 8, estado: 'libre' },
  { id: 'm9', numeroMesa: 9, estado: 'libre' },
  { id: 'm10', numeroMesa: 10, estado: 'libre' },
  { id: 'm11', numeroMesa: 11, estado: 'libre' },
  { id: 'm12', numeroMesa: 12, estado: 'libre' }
];

export const CATEGORIAS = ['Entradas', 'Rolls', 'Bebidas', 'Postres'];
