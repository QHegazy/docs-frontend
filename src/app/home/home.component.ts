// home.component.ts
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Subject, takeUntil, catchError, finalize } from 'rxjs';
import { DocService } from '../../services/docService/doc.service';
import { DialogComponentComponent } from '../dialog-component/dialog-component.component';

interface Document {
  id: string;
  title: string;
  lastModified: Date;
  type: 'recent' | 'owned' | 'shared';
}

type FilterType = 'none' | 'owned' | 'edited' | 'read';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatDialogModule,
    MatSnackBarModule,
    FormsModule,
  ],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private docService = inject(DocService);
  private snackBar = inject(MatSnackBar);

  isLoading = false;
  list: number[] = [1, 2, 3, 4, 5];
  selectedFilter: FilterType = 'owned';
  errorMessage: string | null = null;

  constructor(public dialog: MatDialog) {}

  ngOnInit() {
    this.loadDocuments();
  }

  loadDocuments() {
    this.isLoading = true;
    this.errorMessage = null;

    // Simulate loading time
    setTimeout(() => {
      this.isLoading = false;
    }, 1500);

    // Actual implementation would look like this:
    /*
    this.docService.getDocuments(this.selectedFilter)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          this.errorMessage = 'Failed to load documents. Please try again.';
          console.error('Error loading documents:', error);
          return [];
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe(documents => {
        this.list = documents;
      });
    */
  }

  openDialog(item: number): void {
    const dialogRef = this.dialog.open(DialogComponentComponent, {
      width: '600px',
      maxWidth: '90vw',
      data: {
        title: `Create New Document`,
        permission: [],
      },
      disableClose: true,
      autoFocus: true,
    });

    dialogRef
      .afterClosed()
      .pipe(takeUntil(this.destroy$))
      .subscribe((result) => {
        if (result) {
          this.createNewDocument(result);
        }
      });
  }

  createNewDocument(data: object) {
    this.isLoading = true;
    this.docService
      .createDoc(data)
      .pipe(
        takeUntil(this.destroy$),
        catchError((error) => {
          this.showError('Failed to create document. Please try again.');
          console.error('Document creation error:', error);
          throw error;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe({
        next: (response) => {
          if (response.status === 200) {
            this.showSuccess('Document created successfully');
            console.log(response.data.mongoID);
            window.location.href = `doc/${response.data.mongoID}`;
          } else {
            this.showError('Failed to create document');
          }
        },
      });
  }

  onFilterChange(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.selectedFilter = select.value as FilterType;
    this.loadDocuments();
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['success-snackbar'],
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      horizontalPosition: 'right',
      verticalPosition: 'top',
      panelClass: ['error-snackbar'],
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

// home.component.scss
