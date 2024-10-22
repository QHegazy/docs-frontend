import { Component, inject } from '@angular/core';
import { DocService } from '../../services/docService/doc.service';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponentComponent } from '../dialog-component/dialog-component.component';

@Component({
  selector: 'app-home',
  standalone: true,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent {
  private doc = inject(DocService);
  public list = [1, 2, 3, 4, 5];

  constructor(public dialog: MatDialog) {}

  createDoc() {
    this.doc.createDoc('test').subscribe((data) => {
      console.log('Document created:', data);
    });
  }

  openDialog(item: number): void {
    const dialogRef = this.dialog.open(DialogComponentComponent, {
      width: '600px',
      maxWidth: '90vw', 
      data: { title: `You clicked on item ${item}`, permission: [] },
    });

    dialogRef.afterClosed().subscribe((result) => {
      console.log('The dialog was closed');
      if (result) {
        console.log('Dialog result:', result);
      }
    });
  }
}
