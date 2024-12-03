import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewEncapsulation,
  inject,
  OnInit,
  signal,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Quill from 'quill';
import { DocServiceCommunication } from '../../services/docServiceCommunication/doc-service.service';
import { ActivatedRoute } from '@angular/router';
import { interval, timeout, timer } from 'rxjs';
import { AuthService } from '../../services/authService/auth.service';

import { UUID } from 'crypto';
import { QuillDoc } from '../newTypes/doc';
import { CapitalizePipe } from '../../pipes/capitalize.pipe';
import { BrowserDatabase } from '../db/BrowserDatabase';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [CapitalizePipe],
  templateUrl: './quill-editor.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrls: ['./quill-editor.component.scss'],
})
export class QuillEditorComponent implements AfterViewInit, OnInit {
  quilDoc = signal<QuillDoc | null>(null);
  private db!: BrowserDatabase;
  private debounceTimeout: NodeJS.Timeout | null = null;
  private debounceDelay = 1000;
  private quill!: Quill;
  id!: UUID;
  doc_service = inject(DocServiceCommunication);
  auth: AuthService = inject(AuthService);
  message: any = 'wq';
  randomCookie: any = 'qwe';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) {
    this.sendData = this.sendData.bind(this); // Binding the sendData method to ensure 'this' works properly
  }

  ngOnInit(): void {
    this.id = this.route.snapshot.params['id'] as UUID;
    this.doc_service.syncWithServer(this.id).subscribe({
      next: (data) => {
        this.quilDoc.set(data);
      },
      error: (err) => {
        console.error('Error syncing with server:', err);
      },
    });

    this.doc_service.joinroom(this.id);

    // Initialize the IndexedDB for caching data locally
    this.db = new BrowserDatabase();
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      await this.loadQuill();
      await this.retrieveDoc();
      const messages = this.doc_service.getRoomMessage();
      messages.subscribe((message: any) => {
        if (this.quill) {
          this.quill.updateContents(message);
        }
      });
    }
  }

  private async loadQuill(): Promise<void> {
    try {
      const Quill = (await import('quill')).default;
      const BlotFormatter = await import('quill-blot-formatter');
      Quill.register('modules/blotFormatter', BlotFormatter.default);

      const toolbarOptions = {
        container: [
          [{ font: [] }],
          [{ header: [1, 2, 3, 4, 5, 6, false] }],
          [{ size: ['small', true, 'large', 'huge'] }],
          ['bold', 'italic', 'underline', 'strike', 'blockquote'],
          [{ color: [] }, { background: [] }],
          [
            { list: 'ordered' },
            { list: 'bullet' },
            { indent: '-1' },
            { indent: '+1' },
          ],
          [{ direction: 'rtl' }, { align: [] }],
          [{ header: 1 }, { header: 2 }, 'blockquote', 'code-block'],
          [{ script: 'sub' }, { script: 'super' }],
          ['link', 'image', 'video', 'formula', 'clean'],
        ],
      };

      this.quill = new Quill('#editor', {
        modules: {
          blotFormatter: {},
          toolbar: toolbarOptions,
          history: {
            delay: 1000,
            maxStack: 500,
            userOnly: true,
          },
        },
        placeholder: 'just type here...',
        theme: 'snow',
      });

      // Add the 'text-change' listener with debouncing
      this.quill.on('text-change', this.sendData);
    } catch (error) {
      console.error('Error loading Quill:', error);
    }
  }

  // Debounced sendData method
  sendData(delta: any, oldDelta: any, source: string) {
    if (source === 'api') {
      return; // Ignore changes from the API
    } else {
      if (this.debounceTimeout) {
        clearTimeout(this.debounceTimeout);
      }

      // Save data locally in IndexedDB first
      this.db.saveDoc(this.id, delta);

      // Debounce the call to sync data with the server
      this.debounceTimeout = setTimeout(() => {
        this.doc_service.sendtoroom(this.id, delta); // Send delta to room (server)
        this.save(); // Save changes to the server
      }, this.debounceDelay); // Adjust debounce delay (1 second)
    }
  }

  async save() {
    const mongoId = this.quilDoc()?.mongoId;
    if (mongoId) {
      this.doc_service.saveDocById(mongoId, this.quill.getContents());
    } else {
      console.error('Document ID is missing');
    }
  }

  async retrieveDoc() {
    const mongoId = this.quilDoc()?.mongoId;
    if (mongoId) {
      this.doc_service.getDocMessage(mongoId).subscribe({
        next: (data) => {
          console.log(data, 'Document data received');
          if (data && data.ops) {
            this.quill.setContents(data);
          } else {
            console.error('Invalid data received:', data);
          }
        },
        error: (error) => {
          console.error('Error fetching document message:', error);
        },
      });
    } else {
      console.error('Document ID is missing');
    }
  }
}
