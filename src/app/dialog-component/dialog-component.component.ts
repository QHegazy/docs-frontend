import { Component, inject } from '@angular/core';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'dialog-component',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
  ],
  templateUrl: './dialog-component.component.html',
  styleUrl: './dialog-component.component.scss',
})
export class DialogComponentComponent {
  readonly dialogRef = inject(MatDialogRef);
  titleLength = 0;

  createDocument = new FormGroup({
    title: new FormControl('', [
      Validators.required,
      Validators.minLength(3),
      Validators.maxLength(50),
    ]),
    permission: new FormControl('private-edit', [Validators.required]),
  });

  updateTitleLength(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.titleLength = input.value.length;
  }

  onNoClick(): void {
    this.dialogRef.close();
  }
}
