import {
  Component,
  Inject,
  PLATFORM_ID,
  AfterViewInit,
  ViewEncapsulation,
  inject,
  OnInit,
} from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import Quill from 'quill';
import { DocServiceCommunication } from '../../services/docServiceCommunication/doc-service.service';
import { ActivatedRoute } from '@angular/router';
import { interval, timeout, timer } from 'rxjs';
import { AuthService } from '../../services/authService/auth.service';

@Component({
  selector: 'app-quill-editor',
  standalone: true,
  imports: [],
  templateUrl: './quill-editor.component.html',
  encapsulation: ViewEncapsulation.None,
  styleUrl: './quill-editor.component.scss',
})
export class QuillEditorComponent implements AfterViewInit, OnInit {
  private quill!: Quill;
  id!: string;
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
    this.id = this.route.snapshot.params['id'];
    this.doc_service.joinroom(this.id);
  }

  async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      // this.auth.login().subscribe({
      //   next: (data) => {
      //     console.log(data);
      //     return true;
      //   },
      //   error: (err) => {
      //     console.error('Login failed', err);
      //   },
      // });
      await this.loadQuill();
      this.doc_service.getDocMessage().subscribe({
        next: (data) => {
          console.log(data, 'Document data received');
          if (data && data.ops) {
            this.quill.setContents(data); // Set contents only if data is valid
          } else {
            console.error('Invalid data received:', data);
          }
        },
        error: (error) => {
          console.error('Error fetching document message:', error);
        },
      });
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

      // Add the 'text-change' listener
      this.quill.on('text-change', this.sendData);
    } catch (error) {
      console.error('Error loading Quill:', error);
    }
  }

  sendData(delta: any, oldDelta: any, source: string) {
    if (source === 'api') {
      return;
    } else {
      this.doc_service.sendtoroom(this.id, delta);
      this.doc_service.sendMessage(delta);
      this.save()
    }
  }
  save() {
    this.doc_service.saveDocById("670e7027d2ebe79b16092671", this.quill.getContents());
    console.log("saved darar")
    console.log(this.quill.getContents());
  }
  
}
