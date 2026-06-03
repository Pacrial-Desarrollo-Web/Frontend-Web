import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EmpresaService } from '../../services/empresa.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-empresa-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './empresa-form.component.html',
  styleUrl: './empresa-form.component.css'
})
export class EmpresaFormComponent implements OnInit {
  formulario!: FormGroup;
  enviando = false;
  mensajeError = '';
  mensajeExito = '';

  constructor(
    private fb: FormBuilder,
    private empresaService: EmpresaService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.inicializarFormulario();
  }

  inicializarFormulario(): void {
    this.formulario = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      nit: ['', [Validators.required, Validators.minLength(5)]],
      ciudad: ['', [Validators.required, Validators.minLength(3)]],
      sector: ['', [Validators.required, Validators.minLength(3)]]
    });
  }

  enviar(): void {
    if (this.formulario.invalid) {
      this.mensajeError = 'Por favor, completa todos los campos correctamente.';
      return;
    }

    this.mensajeError = '';
    this.enviando = true;

    this.empresaService.crearEmpresa(this.formulario.value).subscribe({
      next: (respuesta) => {
        this.formulario.reset();
        this.enviando = false;
        this.router.navigate(['/lista']);
      },
      error: (error) => {
        this.mensajeError = 'Error al crear la empresa. Intenta de nuevo.';
        this.enviando = false;
        console.error(error);
      }
    });
  }

  limpiar(): void {
    this.formulario.reset();
    this.mensajeError = '';
    this.mensajeExito = '';
  }
}
