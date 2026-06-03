import { Routes } from '@angular/router';
import { EmpresaListComponent } from './components/empresa-list/empresa-list.component';
import { EmpresaFormComponent } from './components/empresa-form/empresa-form.component';

export const routes: Routes = [
  { path: '', redirectTo: '/lista', pathMatch: 'full' },
  { path: 'lista', component: EmpresaListComponent },
  { path: 'crear', component: EmpresaFormComponent },
  { path: '**', redirectTo: '/lista' }
];
