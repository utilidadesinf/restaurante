export type MesaEstado = 'libre' | 'ocupada' | 'esperando_limpieza';

export interface Mesa {
  id: string;
  numeroMesa: number;
  estado: MesaEstado;
  cuentaActivaId?: string;
}

export interface Plato {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  imagenUrl: string;
  categoria: string;
  activo: boolean;
}

export interface Cuenta {
  id: string;
  mesaId: string;
  totalAcumulado: number;
  pagado: boolean;
  fechaPago?: string;
  createdAt: string;
}

export type PedidoEstado = 'pendiente' | 'preparando' | 'listo' | 'entregado';

export interface PedidoItem {
  platoId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

export interface Pedido {
  id: string;
  cuentaId: string;
  mesaNumero: number;
  estadoCocina: PedidoEstado;
  horaEnvio: string; // ISO string
  horaCompletado?: string; // ISO string
  items: PedidoItem[];
}
