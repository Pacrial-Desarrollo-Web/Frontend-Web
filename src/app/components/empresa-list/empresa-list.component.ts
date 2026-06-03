import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { EmpresaService } from '../../services/empresa.service';
import { Empresa } from '../../models/empresa.model';

@Component({
  selector: 'app-empresa-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './empresa-list.component.html',
  styleUrl: './empresa-list.component.css'
})
export class EmpresaListComponent implements OnInit {
  empresas: Empresa[] = [];
  cargando = true;
  mensajeError = '';
  empresaSeleccionada: number | null = null;

  constructor(private empresaService: EmpresaService) {}

  ngOnInit(): void {
    this.cargarEmpresas();
  }

  cargarEmpresas(): void {
    this.cargando = true;
    this.mensajeError = '';

    this.empresaService.obtenerEmpresas().subscribe({
      next: (data) => {
        this.empresas = data;
        this.cargando = false;
      },
      error: (error) => {
        this.mensajeError = 'Error al cargar las empresas. Intenta de nuevo.';
        this.cargando = false;
        console.error(error);
      }
    });
  }

  eliminarEmpresa(id: number | undefined): void {
    if (!id) return;

    if (!confirm('¿Estás seguro de que deseas eliminar esta empresa?')) {
      return;
    }

    this.empresaService.eliminarEmpresa(id).subscribe({
      next: () => {
        this.cargarEmpresas();
      },
      error: (error) => {
        this.mensajeError = 'Error al eliminar la empresa.';
        console.error(error);
      }
    });
  }

  recargar(): void {
    this.cargarEmpresas();
  }
}
